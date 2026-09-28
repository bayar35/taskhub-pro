import { Request, Response } from 'express';
import { todoService } from './todo.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { todoQuerySchema } from '@taskhub/shared';

export const list = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId!;

  // 1. req.query-г хуулбарлаж авах
  const rawQuery: Record<string, any> = { ...req.query };

  // 2. Монгол үсэг болон тусгай тэмдэгтүүдийг гараар decode хийх
  if (typeof rawQuery.category === 'string') {
    try {
      rawQuery.category = decodeURIComponent(rawQuery.category);
    } catch (e) {
      // Хэрэв decode хийхэд алдаа гарвал хуучнаар нь үлдээх
    }
  }

  if (typeof rawQuery.search === 'string') {
    try {
      rawQuery.search = decodeURIComponent(rawQuery.search);
    } catch (e) {}
  }

  // 3. Zod-оор query параметрүүдийг validate хийх
  const query = todoQuerySchema.parse(rawQuery);

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