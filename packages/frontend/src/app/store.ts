import { configureStore } from '@reduxjs/toolkit';
import { api } from './api';
import { authApi } from '../features/auth/authApi';
import { todoApi } from '../features/todo/todoApi';
import { notificationApi } from '../features/notification/notificationApi';
import authReducer from '../features/auth/authSlice';
import notificationReducer from '../features/notification/notificationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    notifications: notificationReducer,
    [api.reducerPath]: api.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [todoApi.reducerPath]: todoApi.reducer,
    [notificationApi.reducerPath]: notificationApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      api.middleware,
      authApi.middleware,
      todoApi.middleware,
      notificationApi.middleware
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;