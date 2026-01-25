import { getUncachableStripeClient } from './stripeClient';

async function createProducts() {
  const stripe = await getUncachableStripeClient();

  const products = await stripe.products.search({ query: "name:'Pro Subscription'" });
  if (products.data.length > 0) {
    console.log('Pro Subscription already exists');
    return;
  }

  const product = await stripe.products.create({
    name: 'Pro Subscription',
    description: 'HyperLocal AI Market Intelligence Subscription',
  });

  await stripe.prices.create({
    product: product.id,
    unit_amount: 500, // $5.00
    currency: 'usd',
    recurring: { interval: 'month' },
  });

  console.log('Created:', product.id);
}

createProducts().catch(console.error);
