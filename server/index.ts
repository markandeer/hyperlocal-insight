import express, { type Request, type Response, type NextFunction } from "express";
import { createServer } from "http";
import { runMigrations } from "stripe-replit-sync";

import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { getStripeSync } from "./stripeClient";
import { WebhookHandlers } from "./webhookHandlers";

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
/*  Boot logs                                                          */
/* ------------------------------------------------------------------ */
console.log("[BOOT] server/index.ts loaded");
console.log("[ENV] NODE_ENV =", process.env.NODE_ENV);
console.log("[ENV] DATABASE_URL =", process.env.DATABASE_URL ? "SET" : "MISSING");
console.log("[ENV] OPENAI_API_KEY =", process.env.OPENAI_API_KEY ? "SET" : "MISSING");
console.log(
  "[ENV] OIDC_CLIENT_ID =",
  process.env.OIDC_CLIENT_ID || process.env.REPL_ID || "MISSING"
);
console.log(
  "[ENV] STRIPE_SECRET_KEY =",
  process.env.STRIPE_SECRET_KEY ? "SET" : "MISSING"
);

/* ------------------------------------------------------------------ */
/*  Middleware: raw body capture (needed for Stripe webhooks)          */
/* ------------------------------------------------------------------ */
app.use(
  express.json({
    verify: (req, _res, buf) => {
      // used by webhook verification
      (req as any).rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ extended: false }));

/* ------------------------------------------------------------------ */
/*  Stripe init (OPTION A: Railway-only via env vars)                  */
/* ------------------------------------------------------------------ */
async function initStripe() {
  // ✅ Replit-safe: Stripe is optional; no env vars = skip
  if (!process.env.STRIPE_SECRET_KEY) {
    console.warn("[Stripe] STRIPE_SECRET_KEY missing — skipping Stripe init");
    return;
  }

  // StripeSync needs DB
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.warn("[Stripe] DATABASE_URL missing — skipping StripeSync");
    return;
  }

  try {
    // Run StripeSync migrations (safe on Railway, skipped on Replit)
    await runMigrations({ databaseUrl });

    const stripeSync = await getStripeSync();

    // getStripeSync should return null when unavailable; guard anyway
    if (!stripeSync) {
      console.info("[StripeSync] Not available — skipping webhook + backfill.");
      return;
    }

    // ✅ Prefer a single canonical URL you set in Railway:
    // APP_URL=https://your-app.up.railway.app (or custom domain)
    const baseUrl =
      process.env.APP_URL ||
      (process.env.RAILWAY_STATIC_URL ? `https://${process.env.RAILWAY_STATIC_URL}` : null);

    if (!baseUrl) {
      console.warn("[Stripe] APP_URL/RAILWAY_STATIC_URL missing — skipping webhook setup.");
      return;
    }

    await stripeSync.findOrCreateManagedWebhook(`${baseUrl}/api/stripe/webhook`);
    stripeSync.syncBackfill().catch(console.error);

    console.log("✅ Stripe initialized");
  } catch (error) {
    console.error("❌ Failed to initialize Stripe:", error);
  }
}

/* ------------------------------------------------------------------ */
/*  Routes + Static                                                    */
/* ------------------------------------------------------------------ */
registerRoutes(app);
serveStatic(app);

/* ------------------------------------------------------------------ */
/*  Server start                                                       */
/* ------------------------------------------------------------------ */
const port = parseInt(process.env.PORT || "5000", 10);
httpServer.listen(port, () => {
  console.log(`${new Date().toLocaleTimeString()} [express] serving on port ${port}`);
});

/* ------------------------------------------------------------------ */
/*  Kickoff                                                            */
/* ------------------------------------------------------------------ */
// ✅ Call once, at top level (NOT inside other functions)
initStripe().catch((err) => console.error("[Stripe] initStripe() top-level error:", err));
