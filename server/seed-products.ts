import { getUncachableStripeClient } from "./stripeClient";

async function createProducts() {
  const stripe = await getUncachableStripeClient();

  // Guard: allow builds/servers to run without Stripe configured
  if (!stripe) {
    console.log("[seed-products] Stripe not configured. Skipping product seeding.");
    return;
  }

  const PRODUCT_NAME = "Pro Subscription";
  const PRICE_AMOUNT_CENTS = 500; // $5.00
  const CURRENCY = "usd";
  const INTERVAL: "month" = "month";

  // Safer search query: match exactly by name
  const products = await stripe.products.search({
    query: `name:"${PRODUCT_NAME}"`,
    limit: 1,
  });

  if (products.data.length > 0) {
    console.log(`[seed-products] "${PRODUCT_NAME}" already exists:`, products.data[0].id);
    return;
  }

  const product = await stripe.products.create({
    name: PRODUCT_NAME,
    description: "HyperLocal AI Market Intelligence Subscription",
  });

  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: PRICE_AMOUNT_CENTS,
    currency: CURRENCY,
    recurring: { interval: INTERVAL },
  });

  console.log("[seed-products] Created product:", product.id);
  console.log("[seed-products] Created price:", price.id);
}

createProducts()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("[seed-products] Failed:", err);
    process.exit(1);
  });
