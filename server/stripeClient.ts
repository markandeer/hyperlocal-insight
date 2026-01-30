import Stripe from "stripe";

type StripeCreds = {
  secretKey: string;
  publishableKey?: string;
};

let cachedCreds: StripeCreds | null = null;
let stripeSync: any = null;

function isRunningOnReplit() {
  return Boolean(process.env.REPLIT_CONNECTORS_HOSTNAME);
}

/**
 * Standard (Railway/local) Stripe credentials via environment variables.
 */
function getEnvStripeCreds(): StripeCreds {
  const secretKey =
    process.env.STRIPE_SECRET_KEY ||
    process.env.STRIPE_SECRET ||
    process.env.STRIPE_API_KEY ||
    "";

  const publishableKey =
    process.env.STRIPE_PUBLISHABLE_KEY ||
    process.env.STRIPE_PUBLISHABLE ||
    process.env.STRIPE_PUBLIC_KEY ||
    process.env.VITE_STRIPE_PUBLISHABLE_KEY;

  if (!secretKey.trim()) {
    throw new Error("[Stripe] Missing STRIPE_SECRET_KEY (set it in Railway Variables).");
  }

  return { secretKey, publishableKey };
}

/**
 * Replit connector credentials (Replit-only).
 * Uses Replit connectors API to fetch Stripe keys.
 */
async function getReplitConnectorCreds(): Promise<StripeCreds> {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;

  const xReplitToken = process.env.REPL_IDENTITY
    ? "repl " + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
      ? "depl " + process.env.WEB_REPL_RENEWAL
      : null;

  if (!hostname) throw new Error("[Stripe] REPLIT_CONNECTORS_HOSTNAME missing.");
  if (!xReplitToken) throw new Error("[Stripe] X_REPLIT_TOKEN not found for repl/depl.");

  const connectorName = "stripe";
  const isProduction = process.env.REPLIT_DEPLOYMENT === "1";
  const targetEnvironment = isProduction ? "production" : "development";

  const url = new URL(`https://${hostname}/api/v2/connection`);
  url.searchParams.set("include_secrets", "true");
  url.searchParams.set("connector_names", connectorName);
  url.searchParams.set("environment", targetEnvironment);

  const response = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
      "X-Replit-Token": xReplitToken,
    },
  });

  if (!response.ok) {
    throw new Error(`[Stripe] Replit connector request failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const connectionSettings = data.items?.[0];

  if (!connectionSettings?.settings?.secret) {
    throw new Error(`[Stripe] Stripe ${targetEnvironment} connection not found`);
  }

  return {
    secretKey: connectionSettings.settings.secret,
    publishableKey: connectionSettings.settings.publishable,
  };
}

/**
 * Get Stripe credentials.
 * - Prefer env vars everywhere (Railway/local).
 * - If env vars missing AND running on Replit, fall back to connector creds.
 */
async function getCredentials(): Promise<StripeCreds> {
  if (cachedCreds) return cachedCreds;

  try {
    cachedCreds = getEnvStripeCreds();
    return cachedCreds;
  } catch (envErr) {
    if (isRunningOnReplit()) {
      cachedCreds = await getReplitConnectorCreds();
      return cachedCreds;
    }
    throw envErr;
  }
}

/**
 * Server-side Stripe client (works on Railway + Replit).
 */
export async function getUncachableStripeClient(): Promise<Stripe> {
  const { secretKey } = await getCredentials();
  // If you need to pin apiVersion, pass { apiVersion: "YYYY-MM-DD" } as 2nd arg.
  return new Stripe(secretKey);
}

/**
 * Client-side publishable key (only needed if your backend is serving it to a frontend).
 */
export async function getStripePublishableKey(): Promise<string> {
  const { publishableKey } = await getCredentials();
  if (!publishableKey) {
    throw new Error("[Stripe] Missing STRIPE_PUBLISHABLE_KEY (set it in Railway Variables).");
  }
  return publishableKey;
}

/**
 * Secret key getter (mostly for internal use).
 */
export async function getStripeSecretKey(): Promise<string> {
  const { secretKey } = await getCredentials();
  return secretKey;
}

/**
 * Replit-only StripeSync helper.
 * On Railway it returns null and does nothing.
 */
export async function getStripeSync(): Promise<any | null> {
  if (!isRunningOnReplit()) return null;

  if (!stripeSync) {
    const { StripeSync } = await import("stripe-replit-sync");
    const secretKey = await getStripeSecretKey();

    stripeSync = new StripeSync({
      poolConfig: {
        connectionString: process.env.DATABASE_URL!,
        max: 2,
      },
      stripeSecretKey: secretKey,
    });
  }

  return stripeSync;
}
