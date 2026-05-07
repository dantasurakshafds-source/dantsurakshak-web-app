 
import { Lesion, LesionResponse } from '@/utils/Types';
import { rootApi } from '../apiSlice';

export const LesionApi = rootApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllLesions: builder.query<LesionResponse, { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 1000 }) => ({
        url: '/api/lesion',
        params: { page, limit },
      }),
      providesTags: ['Lesion'],
    
  
    }),
    getSingleLesion: builder.query<Lesion, { id: string }>({
      query: ({ id }) => `/api/lesion/${id}`,
      providesTags: ['Lesion'],
    }),
  }),
});

export const {
  useGetAllLesionsQuery,
  useGetSingleLesionQuery,
} = LesionApi;
