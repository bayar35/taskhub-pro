import mongoose, { Schema, Document } from 'mongoose';
import type { TodoCategory, TodoPriority } from '@taskhub/shared';

export interface ITodoDoc extends Document {
  userId: mongoose.Types.ObjectId;
  text: string;
  category: TodoCategory;
  priority: TodoPriority;
  dueDate?: Date;
  completed: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const TodoSchema = new Schema<ITodoDoc>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 500,
    },
    category: {
      type: String,
      enum: ['Хувийн', 'Ажил', 'Хичээл'],
      default: 'Хувийн',
      index: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    dueDate: Date,
    completed: {
      type: Boolean,
      default: false,
      index: true,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

TodoSchema.index({ userId: 1, completed: 1, createdAt: -1 });
TodoSchema.index({ text: 'text' });

export const Todo =
  mongoose.models.Todo ||
  mongoose.model<ITodoDoc>('Todo', TodoSchema);