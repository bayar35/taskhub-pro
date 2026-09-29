import { Request, Response } from 'express';
import { todoService } from './todo.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { todoQuerySchema } from '@taskhub/shared';
import { ApiError } from '../../utils/ApiError';

export const list = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId!;
  const organizationId = req.organizationId!;

  // ⬇️ Шалгалт нэмэх
  if (!organizationId) {
    throw ApiError.forbidden('Байгууллага олдсонгүй');
  }

  const query = todoQuerySchema.parse(req.query);
  const result = await todoService.list(organizationId, query, userId);
  res.json({ success: true, ...result });
});

export const getOne = asyncHandler(async (req: Request, res: Response) => {
  const organizationId = req.organizationId!;
  const todo = await todoService.getById(String(req.params.id), organizationId);
  res.json({ success: true, data: todo });
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId!;
  const organizationId = req.organizationId!;
  const todo = await todoService.create(organizationId, userId, req.body);
  res.status(201).json({ success: true, data: todo });
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const organizationId = req.organizationId!;
  const todo = await todoService.update(
    String(req.params.id),
    organizationId,
    req.body
  );
  res.json({ success: true, data: todo });
});

export const toggle = asyncHandler(async (req: Request, res: Response) => {
  const organizationId = req.organizationId!;
  const todo = await todoService.toggle(String(req.params.id), organizationId);
  res.json({ success: true, data: todo });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const organizationId = req.organizationId!;
  await todoService.delete(String(req.params.id), organizationId);
  res.json({ success: true, message: 'Устгагдлаа' });
});

export const stats = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId!;
  const organizationId = req.organizationId!;
  const result = await todoService.getStats(organizationId, userId);
  res.json({ success: true, data: result });
});