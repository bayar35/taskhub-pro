import { api } from '../../app/api';
import type { INotification } from '@taskhub/shared';

interface NotificationResponse {
  notifications: INotification[];
  unreadCount: number;
}

export const notificationApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<NotificationResponse, { unreadOnly?: boolean }>({
      query: (params) => ({
        url: '/notifications',
        params: params.unreadOnly ? { unread: 'true' } : {},
      }),
      providesTags: ['Notification'],
    }),
    markNotificationRead: builder.mutation<INotification, string>({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Notification'],
    }),
    markAllNotificationsRead: builder.mutation<void, void>({
      query: () => ({
        url: '/notifications/read-all',
        method: 'PATCH',
      }),
      invalidatesTags: ['Notification'],
    }),
    deleteNotification: builder.mutation<void, string>({
      query: (id) => ({
        url: `/notifications/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Notification'],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useDeleteNotificationMutation,
} = notificationApi;