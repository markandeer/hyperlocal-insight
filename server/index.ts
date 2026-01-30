import express, { type Request, type Response, type NextFunction } from "express";
import { createServer } from "http";
import { runMigrations } from "stripe-replit-sync";

import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { getStripeSync } from "./stripeClient";
import { WebhookHandlers } from "./webhookHandlers";

// --- Type augmentation (must be top-level) ---
declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

const app = express();

// --- Boot logs ---
console.log("[BOOT] index.ts loaded");
console.log("[ENV] NODE_ENV =", process.env.NODE_ENV);
console.log("[ENV] DATABASE_URL =", process.env.DATABASE_URL ? "SET" : "MISSING");
console.log("[ENV] OPENAI_API_KEY =", process.env.OPENAI_API_KEY ? "SET" : "MISSING");
console.log(
  "[ENV] OIDC_CLIENT_ID =",
  process.env.OIDC_CLIENT_ID || process.env.REPL_ID || "MISSING"
);

// --- Middleware (rawBody for Stripe webhook verification) ---
app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  })
);

app.use(express.urlencoded({ extended: false }));

const httpServer = createServer(app);

// --- Stripe init (safe on Railway + Replit) ---
async function initStripe() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.info("[Stripe] DATABASE_URL missing; skipping migrations + StripeSync.");
    return;
  }

  try {
    await runMigrations({ databaseUrl });

    const stripeSync = await getStripeSync();
    console.info("✅ STRIPESYNC VALUE =", stripeSync);

    // StripeSync may be null on Railway OR on Replit deployments without connectors
    if (!stripeSync) {
      console.info("[StripeSync] Not available; skipping managed webhook + backfill.");
      return;
    }

    const domain = process.env.REPLIT_DOMAINS?.split(",")[0];
    if (!domain) {
      throw new Error("[StripeSync] REPLIT_DOMAINS missing; cannot build webhook URL.");
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

// call it ONCE at startup (outside the function)
initStripe();

// --- Routes / static ---
registerRoutes(app);
serveStatic(app);

// --- Start server (example; keep your existing port logic if different) ---
const port = Number(process.env.PORT) || 8080;
httpServer.listen(port, "0.0.0.0", () => {
  console.log(`[express] serving on port ${port}`);
});
