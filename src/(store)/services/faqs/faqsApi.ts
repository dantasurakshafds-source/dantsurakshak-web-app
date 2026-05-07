 
 
import { rootApi } from "../apiSlice";

export const faqsApi = rootApi.injectEndpoints({
  endpoints: (builder) => ({
    getFaqs: builder.query({
      query: ({ page, limit,  lang }) => ({
        url: '/api/faqs',
        params: { page, limit,   ...(lang && { lang }) },
      }),
      providesTags: ['Faqs'],
    }),
    getSinglegetFaq: builder.query({
      query: ({ id, lang }) => ({
        url: `/api/faqs/${id}`,
        params: lang ? { lang } : {},
      }),
      providesTags: ['Faqs'],
    }),
    deletegetFaq: builder.mutation({
      query: (id: string) => ({
        url: `/api/faqs/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Faqs'],
    }),
    creategetFaq: builder.mutation({
      query: (formData) => ({
        url: '/api/faqs/create',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Faqs'],
    }),
    updategetFaq: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/api/faqs/${id}`,
        method: 'PUT',
        body: formData,
      }),
      invalidatesTags: ['Faqs'],
    }),
  }),
});

export const { 
    useGetFaqsQuery,
    useGetSinglegetFaqQuery,
    useDeletegetFaqMutation,
    useUpdategetFaqMutation,
    useCreategetFaqMutation
} = faqsApi;
