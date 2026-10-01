import axios from 'axios';
import { logger } from '../../config/logger';

interface QPayInvoiceParams {
  amount: number;
  description: string;
  senderInvoiceNo?: string;
}

class QPayService {
  private baseUrl: string;
  private username: string;
  private password: string;
  private invoiceCode: string;
  private token: string | null = null;

  constructor() {
    this.baseUrl =
      process.env.QPAY_BASE_URL || 'https://merchant.qpay.mn/v2';
    this.username = process.env.QPAY_USERNAME || '';
    this.password = process.env.QPAY_PASSWORD || '';
    this.invoiceCode = process.env.QPAY_INVOICE_CODE || '';
  }

  async getToken(): Promise<string> {
    if (this.token) return this.token;

    if (!this.username || !this.password) {
      logger.warn('⚠️ QPay тохиргоо байхгүй — mock token буцаана');
      this.token = 'mock_qpay_token';
      return this.token;
    }

    try {
      const { data } = await axios.post(
        `${this.baseUrl}/auth/token`,
        {},
        {
          auth: { username: this.username, password: this.password },
        }
      );
      this.token = data.access_token;
      return this.token!;
    } catch (err: any) {
      logger.error(`❌ QPay token error: ${err.message}`);
      throw new Error('QPay token авахад алдаа гарлаа');
    }
  }

  async createInvoice(params: QPayInvoiceParams) {
    const token = await this.getToken();

    if (!this.invoiceCode) {
      logger.warn('⚠️ QPay invoice code байхгүй — mock invoice буцаана');
      return {
        invoice_id: `mock_qpay_${Date.now()}`,
        qr_text: 'mock_qr_text',
        qr_image: 'data:image/png;base64,mock',
        urls: [
          { name: 'qpay', description: 'QPay', link: 'qpay://mock' },
        ],
      };
    }

    try {
      const { data } = await axios.post(
        `${this.baseUrl}/invoice`,
        {
          invoice_code: this.invoiceCode,
          sender_invoice_no: params.senderInvoiceNo || `${Date.now()}`,
          invoice_receiver_code: 'terminal',
          invoice_description: params.description,
          amount: params.amount,
          callback_url: process.env.QPAY_CALLBACK_URL || '',
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      return data;
    } catch (err: any) {
      logger.error(`❌ QPay invoice error: ${err.message}`);
      throw new Error('QPay invoice үүсгэхэд алдаа гарлаа');
    }
  }

  async checkPayment(invoiceId: string) {
    const token = await this.getToken();

    if (!this.invoiceCode) {
      return { paid: true, paid_amount: 14900 };
    }

    try {
      const { data } = await axios.post(
        `${this.baseUrl}/payment/check`,
        {
          object_type: 'INVOICE',
          object_id: invoiceId,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return data;
    } catch (err: any) {
      logger.error(`❌ QPay check error: ${err.message}`);
      throw new Error('QPay payment шалгахад алдаа гарлаа');
    }
  }
}

export const qpayService = new QPayService();
export { QPayService };