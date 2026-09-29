import { api } from '../../app/api';
import type {
  IUser,
  LoginInput,
  RegisterInput,
} from '@taskhub/shared';

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<
      { data: { accessToken: string; user: IUser } },
      LoginInput
    >({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),

    register: builder.mutation<{ data: IUser }, RegisterInput>({
      query: (data) => ({
        url: '/auth/register',
        method: 'POST',
        body: data,
      }),
    }),

    logout: builder.mutation<void, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['User'],
    }),

    setupTwoFactor: builder.mutation<{ data: { secret: string; qrCode: string } }, void>({
  query: () => ({
    url: '/auth/2fa/setup',
    method: 'POST',
  }),
  invalidatesTags: ['User'],
}),

verifyTwoFactor: builder.mutation<{ data: { backupCodes: string[] } }, { token: string }>({
  query: (data) => ({
    url: '/auth/2fa/verify',
    method: 'POST',
    body: data,
  }),
  invalidatesTags: ['User'],
}),

disableTwoFactor: builder.mutation<{ success: boolean }, { token: string }>({
  query: (data) => ({
    url: '/auth/2fa/disable',
    method: 'POST',
    body: data,
  }),
  invalidatesTags: ['User'],
}),

    getMe: builder.query<{ data: IUser }, void>({
      query: () => '/auth/me',
      providesTags: ['User'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useGetMeQuery,
  useSetupTwoFactorMutation,
  useVerifyTwoFactorMutation,
  useDisableTwoFactorMutation,
} = authApi;