import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '@/store/store';

export const baseApi = createApi({
  reducerPath: 'api',
  keepUnusedDataFor: 300, // Cache API query data for 5 minutes in memory for instant tab switching
  refetchOnMountOrArgChange: 30, // Skip refetch if mounted within 30 seconds
  refetchOnFocus: false,
  refetchOnReconnect: false,
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v1',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token || localStorage.getItem('access_token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Auth', 'Complaint', 'Document', 'Chat'],
  endpoints: () => ({}),
});
