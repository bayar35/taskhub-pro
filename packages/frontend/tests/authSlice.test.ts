import { describe, it, expect } from 'vitest';
import authReducer, {
  setCredentials,
  setAccessToken,
  logout,
} from '../src/features/auth/authSlice';
import type { IUser } from '@taskhub/shared';

// Тестийн өгөгдөл
const mockUser: IUser = {
  _id: 'user-123',
  username: 'testuser',
  email: 'test@example.com',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
} as IUser;

const mockToken = 'mock-jwt-token-abc123';

describe('authSlice', () => {
  // Анхны state-ийг шалгах
  it('should return the initial state', () => {
    const state = authReducer(undefined, { type: 'unknown' });
    expect(state).toEqual({
      user: null,
      accessToken: null,
      isAuthenticated: false,
    });
  });

  // setCredentials
  describe('setCredentials', () => {
    it('should set user, accessToken, and isAuthenticated=true', () => {
      const state = authReducer(
        undefined,
        setCredentials({ user: mockUser, accessToken: mockToken })
      );
      expect(state.user).toEqual(mockUser);
      expect(state.accessToken).toBe(mockToken);
      expect(state.isAuthenticated).toBe(true);
    });

    it('should replace existing credentials', () => {
      const firstState = authReducer(
        undefined,
        setCredentials({ user: mockUser, accessToken: 'old-token' })
      );
      const newUser = { ...mockUser, username: 'newuser' };
      const state = authReducer(
        firstState,
        setCredentials({ user: newUser, accessToken: 'new-token' })
      );
      expect(state.user?.username).toBe('newuser');
      expect(state.accessToken).toBe('new-token');
      expect(state.isAuthenticated).toBe(true);
    });
  });

  // setAccessToken
  describe('setAccessToken', () => {
    it('should update only accessToken', () => {
      const state = authReducer(undefined, setAccessToken('new-token'));
      expect(state.accessToken).toBe('new-token');
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });

    it('should not change user when updating token', () => {
      const loggedInState = authReducer(
        undefined,
        setCredentials({ user: mockUser, accessToken: 'old-token' })
      );
      const state = authReducer(loggedInState, setAccessToken('refreshed-token'));
      expect(state.accessToken).toBe('refreshed-token');
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
    });
  });

  // logout
  describe('logout', () => {
    it('should clear all auth state', () => {
      const loggedInState = authReducer(
        undefined,
        setCredentials({ user: mockUser, accessToken: mockToken })
      );
      const state = authReducer(loggedInState, logout());
      expect(state.user).toBeNull();
      expect(state.accessToken).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });

    it('should work even if already logged out', () => {
      const state = authReducer(undefined, logout());
      expect(state.user).toBeNull();
      expect(state.accessToken).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });
});