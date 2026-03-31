import "dotenv/config";
import express from "express";
import compression from "compression";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { runDailyAlertJob } from "../saas-routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";

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

  // SEO & Security headers
  app.use((_req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    // Cache-Control: HTML pages — no-cache so bots always get fresh content
    if (res.getHeader("Content-Type")?.toString().includes("text/html")) {
      res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
    }
    next();
  });

  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
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
