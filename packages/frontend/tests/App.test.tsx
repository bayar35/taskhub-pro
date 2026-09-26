import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { api } from '../src/app/api';
import authReducer from '../src/features/auth/authSlice';
import App from '../src/App';

function renderWithProviders() {
  const store = configureStore({
    reducer: {
      [api.reducerPath]: api.reducer,
      auth: authReducer,
    },
    middleware: (gDM) => gDM().concat(api.middleware),
  });

  return render(
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  );
}

describe('App', () => {
  it('should render without crashing', () => {
    renderWithProviders();
    expect(document.body).toBeInTheDocument();
  });

  it('should render login page when not authenticated', () => {
    renderWithProviders();
    // Зөвхөн heading-ийг шалгана (бусад элементүүд давхардаж байгаа)
    expect(screen.getByRole('heading', { name: 'Нэвтрэх' })).toBeInTheDocument();
  });
});