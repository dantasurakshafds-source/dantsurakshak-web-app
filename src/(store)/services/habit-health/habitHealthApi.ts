 
 
import { rootApi } from "../apiSlice";


export const habitHealthApi = rootApi.injectEndpoints({
  endpoints: (builder) => ({
    getHabitHealth: builder.query({
      query: ({ page, limit,  lang }) => ({
        url: '/api/habit-healths',
        params: { page, limit,   ...(lang && { lang }) },
      }),
      providesTags: ['HabitHealth'],
    }),
    getSingleHabitHealth: builder.query({
      query: ({ id, lang }) => ({
        url: `/api/habit-health/${id}`,
        params: lang ? { lang } : {},
      }),
      providesTags: ['HabitHealth'],
    }),
    deleteHabitHealth: builder.mutation({
      query: (id: string) => ({
        url: `/api/habit-health/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['HabitHealth'],
    }),
    createHabitHealth: builder.mutation({
      query: (formData) => ({
        url: '/api/habit-health/create',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['HabitHealth'],
    }),
    updateHabitHealth: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/api/habit-health/${id}`,
        method: 'PUT',
        body: formData,
      }),
      invalidatesTags: ['HabitHealth'],
    }),
  }),
});

export const { 
    useGetHabitHealthQuery,
    useGetSingleHabitHealthQuery,
    useCreateHabitHealthMutation,
    useDeleteHabitHealthMutation,
    useUpdateHabitHealthMutation
} = habitHealthApi;
