import { baseApi } from './baseApi';
import { User } from '@/types';

export interface LoginResponse {
  access_token?: string;
  token_type?: string;
  token?: {
    access_token: string;
    token_type: string;
  };
  user: User;
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, { email: string; password: string }>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['Auth'],
    }),
    getCurrentUser: builder.query<User, void>({
      query: () => '/auth/me',
      providesTags: ['Auth'],
    }),
  }),
});

export const { useLoginMutation, useGetCurrentUserQuery } = authApi;
