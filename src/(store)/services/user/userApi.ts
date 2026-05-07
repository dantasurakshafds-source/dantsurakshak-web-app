import { GetUsersQueryParams, PaginatedUsersResponse } from '@/utils/Types';
import { rootApi } from '../apiSlice';

export const userApi = rootApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<PaginatedUsersResponse, GetUsersQueryParams>({
      query: ({ page, limit, role }) => ({
        url: '/api/auth/users',
        params: {
          page,
          limit,
          ...(role ? { role } : {}),
        },
      }),
      providesTags: ['User'],
      keepUnusedDataFor: 60,
    }),
  }),
});

export const { useGetUsersQuery } = userApi;
