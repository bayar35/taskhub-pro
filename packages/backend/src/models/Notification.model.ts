import mongoose, { Document, Schema, Types } from 'mongoose';

export interface INotificationDoc extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  read: boolean;
  link?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotificationDoc>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['info', 'success', 'warning', 'error'],
      default: 'info',
    },
    title: { type: String, required: true, maxlength: 100 },
    message: { type: String, required: true, maxlength: 500 },
    read: { type: Boolean, default: false, index: true },
    link: { type: String },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

// TTL index — 30 хоногийн дараа автоматаар устгах
NotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

// ⬇️ ЗАСВАР: Дахин бүртгэхээс сэргийлэх
const Notification =
  (mongoose.models.Notification as mongoose.Model<INotificationDoc>) ||
  mongoose.model<INotificationDoc>('Notification', NotificationSchema);

export default Notification;