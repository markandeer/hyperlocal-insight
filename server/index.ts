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
/*  Crash harness (prints real stack traces)                           */
/* ------------------------------------------------------------------ */
process.on("uncaughtException", (err) => {
  console.error("[FATAL] uncaughtException");
  console.error((err as any)?.stack || err);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.error("[FATAL] unhandledRejection");
  console.error((reason as any)?.stack || reason);
  process.exit(1);
});

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
// Stripe webhooks require the *raw* body for signature verification.
// NOTE: If you also need non-JSON payload types, consider express.raw() just for that route.
app.use(
  express.json({
    verify: (req, _res, buf) => {
      (req as unknown as { rawBody?: unknown }).rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ extended: false }));

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
function getPublicBaseUrl(): string | null {
  // Prefer explicitly set APP_URL for determinism
  const domain =
    process.env.APP_URL ||
    process.env.RAILWAY_STATIC_URL ||
    process.env.REPLIT_DOMAINS?.split(",")[0] ||
    null;

  if (!domain) return null;
  return domain.startsWith("http") ? domain : `https://${domain}`;
}

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

      // IMPORTANT: getStripeSync must not statically import optional deps.
      // It should return null if StripeSync is not available.
      const stripeSync = await getStripeSync();

      if (!stripeSync) {
        console.log("[STRIPE] StripeSync unavailable; skipping.");
      } else {
        const baseUrl = getPublicBaseUrl();

        if (!baseUrl) {
          console.warn("[STRIPE] No public base URL found; skipping webhook setup.");
        } else {
          try {
            await stripeSync.findOrCreateManagedWebhook?.(`${baseUrl}/api/stripe/webhook`);
          } catch (e) {
            console.error("[STRIPE] Webhook setup failed (non-fatal):", e);
          }
        }

        // Backfill should never block startup
        Promise.resolve()
          .then(() => stripeSync.syncBackfill?.())
          .catch((e) => console.error("[STRIPE] syncBackfill failed (non-fatal):", e));
      }
    } catch (err) {
      console.error("[STRIPE] Failed to initialize (non-fatal):", err);
    }
  } else {
    console.log("[STRIPE] Skipped (no STRIPE_SECRET_KEY)");
  }

  /* -------------------------------------------------------------- */
  /*  Dev vs Prod server setup                                       */
  /* -------------------------------------------------------------- */
  // Always register API routes; serveStatic only in production
  // (This order avoids static swallowing API paths).
  registerRoutes(app);

  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    // Dev only — dynamic import so it never bundles into prod
    const { setupVite } = await import("./vite");
    await setupVite(app, httpServer);
  }

  /* -------------------------------------------------------------- */
  /*  Start listening                                                */
  /* -------------------------------------------------------------- */
  const port = Number.parseInt(process.env.PORT || "5000", 10);
  if (Number.isNaN(port)) {
    throw new Error(`[BOOT] Invalid PORT value: ${process.env.PORT}`);
  }

  httpServer.listen(port, "0.0.0.0", () => {
    console.log(`[SERVER] Listening on port ${port}`);
  });
}

/* ------------------------------------------------------------------ */
/*  Kickoff                                                           */
/* ------------------------------------------------------------------ */
start().catch((err) => {
  console.error("[FATAL] Server failed to start:");
  console.error((err as any)?.stack || err);
  process.exit(1);
});
