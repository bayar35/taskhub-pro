import { notificationRepository } from './notification.repository';
import { ApiError } from '../../utils/ApiError';
import { INotification } from '@taskhub/shared';
import { getIO } from '../../config/socket';

export class NotificationService {
  async list(userId: string, unreadOnly = false): Promise<INotification[]> {
    const notifications = await notificationRepository.findByUser(userId, {
      unreadOnly,
      limit: 50,
    });
    return notifications.map(this.toPublic);
  }

  async countUnread(userId: string): Promise<number> {
    return notificationRepository.countUnread(userId);
  }

  async create(data: {
    userId: string;
    type?: 'info' | 'success' | 'warning' | 'error';
    title: string;
    message: string;
    link?: string;
  }): Promise<INotification> {
    const notification = await notificationRepository.create({
      userId: data.userId as any,
      type: data.type ?? 'info',
      title: data.title,
      message: data.message,
      link: data.link,
      read: false,
    });

    const publicNotification = this.toPublic(notification);

    // Real-time: Socket.io-оор илгээх
    try {
      const io = getIO();
      io.to(`user:${data.userId}`).emit('notification:new', publicNotification);
    } catch {
      // Socket.io тохируулагдаагүй бол алгасах
    }

    return publicNotification;
  }

  async markAsRead(id: string, userId: string): Promise<INotification> {
    const notification = await notificationRepository.markAsRead(id, userId);
    if (!notification) {
      throw ApiError.notFound('Мэдэгдэл олдсонгүй');
    }
    return this.toPublic(notification);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await notificationRepository.markAllAsRead(userId);
  }

  async delete(id: string, userId: string): Promise<void> {
    const notification = await notificationRepository.delete(id, userId);
    if (!notification) {
      throw ApiError.notFound('Мэдэгдэл олдсонгүй');
    }
  }

  private toPublic(doc: any): INotification {
    return {
      _id: doc._id.toString(),
      userId: doc.userId.toString(),
      type: doc.type,
      title: doc.title,
      message: doc.message,
      read: doc.read,
      link: doc.link,
      metadata: doc.metadata,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    };
  }
}

export const notificationService = new NotificationService();