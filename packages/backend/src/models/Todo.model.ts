import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ITodo extends Document {
  _id: Types.ObjectId;
  organizationId: Types.ObjectId;
  userId: Types.ObjectId;
  text: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  completed: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const TodoSchema = new Schema<ITodo>(
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
    text: { type: String, required: true, trim: true, maxlength: 500 },
    category: { type: String, required: true, default: 'Хувийн' },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    dueDate: Date,
    completed: { type: Boolean, default: false },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

TodoSchema.index({ organizationId: 1, completed: 1 });
TodoSchema.index({ organizationId: 1, category: 1 });
TodoSchema.index({ text: 'text' });

export const Todo =
  mongoose.models.Todo || mongoose.model<ITodo>('Todo', TodoSchema);