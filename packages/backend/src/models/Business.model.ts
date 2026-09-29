import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IBusiness extends Document {
  _id: Types.ObjectId;
  organizationId: Types.ObjectId;
  name: string;
  type: string;
  description?: string;
  services: string[];
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
  };
  primaryColor?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BusinessSchema = new Schema<IBusiness>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    name: { type: String, required: true },
    type: { type: String, required: true },
    description: String,
    services: [{ type: String }],
    address: String,
    phone: String,
    email: String,
    website: String,
    socialMedia: {
      facebook: String,
      instagram: String,
    },
    primaryColor: String,
  },
  { timestamps: true }
);

export const Business = mongoose.model<IBusiness>('Business', BusinessSchema);