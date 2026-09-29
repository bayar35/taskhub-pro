import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IUser extends Document {
  _id: Types.ObjectId;
  username: string;
  email: string;
  password: string;
  organizationId?: Types.ObjectId;
  role: 'owner' | 'admin' | 'member' | 'user';
  avatar?: string;
  emailVerified: boolean;
  lastLoginAt?: Date;
  refreshTokens: string[];
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  backupCodes?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, select: false },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      index: true,
    },
    role: {
      type: String,
      enum: ['owner', 'admin', 'member', 'user'],
      default: 'owner',
    },
    avatar: String,
    emailVerified: { type: Boolean, default: false },
    lastLoginAt: Date,
    refreshTokens: [{ type: String }],
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String, select: false },
    backupCodes: [{ type: String, select: false }],
  },
  { timestamps: true }
);

UserSchema.index({ organizationId: 1, email: 1 });

export const User =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export type IUserDoc = mongoose.Document<unknown, {}, IUser> &
  IUser &
  Required<{ _id: Types.ObjectId }> & { __v: number };