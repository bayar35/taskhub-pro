import { Request, Response } from 'express';
import multer from 'multer';
import { asyncHandler } from '../../utils/asyncHandler';
import { uploadFile, deleteFile } from '../../utils/s3';
import { File } from '../../models/File.model';
import { ApiError } from '../../utils/ApiError';

const multerUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

export const uploadMiddleware = multerUpload.single('file');

export const uploadController = asyncHandler(
  async (req: Request, res: Response) => {
    const file = req.file;
    if (!file) throw ApiError.badRequest('Файл олдсонгүй');

    const organizationId = req.organizationId!;
    const userId = req.userId!;
    const todoId = req.body.todoId;

    const { url, filename } = await uploadFile(
      file.buffer,
      file.originalname,
      file.mimetype,
      organizationId
    );

    const fileDoc = await File.create({
      organizationId,
      todoId,
      userId,
      filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      url,
    });

    res.status(201).json({ success: true, data: fileDoc });
  }
);

export const list = asyncHandler(async (req: Request, res: Response) => {
  const organizationId = req.organizationId!;
  const todoId = req.query.todoId as string;

  const query: any = { organizationId };
  if (todoId) query.todoId = todoId;

  const files = await File.find(query).sort('-createdAt');
  res.json({ success: true, data: files });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const organizationId = req.organizationId!;
  const file = await File.findOne({
    _id: req.params.id,
    organizationId,
  });

  if (!file) throw ApiError.notFound('Файл олдсонгүй');

  await deleteFile(`organizations/${organizationId}/files/${file.filename}`);
  await file.deleteOne();

  res.json({ success: true, message: 'Устгагдлаа' });
});