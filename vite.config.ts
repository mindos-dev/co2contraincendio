// ═══════════════════════════════════════════════════════════════════════════════
// OPERIS Command Center — Vite Configuration
// Projeto: CO₂ Contra Incêndio SaaS | D.G.O. — Dashboard de Governança
// Responsável: Aleixo (Technical Manager) | JULY AOG — Project Diamond
// ═══════════════════════════════════════════════════════════════════════════════
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";
import { defineConfig, type Plugin, type ViteDevServer } from "vite";

// =============================================================================
// OPERIS Debug Collector - Vite Plugin (apenas em desenvolvimento)
// Escreve logs do browser diretamente em arquivos para diagnóstico local
// =============================================================================

const PROJECT_ROOT = import.meta.dirname;
const LOG_DIR = path.join(PROJECT_ROOT, ".manus-logs");
const MAX_LOG_SIZE_BYTES = 1 * 1024 * 1024; // 1MB por arquivo de log
const TRIM_TARGET_BYTES = Math.floor(MAX_LOG_SIZE_BYTES * 0.6);

type LogSource = "browserConsole" | "networkRequests" | "sessionReplay";

function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}

function trimLogFile(logPath: string, maxSize: number) {
  try {
    if (!fs.existsSync(logPath) || fs.statSync(logPath).size <= maxSize) {
      return;
    }
    const content = fs.readFileSync(logPath, "utf-8");
    const lines = content.split("\n").filter(Boolean);
    let keptBytes = 0;
    const keptLines: string[] = [];
    for (let i = lines.length - 1; i >= 0; i--) {
      const lineBytes = Buffer.byteLength(lines[i], "utf-8") + 1;
      if (keptBytes + lineBytes > TRIM_TARGET_BYTES) break;
      keptLines.unshift(lines[i]);
      keptBytes += lineBytes;
    }
    fs.writeFileSync(logPath, keptLines.join("\n"), "utf-8");
  } catch {
    /* ignore trim errors */
  }
}

function writeToLogFile(source: LogSource, entries: unknown[]) {
  if (entries.length === 0) return;
  ensureLogDir();
  const logPath = path.join(LOG_DIR, `${source}.log`);
  const lines = entries.map((entry) => {
    const ts = new Date().toISOString();
    return `[${ts}] ${JSON.stringify(entry)}`;
  });
  fs.appendFileSync(logPath, `${lines.join("\n")}\n`, "utf-8");
  trimLogFile(logPath, MAX_LOG_SIZE_BYTES);
}

/**
 * Plugin de coleta de logs do browser (apenas em desenvolvimento)
 * - POST /__operis__/logs: Browser envia logs, escritos diretamente em arquivos
 * - Arquivos: browserConsole.log, networkRequests.log, sessionReplay.log
 * - Auto-truncado quando excede 1MB
 */
function operisDebugCollector(): Plugin {
  return {
    name: "operis-debug-collector",
    transformIndexHtml(html) {
      // Em produção, não injeta o script de debug
      if (process.env.NODE_ENV === "production") {
        return html;
      }
      return {
        html,
        tags: [
          {
            tag: "script",
            attrs: {
              src: "/__manus__/debug-collector.js",
              defer: true,
            },
            injectTo: "head",
          },
        ],
      };
    },
    configureServer(server: ViteDevServer) {
      // POST /__manus__/logs: Browser envia logs (compatibilidade com debug collector)
      server.middlewares.use("/__manus__/logs", (req, res, next) => {
        if (req.method !== "POST") {
          return next();
        }
        const handlePayload = (payload: any) => {
          if (payload.consoleLogs?.length > 0) {
            writeToLogFile("browserConsole", payload.consoleLogs);
          }
          if (payload.networkRequests?.length > 0) {
            writeToLogFile("networkRequests", payload.networkRequests);
          }
          if (payload.sessionEvents?.length > 0) {
            writeToLogFile("sessionReplay", payload.sessionEvents);
          }
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true }));
        };
        const reqBody = (req as { body?: unknown }).body;
        if (reqBody && typeof reqBody === "object") {
          try {
            handlePayload(reqBody);
          } catch (e) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: String(e) }));
          }
          return;
        }
        let body = "";
        req.on("data", (chunk) => {
          body += chunk.toString();
        });
        req.on("end", () => {
          try {
            const payload = JSON.parse(body);
            handlePayload(payload);
          } catch (e) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: String(e) }));
          }
        });
      });
    },
  };
}

// Importação condicional do plugin de desenvolvimento (não quebra em produção)
let jsxLocPlugin: () => Plugin;
try {
  const mod = await import("@builder.io/vite-plugin-jsx-loc");
  jsxLocPlugin = mod.default ?? (() => ({ name: "jsx-loc-noop" }));
} catch {
  jsxLocPlugin = () => ({ name: "jsx-loc-noop" });
}

// Plugins base — sempre ativos
const basePlugins: Plugin[] = [
  react(),
  tailwindcss(),
  operisDebugCollector(),
];

// Plugins de desenvolvimento — apenas em dev (não quebram o build de produção)
const isProduction = process.env.NODE_ENV === "production";
if (!isProduction) {
  try {
    basePlugins.push(jsxLocPlugin());
  } catch {
    // Plugin opcional — ignora se não disponível
  }
}

export default defineConfig({
  plugins: basePlugins,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  publicDir: path.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    host: true,
    // Hosts permitidos — inclui localhost e domínios de desenvolvimento
    allowedHosts: [
      "localhost",
      "127.0.0.1",
      ".local",
    ],
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
