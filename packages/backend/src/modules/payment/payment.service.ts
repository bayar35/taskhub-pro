import { Types } from 'mongoose';
import { Payment } from '../../models/Payment.model';
import { Organization } from '../../models/Organization.model';
import { ApiError } from '../../utils/ApiError';
import { logger } from '../../config/logger';
import { qpayService } from './qpay.service';   // ✅ STATIC IMPORT

const STRIPE_PLANS = {
  basic: { amount: 4900, maxMembers: 5, maxTodos: 500 },
  pro: { amount: 14900, maxMembers: 20, maxTodos: 5000 },
  enterprise: { amount: 49900, maxMembers: 100, maxTodos: 100000 },
} as const;

type PaidPlan = keyof typeof STRIPE_PLANS;

export class PaymentService {
  // =========================================================================
  // Stripe checkout session үүсгэх
  // =========================================================================
  static async createCheckoutSession(
    organizationId: string,
    userId: string,
    plan: PaidPlan,
    successUrl: string,
    cancelUrl: string
  ) {
    if (!['basic', 'pro', 'enterprise'].includes(plan)) {
      throw ApiError.badRequest('Invalid plan');
    }

    const org = await Organization.findById(organizationId);
    if (!org) throw ApiError.notFound('Байгууллага олдсонгүй');

    const planConfig = STRIPE_PLANS[plan];

    const stripeModule = await import('../../config/stripe');
    const stripe = stripeModule.getStripe();

    // ✅ Mock горим: Stripe тохируулаагүй бол mock session
    if (!stripe) {
      const mockSessionId = `mock_session_${Date.now()}`;
      logger.info(`💳 Mock checkout session: ${mockSessionId}`);

      await Payment.create({
        organizationId: new Types.ObjectId(organizationId),
        userId: new Types.ObjectId(userId),
        amount: planConfig.amount,
        currency: 'MNT',
        status: 'pending',
        provider: 'stripe',
        providerPaymentId: mockSessionId,
        plan,
        description: `${plan} plan subscription (mock)`,
        metadata: { sessionId: mockSessionId },
      });

      return {
        sessionId: mockSessionId,
        url: `${successUrl}?session_id=${mockSessionId}`,
        plan,
        amount: planConfig.amount,
      };
    }

    const session = await (stripe as any).checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'MNT',
            product_data: { name: `TaskHub ${plan} Plan` },
            unit_amount: planConfig.amount,
            recurring: { interval: 'month' },
          },
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { organizationId, userId, plan },
    });

    await Payment.create({
      organizationId: new Types.ObjectId(organizationId),
      userId: new Types.ObjectId(userId),
      amount: planConfig.amount,
      currency: 'MNT',
      status: 'pending',
      provider: 'stripe',
      providerPaymentId: session.id,
      plan,
      description: `${plan} plan subscription`,
      metadata: { sessionId: session.id },
    });

    logger.info(`💳 Checkout session: ${session.id}`);

    return {
      sessionId: session.id,
      url: session.url,
      plan,
      amount: planConfig.amount,
    };
  }

  // =========================================================================
  // Stripe webhook боловсруулах
  // =========================================================================
  static async handleWebhook(rawBody: Buffer, signature: string) {
    const stripeModule = await import('../../config/stripe');
    const stripe = stripeModule.getStripe();

    // ✅ Mock горим: Stripe байхгүй бол JSON-оос event уншиж боловсруулах
    if (!stripe) {
      logger.info('🔔 Mock Stripe webhook (Stripe тохируулаагүй)');

      let event: any;
      try {
        event = JSON.parse(rawBody.toString());
      } catch {
        throw ApiError.badRequest('Invalid JSON body');
      }

      // Mock горимд signature-ийг "mock_signature" гэж үзнэ
      if (signature && signature !== 'mock_signature') {
        throw ApiError.badRequest('Invalid signature');
      }

      logger.info(`📨 Webhook event: ${event.type}`);

      switch (event.type) {
        case 'checkout.session.completed':
          await this.activatePlan(event.data?.object || {});
          break;
        case 'customer.subscription.deleted':
          await this.deactivatePlan(event.data?.object || {});
          break;
        case 'invoice.payment_failed':
          logger.warn(`⚠️ Төлбөр амжилтгүй: ${event.data?.object?.id}`);
          break;
      }

      return { received: true };
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event: any;
    try {
      event = (stripe as any).webhooks.constructEvent(
        rawBody,
        signature,
        webhookSecret
      );
    } catch (err: any) {
      logger.error(`❌ Webhook signature: ${err.message}`);
      throw ApiError.badRequest(`Webhook Error: ${err.message}`);
    }

    logger.info(`📨 Webhook event: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed':
        await this.activatePlan(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await this.deactivatePlan(event.data.object);
        break;

      case 'invoice.payment_failed':
        logger.warn(`⚠️ Төлбөр амжилтгүй: ${event.data.object.id}`);
        break;
    }

    return { received: true };
  }

  // =========================================================================
  // Plan идэвхжүүлэх
  // =========================================================================
  private static async activatePlan(session: any) {
    const { organizationId, plan } = session.metadata || {};
    if (!organizationId || !plan) return;

    const planConfig = STRIPE_PLANS[plan as PaidPlan];
    if (!planConfig) return;

    await Organization.findByIdAndUpdate(organizationId, {
      plan,
      'subscription.status': 'active',
      'subscription.currentPeriodStart': new Date(),
      'subscription.currentPeriodEnd': new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000
      ),
      'subscription.stripeCustomerId': session.customer,
      'subscription.stripeSubscriptionId': session.subscription,
      'limits.maxMembers': planConfig.maxMembers,
      'limits.maxTodos': planConfig.maxTodos,
    });

    await Payment.findOneAndUpdate(
      { providerPaymentId: session.id },
      { status: 'succeeded' }
    );

    logger.info(`✅ Plan activated: ${organizationId} → ${plan}`);
  }

  // =========================================================================
  // Plan деактиваци
  // =========================================================================
  private static async deactivatePlan(subscription: any) {
    const organizationId = subscription.metadata?.organizationId;
    if (!organizationId) return;

    await Organization.findByIdAndUpdate(organizationId, {
      plan: 'free',
      'subscription.status': 'canceled',
      'limits.maxMembers': 3,
      'limits.maxTodos': 50,
    });

    logger.info(`⛔ Plan deactivated: ${organizationId}`);
  }

  // =========================================================================
  // QPay invoice үүсгэх — ✅ STATIC IMPORT
  // =========================================================================
  static async createQPayInvoice(
    organizationId: string,
    plan: PaidPlan,
    amount: number
  ) {
    if (!amount || amount <= 0) {
      throw ApiError.badRequest('Invalid amount');
    }

    // ✅ Static import-аар авсан qpayService ашиглах
    if (!qpayService) {
      throw ApiError.badRequest('QPay тохируулаагүй');
    }

    const invoice = await (qpayService as any).createInvoice({
      amount,
      description: `TaskHub ${plan} Plan`,
    });

    await Payment.create({
      organizationId: new Types.ObjectId(organizationId),
      userId: new Types.ObjectId(organizationId),
      amount,
      currency: 'MNT',
      status: 'pending',
      provider: 'qpay',
      providerPaymentId: invoice.invoice_id,
      plan,
      description: `${plan} plan (QPay)`,
      metadata: { invoiceId: invoice.invoice_id },
    });

    logger.info(`💳 QPay invoice: ${invoice.invoice_id}`);

    return invoice;
  }

  // =========================================================================
  // Төлбөрийн түүх
  // =========================================================================
  static async listPayments(organizationId: string) {
    return Payment.find({ organizationId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
  }
}