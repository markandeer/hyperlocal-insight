import Stripe from "stripe";

type StripeCreds = {
  publishableKey?: string;
  secretKey: string;
};

let cachedCreds: StripeCreds | null = null;

function isRunningOnReplit() {
  return Boolean(process.env.REPLIT_CONNECTORS_HOSTNAME);
}

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
    throw new Error(
      "[Stripe] Missing STRIPE_SECRET_KEY (set it in Railway Variables)."
    );
  }

  return { secretKey, publishableKey };
}

async function getReplitConnectorCreds(): Promise<StripeCreds> {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;

  const xReplitToken = process.env.REPL_IDENTITY
    ? "repl " + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
      ? "depl " + process.env.WEB_REPL_RENEWAL
      : null;

  if (!hostname) {
    throw new Error("[Stripe] REPLIT_CONNECTORS_HOSTNAME missing.");
  }
  if (!xReplitToken) {
    throw new Error("[Stripe] X_REPLIT_TOKEN not found for repl/depl.");
  }

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

  const data = await response.json();
  const connectionSettings = data.items?.[0];

  if (
    !connectionSettings ||
    !connectionSettings.settings?.secret
  ) {
    throw new Error(`[Stripe] Stripe ${targetEnvironment} connection not found`);
  }

  return {
    publishableKey: connectionSettings.settings.publishable,
    secretKey: connectionSettings.settings.secret,
  };
}

async function getCredentials(): Promise<StripeCreds> {
  if (cachedCreds) return cachedCreds;

  // Prefer normal env vars everywhere (Railway/local).
  // Only use Replit connector flow if you're actually running on Replit AND env keys aren’t provided.
  try {
    cachedCreds = getEnvStripeCreds();
    return cachedCreds;
  } catch (_envErr) {
    // If env keys are missing AND this is Replit, fall back to connector creds
    if (isRunningOnReplit()) {
      cachedCreds = await getReplitConnectorCreds();
      return cachedCreds;
    }
    throw _envErr;
  }
}

export async function getUncachableStripeClient() {
  const { secretKey } = await getCredentials();

  // Leaving apiVersion unset is usually safest unless you *must* pin it.
  return new Stripe(secretKey);
}

export async function getStripePublishableKey() {
  const { publishableKey } = await getCredentials();
  if (!publishableKey) {
    throw new Error(
      "[Stripe] Missing STRIPE_PUBLISHABLE_KEY (set it in Railway Variables)."
    );
  }
  return publishableKey;
}

export async function getStripeSecretKey() {
  const { secretKey } = await getCredentials();
  return secretKey;
}

let stripeSync: any = null;

export async function getStripeSync() {
  if (!isRunningOnReplit()) {
    return null;
  }

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
