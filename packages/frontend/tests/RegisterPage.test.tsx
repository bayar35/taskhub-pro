import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import RegisterPage from '../src/pages/RegisterPage';
import authReducer from '../src/features/auth/authSlice';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock auth API
vi.mock('../src/features/auth/authApi', () => ({
  useRegisterMutation: () => [
    vi.fn().mockResolvedValue({ data: { success: true } }),
    { isLoading: false, isError: false, error: null },
  ],
}));

function renderWithProviders(ui: React.ReactElement) {
  const store = configureStore({
    reducer: {
      auth: authReducer,
    },
    preloadedState: {
      auth: {
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      },
    },
  });

  return render(
    <Provider store={store}>
      <BrowserRouter>{ui}</BrowserRouter>
    </Provider>
  );
}

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
  });

  // 9. should render register form
  it('9. should render register form', () => {
    renderWithProviders(<RegisterPage />);

    expect(
      screen.getByRole('heading', { name: /Бүртгүүлэх/i })
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText('username')
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('email@example.com')
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('••••••••')
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', { name: /Бүртгүүлэх/i })
    ).toBeInTheDocument();
  });

  // 10. should show validation errors on empty submit
  it('10. should show validation errors on empty submit', async () => {
    renderWithProviders(<RegisterPage />);

    const submitButton = screen.getByRole('button', {
      name: /Бүртгүүлэх/i,
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      // ✅ Бодит error мессежүүдтэй тааруулсан
      expect(
        screen.getByText(/3\+ тэмдэгт байх ёстой/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Зөв и-мэйл оруулна уу/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Нууц үг 8\+ тэмдэгт байх ёстой/i)
      ).toBeInTheDocument();
    });
  });

  // 11. should show validation error for weak password
  it('11. should show validation error for weak password', async () => {
    renderWithProviders(<RegisterPage />);

    const usernameInput = screen.getByPlaceholderText(
      'username'
    ) as HTMLInputElement;
    const emailInput = screen.getByPlaceholderText(
      'email@example.com'
    ) as HTMLInputElement;
    const passwordInput = screen.getByPlaceholderText(
      '••••••••'
    ) as HTMLInputElement;

    fireEvent.change(usernameInput, {
      target: { value: 'testuser' },
    });
    fireEvent.change(emailInput, {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(passwordInput, {
      target: { value: 'weak' },
    });

    const submitButton = screen.getByRole('button', {
      name: /Бүртгүүлэх/i,
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/Нууц үг 8\+ тэмдэгт байх ёстой/i)
      ).toBeInTheDocument();
    });
  });

  // 12. should update input values
  it('12. should update input values', () => {
    renderWithProviders(<RegisterPage />);

    const usernameInput = screen.getByPlaceholderText(
      'username'
    ) as HTMLInputElement;
    const emailInput = screen.getByPlaceholderText(
      'email@example.com'
    ) as HTMLInputElement;
    const passwordInput = screen.getByPlaceholderText(
      '••••••••'
    ) as HTMLInputElement;

    fireEvent.change(usernameInput, {
      target: { value: 'testuser' },
    });
    fireEvent.change(emailInput, {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(passwordInput, {
      target: { value: 'TestPass123!' },
    });

    expect(usernameInput.value).toBe('testuser');
    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('TestPass123!');
  });

  // 13. should render link to login page
  it('13. should render link to login page', () => {
    renderWithProviders(<RegisterPage />);

    const loginLink = screen.getByRole('link', {
      name: /Нэвтрэх/i,
    });
    expect(loginLink).toBeInTheDocument();
    expect(loginLink).toHaveAttribute('href', '/login');
  });
});