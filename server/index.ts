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
