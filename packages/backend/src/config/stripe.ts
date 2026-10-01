import Stripe from 'stripe';
import { logger } from './logger';

let stripe: Stripe | null = null;

export function getStripe(): Stripe | null {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    logger.warn('⚠️ Stripe тохируулаагүй (STRIPE_SECRET_KEY байхгүй)');
    return null;
  }

  if (!stripe) {
    stripe = new Stripe(secretKey, {
      apiVersion: '2024-10-28.acacia' as any,
      typescript: true,
    });
  }

  return stripe;
}

export const STRIPE_PLANS = {
  basic: {
    priceId: process.env.STRIPE_PRICE_BASIC || '',
    amount: 4900,
    maxMembers: 5,
    maxTodos: 500,
  },
  pro: {
    priceId: process.env.STRIPE_PRICE_PRO || '',
    amount: 14900,
    maxMembers: 20,
    maxTodos: 5000,
  },
  enterprise: {
    priceId: process.env.STRIPE_PRICE_ENTERPRISE || '',
    amount: 49900,
    maxMembers: 100,
    maxTodos: 100000,
  },
} as const;

export type PaidPlan = keyof typeof STRIPE_PLANS;