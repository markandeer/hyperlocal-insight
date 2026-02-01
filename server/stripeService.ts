import { getUncachableStripeClient } from "./stripeClient";

class StripeNotConfiguredError extends Error {
  status = 503 as const;
  constructor() {
    super("Payments are temporarily disabled.");
    this.name = "StripeNotConfiguredError";
  }
}

export class StripeService {
  /**
   * Centralizes Stripe availability checks so we never repeat logic
   * or accidentally redeclare variables.
   */
  private async requireStripe() {
    const stripe = await getUncachableStripeClient();
    if (!stripe) throw new StripeNotConfiguredError();
    return stripe;
  }

  async createCustomer(email: string, userId: string) {
    const stripe = await this.requireStripe();
    return stripe.customers.create({
      email,
      metadata: { userId },
    });
  }

  async createCheckoutSession(
    customerId: string,
    priceId: string,
    successUrl: string,
    cancelUrl: string
  ) {
    const stripe = await this.requireStripe();
    return stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: successUrl,
      cancel_url: cancelUrl,
    });
  }

  async createCustomerPortalSession(customerId: string, returnUrl: string) {
    const stripe = await this.requireStripe();
    return stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
  }

  async getProduct(productId: string) {
    const stripe = await this.requireStripe();
    return stripe.products.retrieve(productId);
  }
}
