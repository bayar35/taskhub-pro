import mongoose, { Schema, Document } from 'mongoose';
import type { UserRole } from '@taskhub/shared';

export interface IUserDoc extends Document {
  username: string;
  email?: string;
  password: string;
  role: UserRole;
  avatar?: string;
  refreshTokens: string[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUserDoc>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
      index: true,
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'moderator'],
      default: 'user',
    },
    avatar: String,
    refreshTokens: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

export const User =
  mongoose.models.User ||
  mongoose.model<IUserDoc>('User', UserSchema);