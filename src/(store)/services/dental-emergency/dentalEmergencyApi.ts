 
 
import { rootApi } from "../apiSlice";


export const dentalEmergencyApi = rootApi.injectEndpoints({
  endpoints: (builder) => ({
    getDentalEmergencies: builder.query({
      query: ({ page, limit,  lang }) => ({
        url: '/api/dental-emergency',
        params: { page, limit,   ...(lang && { lang }) },
      }),
      providesTags: ['DentalEmergency'],
    }),
    getSingleDentalEmergency: builder.query({
      query: ({ id, lang }) => ({
        url: `/api/dental-emergency/${id}`,
        params: lang ? { lang } : {},
      }),
      providesTags: ['DentalEmergency'],
    }),
    deleteDentalEmergency: builder.mutation({
      query: (id: string) => ({
        url: `/api/dental-emergency/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['DentalEmergency'],
    }),
    createDentalEmergency: builder.mutation({
      query: (formData) => ({
        url: '/api/dental-emergency/create',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['DentalEmergency'],
    }),
    updateDentalEmergency: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/api/dental-emergency/${id}`,
        method: 'PUT',
        body: formData,
      }),
      invalidatesTags: ['DentalEmergency'],
    }),
  }),
});

export const { 
    useGetDentalEmergenciesQuery,
    useGetSingleDentalEmergencyQuery,
    useDeleteDentalEmergencyMutation,
    useCreateDentalEmergencyMutation,
    useUpdateDentalEmergencyMutation
} = dentalEmergencyApi;
