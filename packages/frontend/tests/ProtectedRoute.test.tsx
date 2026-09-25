import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../src/features/auth/authSlice';
import ProtectedRoute from '../src/routes/ProtectedRoute';
import type { IUser } from '@taskhub/shared';

const mockUser: IUser = {
  _id: 'user-1',
  username: 'testuser',
  email: 'test@example.com',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
} as IUser;

function renderWithProviders(
  ui: React.ReactElement,
  { isAuthenticated }: { isAuthenticated: boolean }
) {
  const store = configureStore({
    reducer: {
      auth: authReducer,
    },
    preloadedState: {
      auth: {
        user: isAuthenticated ? mockUser : null,
        accessToken: isAuthenticated ? 'mock-token' : null,
        isAuthenticated,
      },
    },
  });

  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route
            path="/protected"
            element={<ProtectedRoute>{ui}</ProtectedRoute>}
          />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
}

describe('ProtectedRoute', () => {
  it('should render children when authenticated', () => {
    renderWithProviders(<div>Protected Content</div>, {
      isAuthenticated: true,
    });
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
  });

  it('should redirect to /login when NOT authenticated', () => {
    renderWithProviders(<div>Protected Content</div>, {
      isAuthenticated: false,
    });
    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should not render children when NOT authenticated', () => {
    renderWithProviders(<div data-testid="secret">Secret Data</div>, {
      isAuthenticated: false,
    });
    expect(screen.queryByTestId('secret')).not.toBeInTheDocument();
  });

  it('should render multiple children when authenticated', () => {
    renderWithProviders(
      <div>
        <h1>Dashboard</h1>
        <p>Welcome back</p>
      </div>,
      { isAuthenticated: true }
    );
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Welcome back')).toBeInTheDocument();
  });
});