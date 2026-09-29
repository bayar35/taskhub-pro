import mongoose, { Schema, Document, Types } from 'mongoose';

export interface INotification extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  organizationId?: Types.ObjectId;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      index: true,
    },
    type: {
      type: String,
      enum: ['info', 'success', 'warning', 'error'],
      default: 'info',
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: String,
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

NotificationSchema.index({ userId: 1, read: 1 });

export const Notification =
  mongoose.models.Notification ||
  mongoose.model<INotification>('Notification', NotificationSchema);