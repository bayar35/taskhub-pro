import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { api } from '../src/app/api';
import authReducer from '../src/features/auth/authSlice';
import LoginPage from '../src/pages/LoginPage';

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

describe('LoginPage', () => {
  it('6. should render login form', () => {
    renderWithProviders(<LoginPage />);
    // "Нэвтрэх" нь h1 болон button хоёуланд байгаа тул role-оор ялгана
    expect(screen.getByRole('heading', { name: 'Нэвтрэх' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Хэрэглэгчийн нэр')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Нууц үг')).toBeInTheDocument();
  });

  it('7. should show validation errors on empty submit', async () => {
    renderWithProviders(<LoginPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Нэвтрэх' }));

    await waitFor(() => {
      // Хоёр мессеж байгаа тул тодорхой текстээр шалгана
      expect(screen.getByText('Хэрэглэгчийн нэр шаардлагатай')).toBeInTheDocument();
      expect(screen.getByText('Нууц үг шаардлагатай')).toBeInTheDocument();
    });
  });

  it('8. should update input values', () => {
    renderWithProviders(<LoginPage />);

    const usernameInput = screen.getByPlaceholderText(
      'Хэрэглэгчийн нэр'
    ) as HTMLInputElement;
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });

    expect(usernameInput.value).toBe('testuser');
  });
});