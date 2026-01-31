import express, { type Request, type Response, type NextFunction } from "express";
import { createServer } from "http";

// NOTE: If your repo exports these from different paths, adjust here:
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";

// Dev-only Vite middleware (must NOT run on Railway prod)
  } else {
    await setupVite(app, httpServer);
  }

// StripeSync + migrations (Replit-only package, but we will ONLY call when configured)
import { runMigrations } from "stripe-replit-sync";
import { getStripeSync } from "./stripeClient";

/* ------------------------------------------------------------------ */
/*  Type augmentation — MUST be top-level                              */
/* ------------------------------------------------------------------ */
declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

/* ------------------------------------------------------------------ */
/*  App + Server                                                       */
/* ------------------------------------------------------------------ */
const app = express();
const httpServer = createServer(app);

/* ------------------------------------------------------------------ */
/*  Boot logs (safe)                                                   */
/* ------------------------------------------------------------------ */
console.log("[BOOT] server/index.ts loaded");
console.log("[ENV] NODE_ENV =", process.env.NODE_ENV);
console.log("[ENV] PORT =", process.env.PORT || "5000");
console.log("[ENV] DATABASE_URL =", process.env.DATABASE_URL ? "SET" : "MISSING");
console.log("[ENV] STRIPE_SECRET_KEY =", process.env.STRIPE_SECRET_KEY ? "SET" : "MISSING");
console.log("[ENV] STRIPE_PUBLISHABLE_KEY =", process.env.STRIPE_PUBLISHABLE_KEY ? "SET" : "MISSING");
console.log("[ENV] APP_URL =", process.env.APP_URL || "MISSING");

/* ------------------------------------------------------------------ */
/*  Body parsers                                                       */
/*  - We capture rawBody so Stripe webhook verification can work.       */
/* ------------------------------------------------------------------ */
app.use(
  express.json({
    verify: (req, _res, buf) => {
      // rawBody for Stripe webhook verification
      (req as any).rawBody = buf;
    },
  })
);

app.use(express.urlencoded({ extended: false }));

/* ------------------------------------------------------------------ */
/*  Stripe init (OPTIONAL)                                             */
/*  - Never crash app if Stripe is not configured.                      */
/*  - Only run StripeSync if STRIPE_SECRET_KEY exists.                  */
/* ------------------------------------------------------------------ */
async function initStripeOptional() {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    console.info("[Stripe] STRIPE_SECRET_KEY missing — skipping Stripe + StripeSync init.");
    return;
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.info("[StripeSync] DATABASE_URL missing — skipping StripeSync migrations + webhook.");
    return;
  }

  try {
    // Run StripeSync migrations (requires DB)
    await runMigrations({ databaseUrl });

    // StripeSync is environment-sensitive; our getStripeSync() should return null if unavailable.
    const stripeSync = await getStripeSync();

    if (!stripeSync) {
      console.info("[StripeSync] Not available in this environment — skipping.");
      return;
    }

    // Determine the base URL for webhook registration:
    // Prefer Railway static URL in prod, otherwise APP_URL, otherwise Replit domains.
    const domain =
      process.env.RAILWAY_STATIC_URL ||
      process.env.APP_URL?.replace(/^https?:\/\//, "").replace(/\/$/, "") ||
      process.env.REPLIT_DOMAINS?.split(",")[0];

    if (!domain) {
      console.info("[StripeSync] No domain found (RAILWAY_STATIC_URL/APP_URL/REPLIT_DOMAINS) — skipping webhook setup.");
      return;
    }

    const webhookBaseUrl = domain.startsWith("http") ? domain : `https://${domain}`;

    await stripeSync.findOrCreateManagedWebhook(`${webhookBaseUrl}/api/stripe/webhook`);

    // Backfill runs async; do not block boot
    stripeSync.syncBackfill().catch((e: unknown) => {
      console.error("[StripeSync] syncBackfill error:", e);
    });

    console.info("[StripeSync] Initialized OK.");
  } catch (error) {
    console.error("Failed to initialize Stripe:", error);
  }
}

/* ------------------------------------------------------------------ */
/*  Start server (ONE place)                                           */
/* ------------------------------------------------------------------ */
async function start() {
  // Register API routes first
  registerRoutes(app);

  // Only run Vite middleware in dev.
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    await setupVite(app, httpServer);
  }

  // Start listening
  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(port, "0.0.0.0", () => {
    console.log(`[server] listening on port ${port}`);
  });

  // Stripe is optional; run after server boot starts
  // (safe either way)
  void initStripeOptional();
}

// Global safety: log unhandled failures (don’t silently crash)
process.on("unhandledRejection", (reason) => {
  console.error("[process] unhandledRejection:", reason);
});
process.on("uncaughtException", (err) => {
  console.error("[process] uncaughtException:", err);
});

void start();
