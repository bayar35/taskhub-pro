import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../src/features/auth/authSlice';

// ===== RTK Query hook-уудыг mock хийх =====
const mockCreateTodo = vi.fn();
const mockToggleTodo = vi.fn();
const mockDeleteTodo = vi.fn();
const mockLogoutApi = vi.fn();

const mockTodos = [
  {
    _id: 'todo-1',
    text: 'Test todo 1',
    completed: false,
    category: 'Хувийн',
    priority: 'medium',
    userId: 'user-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'todo-2',
    text: 'Completed todo',
    completed: true,
    category: 'Ажил',
    priority: 'high',
    userId: 'user-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const mockStats = {
  data: { total: 5, completed: 2, pending: 3 },
};

vi.mock('../src/features/todo/todoApi', () => ({
  useGetTodosQuery: vi.fn(() => ({
    data: { todos: mockTodos },
    isLoading: false,
  })),
  useGetTodoStatsQuery: vi.fn(() => ({ data: mockStats })),
  useCreateTodoMutation: vi.fn(() => [mockCreateTodo]),
  useToggleTodoMutation: vi.fn(() => [mockToggleTodo]),
  useDeleteTodoMutation: vi.fn(() => [mockDeleteTodo]),
}));

vi.mock('../src/features/auth/authApi', () => ({
  useLogoutMutation: vi.fn(() => [mockLogoutApi]),
}));

// Import-ыг mock-ийн дараа хийх ёстой
import DashboardPage from '../src/pages/DashboardPage';

// ===== Test helpers =====
const mockUser = {
  _id: 'user-1',
  username: 'testuser',
  email: 'test@example.com',
};

function renderWithProviders({
  user = mockUser,
}: { user?: typeof mockUser | null } = {}) {
  const store = configureStore({
    reducer: {
      auth: authReducer,
    },
    preloadedState: {
      auth: {
        user: user as any,
        accessToken: user ? 'mock-token' : null,
        isAuthenticated: !!user,
      },
    },
  });

  return render(
    <Provider store={store}>
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    </Provider>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  mockCreateTodo.mockReturnValue({ unwrap: () => Promise.resolve() });
  mockToggleTodo.mockReturnValue({ unwrap: () => Promise.resolve() });
  mockDeleteTodo.mockReturnValue({ unwrap: () => Promise.resolve() });
  mockLogoutApi.mockReturnValue({ unwrap: () => Promise.resolve() });
});

describe('DashboardPage', () => {
  it('14. should render header with username', () => {
    renderWithProviders();
    expect(screen.getByText('TaskHub Pro')).toBeInTheDocument();
    expect(screen.getByText('testuser')).toBeInTheDocument();
  });

  it('15. should render stats (total, completed, pending)', () => {
    renderWithProviders();
    expect(screen.getByText('5')).toBeInTheDocument(); // total
    expect(screen.getByText('2')).toBeInTheDocument(); // completed
    expect(screen.getByText('3')).toBeInTheDocument(); // pending
    expect(screen.getByText('Нийт')).toBeInTheDocument();
    expect(screen.getByText('Дууссан')).toBeInTheDocument();
    expect(screen.getByText('Хүлээгдэж буй')).toBeInTheDocument();
  });

  it('16. should render todo list', () => {
    renderWithProviders();
    expect(screen.getByText('Test todo 1')).toBeInTheDocument();
    expect(screen.getByText('Completed todo')).toBeInTheDocument();
  });

  it('17. should render todo input and add button', () => {
    renderWithProviders();
    expect(
      screen.getByPlaceholderText('Юу хийх вэ...')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Нэмэх' })
    ).toBeInTheDocument();
  });

  it('18. should update input value when typing', () => {
    renderWithProviders();
    const input = screen.getByPlaceholderText(
      'Юу хийх вэ...'
    ) as HTMLInputElement;

    fireEvent.change(input, { target: { value: 'New task' } });
    expect(input.value).toBe('New task');
  });

  it('19. should call createTodo when clicking "Нэмэх"', async () => {
    renderWithProviders();
    const input = screen.getByPlaceholderText('Юу хийх вэ...');
    const addButton = screen.getByRole('button', { name: 'Нэмэх' });

    fireEvent.change(input, { target: { value: 'New task' } });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(mockCreateTodo).toHaveBeenCalledWith({
        text: 'New task',
        category: 'Хувийн',
        priority: 'medium',
      });
    });
  });

  it('20. should NOT call createTodo when input is empty', () => {
    renderWithProviders();
    const addButton = screen.getByRole('button', { name: 'Нэмэх' });
    fireEvent.click(addButton);

    expect(mockCreateTodo).not.toHaveBeenCalled();
  });

  it('21. should call toggleTodo when clicking checkbox', async () => {
    renderWithProviders();
    const toggleButtons = screen.getAllByText('⬜');

    fireEvent.click(toggleButtons[0]);

    await waitFor(() => {
      expect(mockToggleTodo).toHaveBeenCalledWith('todo-1');
    });
  });

  it('22. should call deleteTodo when clicking trash', async () => {
    renderWithProviders();
    const deleteButtons = screen.getAllByText('🗑️');

    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(mockDeleteTodo).toHaveBeenCalledWith('todo-1');
    });
  });

  it('23. should call logout on "Гарах" click', async () => {
    renderWithProviders();
    const logoutButton = screen.getByRole('button', { name: 'Гарах' });

    fireEvent.click(logoutButton);

    await waitFor(() => {
      expect(mockLogoutApi).toHaveBeenCalled();
    });
  });

  it('24. should render category filter buttons', () => {
    renderWithProviders();
    expect(screen.getByRole('button', { name: 'Бүгд' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Хувийн' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ажил' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Хичээл' })).toBeInTheDocument();
  });
});