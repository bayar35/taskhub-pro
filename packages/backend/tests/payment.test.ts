import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  vi,
  beforeEach,
} from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../src/app';

// ===========================================================================
// ✅ vi.hoisted() — mock-уудыг hoist хийхэд ашиглана
// ===========================================================================
const mocks = vi.hoisted(() => {
  const mockStripeSession = {
    id: 'cs_test_mock_12345',
    url: 'https://checkout.stripe.com/c/pay/cs_test_mock_12345',
    customer: 'cus_mock_123',
    subscription: 'sub_mock_123',
    metadata: {
      organizationId: '000000000000000000000001',
      userId: '000000000000000000000002',
      plan: 'pro',
    },
  };

  const mockQPayInvoice = {
    invoice_id: 'qpay_mock_invoice_123',
    qr_text: 'mock_qr_text',
    qr_image: 'data:image/png;base64,mock',
    urls: [{ name: 'qpay', description: 'QPay', link: 'qpay://mock' }],
  };

  const mockStripe = {
    checkout: {
      sessions: {
        create: vi.fn().mockResolvedValue(mockStripeSession),
      },
    },
    webhooks: {
      constructEvent: vi.fn(),
    },
  };

  const qpayService = {
    createInvoice: vi.fn().mockResolvedValue(mockQPayInvoice),
    checkPayment: vi
      .fn()
      .mockResolvedValue({ paid: true, paid_amount: 14900 }),
    getToken: vi.fn().mockResolvedValue('mock_access_token'),
  };

  return { mockStripeSession, mockQPayInvoice, mockStripe, qpayService };
});

// ===========================================================================
// Mock-ууд
// ===========================================================================
vi.mock('stripe', () => ({
  default: vi.fn(() => mocks.mockStripe),
}));

vi.mock('../src/modules/payment/qpay.service', () => ({
  qpayService: mocks.qpayService,
}));

// Дараа нь ашиглахад хялбар болгох:
const { mockStripeSession, mockQPayInvoice, mockStripe, qpayService } = mocks;

// ===========================================================================
// Test user + org бэлтгэх
// ===========================================================================
let authToken: string;
let organizationId: string;
let userId: string;

const testUser = {
  username: `payser_${Date.now()}`,
  email: `payser_${Date.now()}@test.com`,
  password: 'TestPass123!',
};

beforeAll(
  async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(
        process.env.MONGO_URI ||
          'mongodb://localhost:27017/taskhub_test'
      );
    }

    const reg = await request(app)
      .post('/api/v1/auth/register')
      .send(testUser)
      .expect(201);

    console.log('📦 Register response:', JSON.stringify(reg.body, null, 2));

    const registeredUser = reg.body.data;
    userId = registeredUser._id;
    organizationId = registeredUser.organizationId;

    console.log('👤 userId:', userId);
    console.log('🏢 organizationId:', organizationId);

    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        username: testUser.username,
        password: testUser.password,
      })
      .expect(200);

    console.log('📦 Login response:', JSON.stringify(loginRes.body, null, 2));

    authToken =
      loginRes.body.data?.accessToken ||
      loginRes.body.data?.token ||
      loginRes.body.accessToken ||
      loginRes.body.token;

    console.log('🔑 authToken:', authToken ? '✅ байна' : '❌ байхгүй');

    expect(authToken).toBeTruthy();
    expect(organizationId).toBeTruthy();
    expect(userId).toBeTruthy();
  },
  120000
);

afterAll(async () => {
  await mongoose.connection.close();
});

beforeEach(() => {
  vi.clearAllMocks();
});

