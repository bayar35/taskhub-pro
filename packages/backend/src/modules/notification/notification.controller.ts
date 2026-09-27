import { Request, Response } from 'express';
import { notificationService } from './notification.service';
import { asyncHandler } from '../../utils/asyncHandler';

export const list = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId!;
  const unreadOnly = req.query.unread === 'true';

  const notifications = await notificationService.list(userId, unreadOnly);
  const unreadCount = await notificationService.countUnread(userId);

  res.json({
    success: true,
    data: { notifications, unreadCount },
  });
});

export const markAsRead = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId!;
  const notification = await notificationService.markAsRead(
    String(req.params.id),
    userId
  );
  res.json({ success: true, data: notification });
});

export const markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId!;
  await notificationService.markAllAsRead(userId);
  res.json({ success: true, message: 'Бүгд уншигдсан' });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId!;
  await notificationService.delete(String(req.params.id), userId);
  res.json({ success: true, message: 'Устгагдлаа' });
});