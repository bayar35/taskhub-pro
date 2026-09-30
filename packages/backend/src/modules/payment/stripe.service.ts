import Stripe from 'stripe';
import { env } from '../../config/env';
import { Organization } from '../../models/Organization.model';
import { logger } from '../../config/logger';

const stripe = new Stripe(env.STRIPE_SECRET_KEY!, {
 
});

class StripeService {
  async createCheckoutSession(
    organizationId: string,
    plan: 'pro' | 'enterprise',
    email: string
  ) {
    const prices = {
      pro: 'price_pro_monthly',
      enterprise: 'price_enterprise_monthly',
    };

    const session = await stripe.checkout.sessions.create({
      customer_email: email,
      line_items: [
        {
          price: prices[plan],
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${env.CLIENT_URL}/dashboard?payment=success`,
      cancel_url: `${env.CLIENT_URL}/pricing?payment=cancelled`,
      metadata: {
        organizationId,
        plan,
      },
    });

    return { sessionId: session.id, url: session.url };
  }

  async handleWebhook(payload: Buffer, signature: string) {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      env.STRIPE_WEBHOOK_SECRET!
    );

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const { organizationId, plan } = session.metadata!;

        await Organization.findByIdAndUpdate(organizationId, {
          plan,
          'subscription.status': 'active',
          'subscription.stripeCustomerId': session.customer as string,
          'subscription.stripeSubscriptionId': session.subscription as string,
          'subscription.currentPeriodStart': new Date(),
          'subscription.currentPeriodEnd': new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          ),
        });

        logger.info(`✅ Payment success: ${organizationId} - ${plan}`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await Organization.findOneAndUpdate(
          { 'subscription.stripeSubscriptionId': subscription.id },
          { 'subscription.status': 'canceled' }
        );
        break;
      }
    }

    return { received: true };
  }
}

export const stripeService = new StripeService();