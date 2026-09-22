import { Request, Response } from 'express';
import { todoService } from './todo.service';
import { asyncHandler } from '../../utils/asyncHandler';

export const list = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).userId;

  const filters = {
    category: req.query.category as string,
    search: req.query.search as string,
    completed:
      req.query.completed === 'true'
        ? true
        : req.query.completed === 'false'
        ? false
        : undefined,
    priority: req.query.priority as string,
  };

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 50;

  const result = await todoService.list(userId, filters as any, page, limit);
  res.json({ success: true, ...result });
});

export const getOne = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const todo = await todoService.getById(req.params.id, userId);
  res.json({ success: true, data: todo });
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const todo = await todoService.create(userId, req.body);
  res.status(201).json({ success: true, data: todo });
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const todo = await todoService.update(req.params.id, userId, req.body);
  res.json({ success: true, data: todo });
});

export const toggle = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const todo = await todoService.toggle(req.params.id, userId);
  res.json({ success: true, data: todo });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  await todoService.delete(req.params.id, userId);
  res.json({ success: true, message: 'Устгагдлаа' });
});

export const stats = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const result = await todoService.getStats(userId);
  res.json({ success: true, data: result });
});