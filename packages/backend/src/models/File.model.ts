import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IFile extends Document {
  _id: Types.ObjectId;
  organizationId: Types.ObjectId;
  todoId?: Types.ObjectId;
  userId: Types.ObjectId;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FileSchema = new Schema<IFile>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    todoId: { type: Schema.Types.ObjectId, ref: 'Todo', index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    mimetype: { type: String, required: true },
    size: { type: Number, required: true },
    url: { type: String, required: true },
    thumbnailUrl: String,
  },
  { timestamps: true }
);

export const File =
  mongoose.models.File || mongoose.model<IFile>('File', FileSchema);