import { api } from '../../app/api';

export type Frequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface RecurringTask {
  _id: string;
  organizationId: string;
  userId: string;
  text: string;
  category: string;
  priority: string;
  frequency: Frequency;
  interval: number;
  daysOfWeek?: number[];
  dayOfMonth?: number;
  startDate: string;
  endDate?: string;
  nextRunAt: string;
  lastRunAt?: string;
  active: boolean;
  createdAt: string;
}

export interface CreateRecurringInput {
  text: string;
  category: string;
  priority: string;
  frequency: Frequency;
  interval: number;
  daysOfWeek?: number[];
  dayOfMonth?: number;
  startDate: string;
  endDate?: string;
}

export const recurringApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createRecurring: builder.mutation<
      { data: RecurringTask },
      CreateRecurringInput
    >({
      query: (data) => ({
        url: '/recurring',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Recurring'],
    }),

    getRecurring: builder.query<{ data: RecurringTask[] }, void>({
      query: () => '/recurring',
      providesTags: ['Recurring'],
    }),

    updateRecurring: builder.mutation<
      { data: RecurringTask },
      { id: string; data: Partial<CreateRecurringInput> }
    >({
      query: ({ id, data }) => ({
        url: `/recurring/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Recurring'],
    }),

    deleteRecurring: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/recurring/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Recurring'],
    }),
  }),
});

export const {
  useCreateRecurringMutation,
  useGetRecurringQuery,
  useUpdateRecurringMutation,
  useDeleteRecurringMutation,
} = recurringApi;