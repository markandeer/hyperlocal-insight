import express, { type Request, type Response, type NextFunction } from "express";
import { createServer } from "http";

import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
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
/*  Middleware                                                         */
/* ------------------------------------------------------------------ */
app.use(
  express.json({
    verify: (req, _res, buf) => {
      (req as any).rawBody = buf;
    },
  })
);

app.use(express.urlencoded({ extended: false }));

/* ------------------------------------------------------------------ */
/*  Boot logs                                                          */
/* ------------------------------------------------------------------ */
console.log("[BOOT] server/index.ts loaded");
console.log("[ENV] NODE_ENV =", process.env.NODE_ENV);
console.log("[ENV] PORT =", process.env.PORT);
console.log("[ENV] DATABASE_URL =", process.env.DATABASE_URL ? "SET" : "MISSING");
console.log("[ENV] STRIPE_SECRET_KEY =", process.env.STRIPE_SECRET_KEY ? "SET" : "MISSING");

/* ------------------------------------------------------------------ */
/*  Routes                                                            */
/* ------------------------------------------------------------------ */
registerRoutes(app);
serveStatic(app);

/* ------------------------------------------------------------------ */
/*  Stripe initialization (OPTIONAL & SAFE)                            */
/* ------------------------------------------------------------------ */
async function initStripe() {
  // 🔐 Stripe must NEVER run unless secret key exists
  if (!process.env.STRIPE_SECRET_KEY) {
    console.log("[Stripe] Skipped (no STRIPE_SECRET_KEY)");
    return;
  }

  try {
    const stripeSync = await getStripeSync();

    if (!stripeSync) {
      console.log("[Stripe] StripeSync unavailable — skipping");
      return;
    }

    const baseUrl =
      process.env.APP_URL ||
      process.env.RAILWAY_STATIC_URL ||
      process.env.RAILWAY_PUBLIC_DOMAIN;

    if (!baseUrl) {
      console.warn("[Stripe] No public URL found — skipping webhook setup");
      return;
    }

    const webhookUrl = `${baseUrl.replace(/\/$/, "")}/api/stripe/webhook`;

    await stripeSync.findOrCreateManagedWebhook(webhookUrl);
    stripeSync.syncBackfill().catch(console.error);

    console.log("[Stripe] StripeSync initialized");
  } catch (err) {
    console.error("[Stripe] Initialization failed:", err);
  }
}

/* ------------------------------------------------------------------ */
/*  Server start                                                       */
/* ------------------------------------------------------------------ */
const port = parseInt(process.env.PORT || "5000", 10);

httpServer.listen(port, () => {
  console.log(`[SERVER] Listening on port ${port}`);
});

/* ------------------------------------------------------------------ */
/*  Startup tasks                                                      */
/* ------------------------------------------------------------------ */
initStripe();
