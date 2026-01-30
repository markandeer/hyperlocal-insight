import express, { type Request, Response, NextFunction } from "express";
import { runMigrations } from 'stripe-replit-sync';
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { getStripeSync } from "./stripeClient";
import { WebhookHandlers } from "./webhookHandlers";

const app = express();

console.log("[BOOT] index.ts loaded");
console.log("[ENV] NODE_ENV =", process.env.NODE_ENV);
console.log("[ENV] DATABASE_URL =", process.env.DATABASE_URL ? "SET" : "MISSING");
console.log("[ENV] OPENAI_API_KEY =", process.env.OPENAI_API_KEY ? "SET" : "MISSING");
console.log("[ENV] OIDC_CLIENT_ID =", process.env.OIDC_CLIENT_ID || process.env.REPL_ID || "MISSING");

const httpServer = createServer(app);

async function initStripe() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) return;

  try {
    await runMigrations({ databaseUrl });

    const stripeSync = await getStripeSync();
    console.info("✅ STRIPESYNC VALUE =", stripeSync);

    // StripeSync not available (Railway OR Replit without connectors)
    if (!stripeSync) {
      console.info("[StripeSync] Not available; skipping webhook + backfill.");
      return;
    }

    const domain = process.env.REPLIT_DOMAINS?.split(",")[0];
    if (!domain) {
      throw new Error("[StripeSync] REPLIT_DOMAINS missing; cannot build webhook URL.");
    }

    const webhookBaseUrl = `https://${domain}`; // ✅ declared ONCE

    await stripeSync.findOrCreateManagedWebhook(
      `${webhookBaseUrl}/api/stripe/webhook`
    );

    stripeSync.syncBackfill().catch(console.error);
  } catch (error) {
    console.error("Failed to initialize Stripe:", error);
  }
}
