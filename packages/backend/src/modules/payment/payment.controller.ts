import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiError } from '../../utils/ApiError';
import { PaymentService } from './payment.service';
import { getUserContext } from '../../utils/getUserContext';

// ---------- GET /api/v1/payments ----------
export const listPayments = asyncHandler(
  async (req: Request, res: Response) => {
    const ctx = await getUserContext(req);
    if (!ctx || !ctx.organizationId) {
      return res
        .status(401)
        .json({ success: false, message: 'Нэвтрээгүй' });
    }
    const payments = await PaymentService.listPayments(
      ctx.organizationId.toString()
    );
    res.json({ success: true, data: payments });
  }
);

// ---------- POST /api/v1/payments/stripe/checkout ----------
export const createStripeCheckout = asyncHandler(
  async (req: Request, res: Response) => {
    const ctx = await getUserContext(req);
    if (!ctx || !ctx.organizationId) {
      return res
        .status(401)
        .json({ success: false, message: 'Нэвтрээгүй' });
    }

    const { plan, successUrl, cancelUrl } = req.body;

    const validPlans = ['basic', 'pro', 'enterprise'];
    if (!plan || !validPlans.includes(plan)) {
      throw new ApiError(400, 'Invalid plan');
    }

    if (!successUrl || typeof successUrl !== 'string') {
      throw new ApiError(400, 'Invalid successUrl');
    }
    try {
      new URL(successUrl);
    } catch {
      throw new ApiError(400, 'Invalid successUrl');
    }

    // ✅ Service-ийн бодит signature:
    // createCheckoutSession(orgId, userId, plan, successUrl, cancelUrl)
    const result = await PaymentService.createCheckoutSession(
      ctx.organizationId.toString(),
      ctx.userId.toString(),
      plan as any,
      successUrl,
      cancelUrl || successUrl
    );

    res.status(200).json({ success: true, data: result });
  }
);

// ---------- POST /api/v1/payments/stripe/webhook ----------
export const handleStripeWebhook = asyncHandler(
  async (req: Request, res: Response) => {
    const signature = req.headers['stripe-signature'] as string;

    // ✅ Service нь handleWebhook(rawBody: Buffer, signature: string)
    const rawBody = Buffer.isBuffer(req.body)
      ? req.body
      : Buffer.from(
          typeof req.body === 'string'
            ? req.body
            : JSON.stringify(req.body)
        );

    const result = await PaymentService.handleWebhook(rawBody, signature);

    // ✅ received давхардахгүй
    res.status(200).json({ ...result, received: true });
  }
);

// ---------- POST /api/v1/payments/qpay/invoice ----------
export const createQPayInvoice = asyncHandler(
  async (req: Request, res: Response) => {
    const ctx = await getUserContext(req);
    if (!ctx || !ctx.organizationId) {
      return res
        .status(401)
        .json({ success: false, message: 'Нэвтрээгүй' });
    }

    const { amount, description, plan } = req.body;

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      throw new ApiError(400, 'Invalid amount');
    }

    // ✅ Service-ийн бодит signature:
    // createQPayInvoice(orgId, plan, amount)
    const result = await PaymentService.createQPayInvoice(
      ctx.organizationId.toString(),
      (plan || 'basic') as any,
      amount
    );

    res.status(200).json({ success: true, data: result });
  }
);