import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import pg from "pg";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { initializeCronJobs } from "./cron-jobs";

const app = express();
app.set('trust proxy', true); // Enable accurate client IPs for rate limiting on Replit

console.log('🔧 Environment check:');
console.log('  REPLIT_DEV_DOMAIN:', process.env.REPLIT_DEV_DOMAIN);
console.log('  NODE_ENV:', process.env.NODE_ENV);

// PostgreSQL session store for persistent sessions
const PgStore = connectPgSimple(session);

// Configure PostgreSQL pool for sessions
const pgPool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

// Verificar SESSION_SECRET em produção (obrigatório por segurança)
if (process.env.NODE_ENV === 'production' && !process.env.SESSION_SECRET) {
  console.error('❌ ERRO CRÍTICO: SESSION_SECRET é obrigatório em produção. Configure esta variável de ambiente.');
  process.exit(1);
}

const sessionSecret = process.env.SESSION_SECRET || 'dev-secret-change-in-production-' + Math.random().toString(36);

if (!process.env.SESSION_SECRET) {
  console.warn('⚠️ SESSION_SECRET não configurado - usando segredo temporário. Configure SESSION_SECRET em produção!');
}

app.use(session({
  store: new PgStore({
    pool: pgPool,
    tableName: 'express_sessions',
    createTableIfMissing: true,
  }),
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    // Replit uses proxy/iframe even in production, so secure cookies may not work
    // Keep secure: false for Replit compatibility
    secure: false,
    sameSite: 'lax',
    // Default to 7 days, but can be overridden per-request in login route
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
}));

// Stripe webhook needs raw body - apply before JSON parser
app.use('/api/webhooks/stripe', express.raw({ type: 'application/json' }));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static files from the imagem directory
app.use('/imagem', express.static('imagem'));

// Serve uploaded PDF files
app.use('/uploads', express.static('public/uploads'));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      // Only log response bodies in development to prevent data leaks in production
      if (app.get("env") === "development" && capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // Log error for debugging but don't crash the process in production
    log(`Error ${status}: ${message}`);
    if (app.get("env") === "development") {
      console.error(err);
    }

    res.status(status).json({ message });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
    
    // Initialize cron jobs for periodic tasks
    initializeCronJobs();
  });
})();
