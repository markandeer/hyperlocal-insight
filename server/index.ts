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
    rawBody?: unknown;
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
console.log("[BOOT] server starting");
console.log("[ENV] NODE_ENV =", process.env.NODE_ENV);
console.log("[ENV] DATABASE_URL =", process.env.DATABASE_URL ? "SET" : "MISSING");
console.log("[ENV] STRIPE_SECRET_KEY =", process.env.STRIPE_SECRET_KEY ? "SET" : "MISSING");

/* ------------------------------------------------------------------ */
/*  Middleware (must come BEFORE routes)                               */
/* ------------------------------------------------------------------ */
// Capture raw body for Stripe webhooks (and anything else that needs it)
app.use(
  express.json({
    verify: (req, _res, buf) => {
      // Express passes req as IncomingMessage; we augmented the type above
      (req as unknown as { rawBody?: unknown }).rawBody = buf;
    },
  })
);

app.use(express.urlencoded({ extended: false }));

/* ------------------------------------------------------------------ */
/*  Startup                                                            */
/* ------------------------------------------------------------------ */
async function start() {
  /* -------------------------------------------------------------- */
  /*  Stripe (OPTIONAL — only when keys exist)                       */
  /* -------------------------------------------------------------- */
  if (process.env.STRIPE_SECRET_KEY) {
    try {
      console.log("[STRIPE] Initializing StripeSync");

      // getStripeSync is likely async and may return null
      const stripeSync = await getStripeSync();

      if (!stripeSync) {
        console.log("[STRIPE] StripeSync unavailable; skipping.");
      } else {
        // Only do webhook/backfill if the helper exposes these methods
        // (these calls are safe even if undefined)
        const domain =
          process.env.RAILWAY_STATIC_URL ||
          process.env.APP_URL ||
          process.env.REPLIT_DOMAINS?.split(",")[0];

        if (!domain) {
          console.warn("[STRIPE] No domain found for webhook base URL; skipping webhook setup.");
        } else {
          const webhookBaseUrl = domain.startsWith("http") ? domain : `https://${domain}`;
          await stripeSync.findOrCreateManagedWebhook?.(
            `${webhookBaseUrl}/api/stripe/webhook`
          );
        }

        // Backfill should never crash startup
        stripeSync.syncBackfill?.().catch((e: unknown) => {
          console.error("[STRIPE] syncBackfill failed:", e);
        });
      }
    } catch (err) {
      console.error("[STRIPE] Failed to initialize:", err);
    }
  } else {
    console.log("[STRIPE] Skipped (no STRIPE_SECRET_KEY)");
  }

  /* -------------------------------------------------------------- */
  /*  Dev vs Prod server setup                                       */
  /* -------------------------------------------------------------- */
  if (process.env.NODE_ENV === "production") {
    // ✅ Production = static files only (NO vite import)
    // Register API routes first; static last (safer)
    registerRoutes(app);
    serveStatic(app);
  } else {
    // ✅ Dev only — dynamic import so it never bundles into prod
    const { setupVite } = await import("./vite");
    await setupVite(app, httpServer);

    registerRoutes(app);
  }

  /* -------------------------------------------------------------- */
  /*  Start listening                                                */
  /* -------------------------------------------------------------- */
  const port = parseInt(process.env.PORT || "5000", 10);

  httpServer.listen(port, "0.0.0.0", () => {
    console.log(`[SERVER] Listening on port ${port}`);
  });
}

/* ------------------------------------------------------------------ */
/*  Kickoff                                                           */
/* ------------------------------------------------------------------ */
start().catch((err) => {
  console.error("[FATAL] Server failed to start:", err);
  process.exit(1);
});
