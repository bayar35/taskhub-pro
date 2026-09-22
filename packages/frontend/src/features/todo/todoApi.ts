import { api } from '../../app/api';
import type {
  ITodo,
  CreateTodoInput,
  UpdateTodoInput,
} from '@taskhub/shared';

interface TodoListParams {
  category?: string;
  search?: string;
  completed?: boolean;
  priority?: string;
  page?: number;
}

interface TodoListResponse {
  todos: ITodo[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const todoApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getTodos: builder.query<TodoListResponse, TodoListParams>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== '') {
            searchParams.append(key, String(value));
          }
        });
        return `/todos?${searchParams}`;
      },
      providesTags: ['Todo'],
    }),

    getTodoStats: builder.query<
      { data: { total: number; completed: number; pending: number } },
      void
    >({
      query: () => '/todos/stats',
      providesTags: ['Todo'],
    }),

    createTodo: builder.mutation<{ data: ITodo }, CreateTodoInput>({
      query: (data) => ({
        url: '/todos',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Todo'],
    }),

    updateTodo: builder.mutation<
      { data: ITodo },
      { id: string; data: UpdateTodoInput }
    >({
      query: ({ id, data }) => ({
        url: `/todos/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Todo'],
    }),

    toggleTodo: builder.mutation<{ data: ITodo }, string>({
      query: (id) => ({
        url: `/todos/${id}/toggle`,
        method: 'PUT',
      }),
      invalidatesTags: ['Todo'],
    }),

    deleteTodo: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/todos/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Todo'],
    }),
  }),
});

export const {
  useGetTodosQuery,
  useGetTodoStatsQuery,
  useCreateTodoMutation,
  useUpdateTodoMutation,
  useToggleTodoMutation,
  useDeleteTodoMutation,
} = todoApi;