// ===========================================================================
// Тестүүд
// ===========================================================================
describe('Payment API — Mock горим (мөнгөгүй)', () => {
  // -------------------------------------------------------------------------
  // Stripe
  // -------------------------------------------------------------------------
  describe('POST /api/v1/payments/stripe/checkout', () => {
    it('1. creates Stripe checkout session (mock)', async () => {
      const res = await request(app)
        .post('/api/v1/payments/stripe/checkout')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          plan: 'pro',
          successUrl: 'http://localhost:5173/success',
          cancelUrl: 'http://localhost:5173/cancel',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.sessionId).toBe(mockStripeSession.id);
      expect(res.body.data.url).toContain('stripe.com');
      expect(mockStripe.checkout.sessions.create).toHaveBeenCalledTimes(1);
    });

    it('2. rejects invalid plan', async () => {
      const res = await request(app)
        .post('/api/v1/payments/stripe/checkout')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          plan: 'invalid_plan',
          successUrl: 'http://localhost:5173/success',
          cancelUrl: 'http://localhost:5173/cancel',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('3. rejects without auth token', async () => {
      const res = await request(app)
        .post('/api/v1/payments/stripe/checkout')
        .send({
          plan: 'pro',
          successUrl: 'http://localhost:5173/success',
          cancelUrl: 'http://localhost:5173/cancel',
        });

      expect(res.status).toBe(401);
    });

    it('4. rejects invalid successUrl', async () => {
      const res = await request(app)
        .post('/api/v1/payments/stripe/checkout')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          plan: 'pro',
          successUrl: 'not-a-url',
          cancelUrl: 'http://localhost:5173/cancel',
        });

      expect(res.status).toBe(400);
    });
  });

  // -------------------------------------------------------------------------
  // Stripe webhook
  // -------------------------------------------------------------------------
  describe('POST /api/v1/payments/stripe/webhook', () => {
    it('5. handles checkout.session.completed (mock)', async () => {
      const mockEvent = {
        type: 'checkout.session.completed',
        data: {
          object: {
            id: mockStripeSession.id,
            metadata: {
              organizationId: organizationId,
              userId: userId,
              plan: 'pro',
            },
            customer: 'cus_mock_123',
            subscription: 'sub_mock_123',
          },
        },
      };

      mockStripe.webhooks.constructEvent.mockReturnValueOnce(mockEvent);

      const res = await request(app)
        .post('/api/v1/payments/stripe/webhook')
        .set('stripe-signature', 'mock_signature')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify(mockEvent));

      expect(res.status).toBe(200);
      expect(res.body.received).toBe(true);
    });

    it('6. rejects invalid signature', async () => {
      mockStripe.webhooks.constructEvent.mockImplementationOnce(() => {
        throw new Error('Invalid signature');
      });

      const res = await request(app)
        .post('/api/v1/payments/stripe/webhook')
        .set('stripe-signature', 'invalid_signature')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify({ type: 'test' }));

      expect(res.status).toBe(400);
    });
  });

  // -------------------------------------------------------------------------
  // QPay
  // -------------------------------------------------------------------------
  describe('POST /api/v1/payments/qpay/invoice', () => {
    it('7. creates QPay invoice (mock)', async () => {
      const res = await request(app)
        .post('/api/v1/payments/qpay/invoice')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          plan: 'pro',
          amount: 14900,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.invoice_id).toBe(mockQPayInvoice.invoice_id);
      expect(res.body.data.qr_text).toBe('mock_qr_text');
    });

    it('8. rejects invalid amount', async () => {
      const res = await request(app)
        .post('/api/v1/payments/qpay/invoice')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          plan: 'pro',
          amount: -1000,
        });

      expect(res.status).toBe(400);
    });
  });

  // -------------------------------------------------------------------------
  // Payment history
  // -------------------------------------------------------------------------
  describe('GET /api/v1/payments', () => {
    it('9. returns payment history', async () => {
      const res = await request(app)
        .get('/api/v1/payments')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('10. rejects without auth', async () => {
      const res = await request(app).get('/api/v1/payments');
      expect(res.status).toBe(401);
    });
  });

  // -------------------------------------------------------------------------
  // Plan activation (mock)
  // -------------------------------------------------------------------------
  describe('Plan activation', () => {
    it('11. activates plan after successful payment', async () => {
      const mockEvent = {
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_activate_mock',
            metadata: {
              organizationId,
              userId,
              plan: 'basic',
            },
            customer: 'cus_activate',
            subscription: 'sub_activate',
          },
        },
      };

      mockStripe.webhooks.constructEvent.mockReturnValueOnce(mockEvent);

      await request(app)
        .post('/api/v1/payments/stripe/webhook')
        .set('stripe-signature', 'mock_signature')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify(mockEvent))
        .expect(200);

      const { Organization } = await import(
        '../src/models/Organization.model.js'
      );
      const org = await Organization.findById(organizationId);

      expect(org).toBeTruthy();
      expect(org?.plan).toBe('basic');
      expect(org?.subscription.status).toBe('active');
      expect(org?.limits.maxMembers).toBe(5);
      expect(org?.limits.maxTodos).toBe(500);
    });

    it('12. downgrades plan on subscription deletion', async () => {
      const mockEvent = {
        type: 'customer.subscription.deleted',
        data: {
          object: {
            id: 'sub_delete_mock',
            metadata: { organizationId },
          },
        },
      };

      mockStripe.webhooks.constructEvent.mockReturnValueOnce(mockEvent);

      await request(app)
        .post('/api/v1/payments/stripe/webhook')
        .set('stripe-signature', 'mock_signature')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify(mockEvent))
        .expect(200);

      const { Organization } = await import(
        '../src/models/Organization.model.js'
      );
      const org = await Organization.findById(organizationId);

      expect(org?.plan).toBe('free');
      expect(org?.subscription.status).toBe('canceled');
      expect(org?.limits.maxMembers).toBe(3);
      expect(org?.limits.maxTodos).toBe(50);
    });
  });
});