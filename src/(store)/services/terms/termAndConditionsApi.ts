
import { rootApi } from "../apiSlice"
export const termAndConditionApi = rootApi.injectEndpoints({
    endpoints: (builder) => ({
        getTerms: builder.query({
            query: ({ page, limit, lang }) => ({
                url: '/api/terms/get',
                params: { page, limit, ...(lang && { lang }) },
            }),
            providesTags: ['Terms'],
        }),
        getSingleTerms: builder.query({
            query: ({ id, lang }) => ({
                url: `/api/term/${id}`,
                params: lang ? { lang } : {},
            }),
            providesTags: ['Terms'],
        }),
        deleteTerm: builder.mutation({
            query: (id: string) => ({
                url: `/api/term/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Terms'],
        }),
        createTerm: builder.mutation({
            query: (formData) => ({
                url: '/api/term/create',
                method: 'POST',
                body: formData,
            }),
            invalidatesTags: ['Terms'],
        }),
        updateTerm: builder.mutation({
            query: ({ id, formData }) => ({
                url: `/api/term/${id}`,
                method: 'PUT',
                body: formData,
            }),
            invalidatesTags: ['Terms'],
        }),
    }),
});

export const {
    useGetTermsQuery,
    useGetSingleTermsQuery,
    useDeleteTermMutation,
    useCreateTermMutation,
    useUpdateTermMutation
} = termAndConditionApi;
