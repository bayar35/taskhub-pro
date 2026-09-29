import mongoose, { Schema, Document, Types } from 'mongoose';

type Frequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface IRecurringTask extends Document {
  _id: Types.ObjectId;
  organizationId: Types.ObjectId;
  userId: Types.ObjectId;
  text: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  frequency: Frequency;
  interval: number;
  daysOfWeek?: number[];
  dayOfMonth?: number;
  startDate: Date;
  endDate?: Date;
  nextRunAt: Date;
  lastRunAt?: Date;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RecurringTaskSchema = new Schema<IRecurringTask>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    category: { type: String, required: true, default: 'Хувийн' },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly'],
      required: true,
    },
    interval: { type: Number, default: 1, min: 1 },
    daysOfWeek: [{ type: Number, min: 0, max: 6 }],
    dayOfMonth: { type: Number, min: 1, max: 31 },
    startDate: { type: Date, required: true },
    endDate: Date,
    nextRunAt: { type: Date, required: true, index: true },
    lastRunAt: Date,
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const RecurringTask =
  mongoose.models.RecurringTask ||
  mongoose.model<IRecurringTask>('RecurringTask', RecurringTaskSchema);