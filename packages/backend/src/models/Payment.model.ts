import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IPayment extends Document {
  _id: Types.ObjectId;
  organizationId: Types.ObjectId;
  userId: Types.ObjectId;
  amount: number;
  currency: 'MNT' | 'USD';
  status: 'pending' | 'succeeded' | 'failed' | 'refunded';
  provider: 'stripe' | 'qpay';
  providerPaymentId?: string;
  providerCustomerId?: string;
  plan: 'basic' | 'pro' | 'enterprise';
  description?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, enum: ['MNT', 'USD'], default: 'MNT' },
    status: {
      type: String,
      enum: ['pending', 'succeeded', 'failed', 'refunded'],
      default: 'pending',
      index: true,
    },
    provider: { type: String, enum: ['stripe', 'qpay'], required: true },
    providerPaymentId: { type: String, index: true, sparse: true },
    providerCustomerId: String,
    plan: { type: String, enum: ['basic', 'pro', 'enterprise'], required: true },
    description: String,
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

PaymentSchema.index({ organizationId: 1, createdAt: -1 });

export const Payment =
  mongoose.models.Payment ||
  mongoose.model<IPayment>('Payment', PaymentSchema);