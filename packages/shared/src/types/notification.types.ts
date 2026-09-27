export interface INotification {
  _id: string;
  userId: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  read: boolean;
  link?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNotificationInput {
  userId: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  link?: string;
  metadata?: Record<string, unknown>;
}