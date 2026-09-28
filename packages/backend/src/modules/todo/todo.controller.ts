import { Request, Response } from 'express';
import { todoService } from './todo.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { todoQuerySchema } from '@taskhub/shared';

export const list = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId!;

  // Express өөрөө URL-ийг decode хийчихсэн байдаг.
  // Тиймээс нэмэлт decode хийхгүйгээр шууд Zod руу дамжуулна.
  const query = todoQuerySchema.parse(req.query);

  const result = await todoService.list(userId, query);
  res.json({ success: true, ...result });
});

export const getOne = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId!;
  const todo = await todoService.getById(String(req.params.id), userId);
  res.json({ success: true, data: todo });
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId!;
  const todo = await todoService.create(userId, req.body);
  res.status(201).json({ success: true, data: todo });
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId!;
  const todo = await todoService.update(
    String(req.params.id),
    userId,
    req.body
  );
  res.json({ success: true, data: todo });
});

export const toggle = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId!;
  const todo = await todoService.toggle(String(req.params.id), userId);
  res.json({ success: true, data: todo });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId!;
  await todoService.delete(String(req.params.id), userId);
  res.json({ success: true, message: 'Устгагдлаа' });
});

export const stats = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId!;
  const result = await todoService.getStats(userId);
  res.json({ success: true, data: result });
});