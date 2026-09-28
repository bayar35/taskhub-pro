import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface AppNotification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
}

// ⬇️ ЭНЭ ХЭСЭГ ХАМГИЙН ЧУХАЛ - initialState-д хоосон массив байх ёстой
const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    // Socket-ээс шинэ мэдэгдэл ирэх үед дуудагдана
    addNotification: (state, action: PayloadAction<AppNotification>) => {
      // Хамгаалалт: хэрэв notifications undefined бол хоосон массив үүсгэх
      if (!state.notifications) {
        state.notifications = [];
      }
      state.notifications.unshift(action.payload);
      if (!action.payload.read) {
        state.unreadCount += 1;
      }
    },

    // Бүх мэдэгдлийг татах үед дуудагдана
    setNotifications: (state, action: PayloadAction<AppNotification[]>) => {
      if (!state.notifications) {
        state.notifications = [];
      }
      state.notifications = action.payload;
      state.unreadCount = action.payload.filter((n) => !n.read).length;
    },

    // Нэг мэдэгдлийг уншсан гэж тэмдэглэх
    markAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(
        (n) => n._id === action.payload
      );
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },

    // Бүх мэдэгдлийг уншсан гэж тэмдэглэх
    markAllAsRead: (state) => {
      state.notifications.forEach((n) => {
        n.read = true;
      });
      state.unreadCount = 0;
    },

    // Мэдэгдэл устгах
    removeNotification: (state, action: PayloadAction<string>) => {
      const index = state.notifications.findIndex(
        (n) => n._id === action.payload
      );
      if (index !== -1) {
        if (!state.notifications[index].read) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.notifications.splice(index, 1);
      }
    },

    // Бүх мэдэгдлийг цэвэрлэх (logout хийх үед)
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },
  },
});

export const {
  addNotification,
  setNotifications,
  markAsRead,
  markAllAsRead,
  removeNotification,
  clearNotifications,
} = notificationSlice.actions;

export default notificationSlice.reducer;