import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import * as paymentController from './payment.controller';

const router = Router();

router.post(
  '/stripe/checkout',
  authenticate,
  paymentController.createStripeCheckout
);

router.post(
  '/stripe/webhook',
  paymentController.handleStripeWebhook
);

router.post(
  '/qpay/invoice',
  authenticate,
  paymentController.createQPayInvoice
);

router.get('/', authenticate, paymentController.listPayments);

export default router;