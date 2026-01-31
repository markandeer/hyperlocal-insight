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
/*  Startup                                                            */
/* ------------------------------------------------------------------ */
async function start() {
  /* -------------------------------------------------------------- */
  /*  Stripe (OPTIONAL — Railway only)                               */
  /* -------------------------------------------------------------- */
  if (process.env.STRIPE_SECRET_KEY) {
    try {
      console.log("[STRIPE] Initializing StripeSync");
      getStripeSync(); // internally guarded
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
    serveStatic(app);
  } else {
    // ✅ Dev only — dynamic import so it never bundles into prod
    const { setupVite } = await import("./vite");
    await setupVite(app, httpServer);
  }

  /* -------------------------------------------------------------- */
  /*  Routes                                                         */
  /* -------------------------------------------------------------- */
  registerRoutes(app);

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
