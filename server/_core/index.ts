import "dotenv/config";
import express from "express";
import compression from "compression";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { runDailyAlertJob } from "../saas-routers";
import { createContext } from "./context";
import { registerStripeWebhook } from "../billing-webhook";
import { serveStatic, setupVite } from "./vite";
import { setupSwagger } from "../swagger";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Gzip compression — reduces page size by ~70%, improves Core Web Vitals
  app.use(compression({ level: 6, threshold: 1024 }));

  // Helmet — sets secure HTTP headers (XSS protection, clickjacking, MIME sniffing, HSTS)
  app.use(helmet({
    contentSecurityPolicy: false,     // Vite/React handles CSP via meta tags
    crossOriginEmbedderPolicy: false, // Required for external CDN assets (fonts, images)
  }));

  // Rate limiting — brute force protection on auth endpoints
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20,                   // max 20 requests per window per IP
    standardHeaders: true,     // Envia RateLimit-* headers (RFC 6585)
    legacyHeaders: false,
    message: { error: "Muitas tentativas. Aguarde 15 minutos antes de tentar novamente." },
    handler: (_req, res, _next, options) => {
      res.setHeader("Retry-After", Math.ceil(options.windowMs / 1000));
      res.status(options.statusCode).json(options.message);
    },
    skip: (req) => process.env.NODE_ENV === "development" && (req.ip === "::1" || req.ip === "127.0.0.1"),
  });
  app.use("/api/trpc/saas.auth.login", authLimiter);
  app.use("/api/trpc/saas.auth.register", authLimiter);
  app.use("/api/trpc/saas.auth.forgotPassword", authLimiter);

  // Upload rate limit — mais restritivo para uploads pesados
  const uploadLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 30,             // max 30 uploads/min por IP
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Limite de uploads atingido. Aguarde 1 minuto." },
    handler: (_req, res, _next, options) => {
      res.setHeader("Retry-After", Math.ceil(options.windowMs / 1000));
      res.status(options.statusCode).json(options.message);
    },
    skip: (req) => !req.path.startsWith("/api/"),
  });
  app.use("/api/trpc/saas.documents.upload", uploadLimiter);
  app.use("/api/trpc/saas.users.updateAvatar", uploadLimiter);

  // General API rate limit — 500 req/min para suportar 100+ usuários simultâneos
  const apiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 500,            // aumentado de 300 para 500 req/min por IP
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Limite de requisições atingido. Tente novamente em instantes." },
    handler: (_req, res, _next, options) => {
      res.setHeader("Retry-After", Math.ceil(options.windowMs / 1000));
      res.status(options.statusCode).json(options.message);
    },
    skip: (req) => !req.path.startsWith("/api/"),
  });
  app.use("/api/", apiLimiter);

  // Additional security & cache headers
  app.use((_req, res, next) => {
    res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    if (res.getHeader("Content-Type")?.toString().includes("text/html")) {
      res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
    }
    next();
  });

  // ⚠️ Stripe webhook MUST come BEFORE express.json() to preserve raw body
  registerStripeWebhook(app);

  // Body parser — 10mb for regular JSON, 20mb for file uploads (base64 encoded)
  app.use(express.json({ limit: "20mb" }));
  app.use(express.urlencoded({ limit: "20mb", extended: true }));

  // Health check endpoint — Modelo Modular Diamond
  // Retorna o status do Boot Orchestrator (wait-for-db.sh) para o frontend
  // O componente SyncStatus faz polling neste endpoint durante o boot
  app.get("/api/health", (_req, res) => {
    try {
      const fs = require("fs") as typeof import("fs");
      const bootStatusPath = "/tmp/operis-boot-status.json";
      if (fs.existsSync(bootStatusPath)) {
        const raw = fs.readFileSync(bootStatusPath, "utf-8");
        const bootStatus = JSON.parse(raw) as {
          phase: string;
          message: string;
          progress: number;
          ready: boolean;
          timestamp: string;
        };
        return res.json({
          status: bootStatus.ready ? "ok" : "booting",
          version: "2.0.0",
          timestamp: new Date().toISOString(),
          boot: bootStatus,
        });
      }
    } catch (_e) {
      // Se não conseguir ler o arquivo de status, assume que está pronto
    }
    // Padrão: sistema pronto (sem arquivo de status = já inicializou)
    return res.json({
      status: "ok",
      version: "2.0.0",
      timestamp: new Date().toISOString(),
      boot: {
        phase: "ready",
        message: "OPERIS Command Center operacional",
        progress: 100,
        ready: true,
      },
    });
  });

  // Swagger / OpenAPI documentation
  setupSwagger(app);

  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  // Google Search Console verification file — must be served BEFORE SPA fallback
  app.get("/googled35a310244e2041d.html", (_req, res) => {
    res.setHeader("Content-Type", "text/html");
    res.send("google-site-verification: googled35a310244e2041d.html");
  });

  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);

// ─── Scheduler diário de alertas (07:00 BRT = 10:00 UTC) ─────────────────────
function scheduleDailyAlerts() {
  const now = new Date();
  const next = new Date();
  next.setUTCHours(10, 0, 0, 0); // 07:00 BRT
  if (next <= now) next.setUTCDate(next.getUTCDate() + 1);
  const msUntilNext = next.getTime() - now.getTime();
  setTimeout(() => {
    runDailyAlertJob().then(r => console.log("[AlertJob] Concluído:", r));
    setInterval(() => {
      runDailyAlertJob().then(r => console.log("[AlertJob] Concluído:", r));
    }, 24 * 60 * 60 * 1000);
  }, msUntilNext);
  console.log(`[AlertJob] Agendado para ${next.toISOString()} (${Math.round(msUntilNext / 60000)} min até próxima execução)`);
}
scheduleDailyAlerts();
