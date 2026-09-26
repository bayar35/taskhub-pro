import { describe, it, expect } from 'vitest';
import { authApi } from '../src/features/auth/authApi';

describe('authApi', () => {
  it('should have login endpoint', () => {
    expect(authApi.endpoints.login).toBeDefined();
  });

  it('should have register endpoint', () => {
    expect(authApi.endpoints.register).toBeDefined();
  });

  it('should have logout endpoint', () => {
    expect(authApi.endpoints.logout).toBeDefined();
  });

  it('should have getMe endpoint', () => {
    expect(authApi.endpoints.getMe).toBeDefined();
  });
});