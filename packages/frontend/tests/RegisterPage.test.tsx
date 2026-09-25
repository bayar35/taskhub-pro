import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { api } from '../src/app/api';
import authReducer from '../src/features/auth/authSlice';
import RegisterPage from '../src/pages/RegisterPage';

function renderWithProviders(ui: React.ReactElement) {
  const store = configureStore({
    reducer: {
      [api.reducerPath]: api.reducer,
      auth: authReducer,
    },
    middleware: (gDM) => gDM().concat(api.middleware),
  });

  return render(
    <Provider store={store}>
      <BrowserRouter>{ui}</BrowserRouter>
    </Provider>
  );
}

describe('RegisterPage', () => {
  it('9. should render register form', () => {
    renderWithProviders(<RegisterPage />);
    expect(
      screen.getByRole('heading', { name: 'Бүртгүүлэх' })
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Хэрэглэгчийн нэр')
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Нууц үг')).toBeInTheDocument();
  });

  it('10. should show validation errors on empty submit', async () => {
    renderWithProviders(<RegisterPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Бүртгүүлэх' }));

    await waitFor(() => {
        expect(
        screen.getByText('Хэрэглэгчийн нэр дор хаяж 3 тэмдэгт')
        ).toBeInTheDocument();
        expect(
        screen.getByText('Нууц үг дор хаяж 8 тэмдэгт')
        ).toBeInTheDocument();
    });
    });

  it('11. should show validation error for weak password', async () => {
    renderWithProviders(<RegisterPage />);

    const usernameInput = screen.getByPlaceholderText('Хэрэглэгчийн нэр');
    const passwordInput = screen.getByPlaceholderText('Нууц үг');

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: '123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Бүртгүүлэх' }));

    await waitFor(() => {
      // RegisterSchema-ийн мессеж яг юу гэж байгаагаас хамаарна
      // Жишээ нь: "Нууц үг дор хаяж 8 тэмдэгт байх ёстой"
      expect(
        screen.getByText(/8 тэмдэгт|хэт богино|сул/i)
      ).toBeInTheDocument();
    });
  });

  it('12. should update input values', () => {
    renderWithProviders(<RegisterPage />);

    const usernameInput = screen.getByPlaceholderText(
      'Хэрэглэгчийн нэр'
    ) as HTMLInputElement;
    fireEvent.change(usernameInput, { target: { value: 'newuser' } });

    expect(usernameInput.value).toBe('newuser');
  });

  it('13. should render link to login page', () => {
    renderWithProviders(<RegisterPage />);
    const loginLink = screen.getByRole('link', { name: 'Нэвтрэх' });
    expect(loginLink).toBeInTheDocument();
    expect(loginLink).toHaveAttribute('href', '/login');
  });
});