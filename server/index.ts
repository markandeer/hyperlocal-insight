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
console.log("[BOOT] index.ts loaded");
console.log("[ENV] NODE_ENV =", process.env.NODE_ENV);
console.log("[ENV] DATABASE_URL =", process.env.DATABASE_URL ? "SET" : "MISSING");
console.log("[ENV] OPENAI_API_KEY =", process.env.OPENAI_API_KEY ? "SET" : "MISSING");
console.log(
  "[ENV] OIDC_CLIENT_ID =",
  process.env.OIDC_CLIENT_ID || process.env.REPL_ID || "MISSING"
);

/* ------------------------------------------------------------------ */
/*  Middleware (needed for Stripe webhooks)                            */
/* ------------------------------------------------------------------ */
app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  })
);

app.use(express.urlencoded({ extended: false }));

/* ------------------------------------------------------------------ */
/*  Stripe init (safe everywhere)                                      */
/* ------------------------------------------------------------------ */
async function initStripe() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.info("[Stripe] DATABASE_URL missing; skipping Stripe init.");
    return;
  }

  try {
    // Run migrations (safe no-op if already applied)
    await runMigrations({ databaseUrl });

    const stripeSync = await getStripeSync();
    console.log("[StripeSync] value =", stripeSync);

    // StripeSync is OPTIONAL — null is expected on Railway
    if (!stripeSync) {
      console.log("[StripeSync] Not available; skipping webhook + backfill.");
      return;
    }

    const domain = process.env.REPLIT_DOMAINS?.split(",")[0];
    if (!domain) {
      console.warn("[StripeSync] REPLIT_DOMAINS missing; skipping webhook setup.");
      return;
    }

    const webhookBaseUrl = `https://${domain}`;

    await stripeSync.findOrCreateManagedWebhook(
      `${webhookBaseUrl}/api/stripe/webhook`
    );

    stripeSync.syncBackfill().catch(console.error);
  } catch (error) {
    console.error("Failed to initialize Stripe:", error);
  }
}

// Call ONCE at startup
initStripe();

/* ------------------------------------------------------------------ */
/*  Routes + Static                                                    */
/* ------------------------------------------------------------------ */
registerRoutes(app);
serveStatic(app);

/* ------------------------------------------------------------------ */
/*  Start server                                                       */
/* ------------------------------------------------------------------ */
const port = Number(process.env.PORT) || 8080;

httpServer.listen(port, "0.0.0.0", () => {
  console.log(`[express] serving on port ${port}`);
});
