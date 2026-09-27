import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { INotification } from '@taskhub/shared';

interface NotificationState {
  items: INotification[];
  unreadCount: number;
  loading: boolean;
}

const initialState: NotificationState = {
  items: [],
  unreadCount: 0,
  loading: false,
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setNotifications(state, action: PayloadAction<INotification[]>) {
      state.items = action.payload;
    },
    addNotification(state, action: PayloadAction<INotification>) {
      state.items.unshift(action.payload);
      if (!action.payload.read) {
        state.unreadCount += 1;
      }
    },
    markAsRead(state, action: PayloadAction<string>) {
      const item = state.items.find((n) => n._id === action.payload);
      if (item && !item.read) {
        item.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    markAllAsRead(state) {
      state.items.forEach((n) => (n.read = true));
      state.unreadCount = 0;
    },
    removeNotification(state, action: PayloadAction<string>) {
      const item = state.items.find((n) => n._id === action.payload);
      if (item && !item.read) {
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
      state.items = state.items.filter((n) => n._id !== action.payload);
    },
    setUnreadCount(state, action: PayloadAction<number>) {
      state.unreadCount = action.payload;
    },
  },
});

export const {
  setNotifications,
  addNotification,
  markAsRead,
  markAllAsRead,
  removeNotification,
  setUnreadCount,
} = notificationSlice.actions;

export default notificationSlice.reducer;