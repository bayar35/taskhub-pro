import { Notification, type INotification } from '../../models/Notification.model';

export class NotificationRepository {
  async findByUser(
    userId: string,
    options: { unreadOnly?: boolean; limit?: number } = {}
  ): Promise<INotification[]> {
    const filter: Record<string, any> = { userId };
    if (options.unreadOnly) {
      filter.read = false;
    }

    return Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(options.limit ?? 50);
  }

  async countUnread(userId: string): Promise<number> {
    return Notification.countDocuments({ userId, read: false });
  }

  async create(data: Partial<INotification>): Promise<INotification> {
    return Notification.create(data);
  }

  async markAsRead(
    id: string,
    userId: string
  ): Promise<INotification | null> {
    return Notification.findOneAndUpdate(
      { _id: id, userId },
      { read: true },
      { new: true }
    );
  }

  async markAllAsRead(userId: string): Promise<void> {
    await Notification.updateMany({ userId, read: false }, { read: true });
  }

  async delete(id: string, userId: string): Promise<INotification | null> {
    return Notification.findOneAndDelete({ _id: id, userId });
  }
}

export const notificationRepository = new NotificationRepository();