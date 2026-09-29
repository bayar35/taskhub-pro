import axios from 'axios';
import { env } from '../../config/env';
import { Organization } from '../../models/Organization.model';
import { logger } from '../../config/logger';

class QPayService {
  private baseUrl = env.QPAY_BASE_URL || 'https://merchant.qpay.mn/v2';
  private token: string | null = null;
  private tokenExpiry: Date | null = null;

  async getToken(): Promise<string> {
    if (this.token && this.tokenExpiry && this.tokenExpiry > new Date()) {
      return this.token;
    }

    const response = await axios.post(
      `${this.baseUrl}/auth/token`,
      {},
      {
        auth: {
          username: env.QPAY_CLIENT_ID!,
          password: env.QPAY_CLIENT_SECRET!,
        },
      }
    );

    this.token = response.data.access_token;
    this.tokenExpiry = new Date(Date.now() + 3600 * 1000);
    return this.token!;
  }

  async createInvoice(
    organizationId: string,
    plan: 'basic' | 'pro' | 'enterprise',
    amount: number
  ) {
    const token = await this.getToken();

    const invoiceData = {
      invoice_code: env.QPAY_INVOICE_CODE,
      sender_invoice_no: `TASKHUB-${organizationId}-${Date.now()}`,
      invoice_receiver_code: 'terminal',
      invoice_description: `TaskHub Pro ${plan} багц`,
      amount,
      callback_url: `${env.API_URL}/api/v1/payment/callback`,
    };

    const response = await axios.post(
      `${this.baseUrl}/invoice`,
      invoiceData,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    return {
      invoiceId: response.data.invoice_id,
      qrCode: response.data.qr_image,
      urls: response.data.urls,
    };
  }

  async checkPayment(invoiceId: string) {
    const token = await this.getToken();

    const response = await axios.get(
      `${this.baseUrl}/payment/check/${invoiceId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    return response.data;
  }

  async activateSubscription(
    organizationId: string,
    plan: 'basic' | 'pro' | 'enterprise'
  ) {
    const limits = {
      basic: { maxMembers: 5, maxTodos: 100, maxStorage: 500 * 1024 * 1024 },
      pro: { maxMembers: 20, maxTodos: 1000, maxStorage: 2 * 1024 * 1024 * 1024 },
      enterprise: {
        maxMembers: 100,
        maxTodos: 10000,
        maxStorage: 10 * 1024 * 1024 * 1024,
      },
    };

    await Organization.findByIdAndUpdate(organizationId, {
      plan,
      limits: limits[plan],
      'subscription.status': 'active',
      'subscription.currentPeriodStart': new Date(),
      'subscription.currentPeriodEnd': new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000
      ),
    });

    logger.info(`Subscription activated: ${organizationId} - ${plan}`);
  }
}

export const qpayService = new QPayService();