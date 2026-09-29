import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IOrganization extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  plan: 'free' | 'basic' | 'pro' | 'enterprise';
  ownerId: Types.ObjectId;
  members: Types.ObjectId[];
  settings: {
    timezone: string;
    language: 'mn' | 'en';
    currency: 'MNT' | 'USD';
    logo?: string;
    primaryColor?: string;
  };
  subscription: {
    status: 'active' | 'past_due' | 'canceled' | 'trialing';
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
  };
  limits: {
    maxMembers: number;
    maxTodos: number;
    maxStorage: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const OrganizationSchema = new Schema<IOrganization>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    plan: {
      type: String,
      enum: ['free', 'basic', 'pro', 'enterprise'],
      default: 'free',
    },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    settings: {
      timezone: { type: String, default: 'Asia/Ulaanbaatar' },
      language: { type: String, enum: ['mn', 'en'], default: 'mn' },
      currency: { type: String, enum: ['MNT', 'USD'], default: 'MNT' },
      logo: String,
      primaryColor: String,
    },
    subscription: {
      status: {
        type: String,
        enum: ['active', 'past_due', 'canceled', 'trialing'],
        default: 'trialing',
      },
      currentPeriodStart: Date,
      currentPeriodEnd: Date,
      stripeCustomerId: String,
      stripeSubscriptionId: String,
    },
    limits: {
      maxMembers: { type: Number, default: 3 },
      maxTodos: { type: Number, default: 50 },
      maxStorage: { type: Number, default: 100 * 1024 * 1024 },
    },
  },
  { timestamps: true }
);

OrganizationSchema.index({ slug: 1 });
OrganizationSchema.index({ ownerId: 1 });
OrganizationSchema.index({ members: 1 });

export const Organization =
  mongoose.models.Organization ||
  mongoose.model<IOrganization>('Organization', OrganizationSchema);