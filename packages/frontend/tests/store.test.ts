import { describe, it, expect } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { api } from '../src/app/api';
import authReducer from '../src/features/auth/authSlice';

describe('Redux Store', () => {
  it('should create store with auth reducer', () => {
    const store = configureStore({
      reducer: {
        [api.reducerPath]: api.reducer,
        auth: authReducer,
      },
      middleware: (gDM) => gDM().concat(api.middleware),
    });

    expect(store.getState().auth).toEqual({
      user: null,
      accessToken: null,
      isAuthenticated: false,
    });
  });

  it('should have api reducer', () => {
    const store = configureStore({
      reducer: {
        [api.reducerPath]: api.reducer,
        auth: authReducer,
      },
      middleware: (gDM) => gDM().concat(api.middleware),
    });

    expect(store.getState().api).toBeDefined();
  });

  it('should dispatch auth actions', () => {
    const store = configureStore({
      reducer: {
        [api.reducerPath]: api.reducer,
        auth: authReducer,
      },
      middleware: (gDM) => gDM().concat(api.middleware),
    });

    // Анхны state
    expect(store.getState().auth.isAuthenticated).toBe(false);

    // Dispatch action
    store.dispatch({
      type: 'auth/setCredentials',
      payload: {
        user: { _id: '1', username: 'test', email: 'test@example.com' },
        accessToken: 'token',
      },
    });

    // Шинэ state
    expect(store.getState().auth.isAuthenticated).toBe(true);
    expect(store.getState().auth.accessToken).toBe('token');
  });

  it('should dispatch logout action', () => {
    const store = configureStore({
      reducer: {
        [api.reducerPath]: api.reducer,
        auth: authReducer,
      },
      middleware: (gDM) => gDM().concat(api.middleware),
    });

    store.dispatch({
      type: 'auth/setCredentials',
      payload: {
        user: { _id: '1', username: 'test', email: 'test@example.com' },
        accessToken: 'token',
      },
    });

    store.dispatch({ type: 'auth/logout' });

    expect(store.getState().auth.isAuthenticated).toBe(false);
    expect(store.getState().auth.user).toBeNull();
  });
});