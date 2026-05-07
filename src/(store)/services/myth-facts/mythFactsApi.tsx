

import { rootApi } from "../apiSlice";


export const mythFactsApi = rootApi.injectEndpoints({
    endpoints: (builder) => ({
        getMythFacts: builder.query({
            query: ({ page, limit, lang }) => ({
                url: '/api/myth-facts',
                params: { page, limit, ...(lang && { lang }) },
            }),
            providesTags: ['MythFacts'],
        }),
        getSingleMythFacts: builder.query({
            query: ({ id, lang }) => ({
                url: `/api/myth-fact/${id}`,
                params: lang ? { lang } : {},
            }),
            providesTags: ['MythFacts'],
        }),
        deleteMythFact: builder.mutation({
            query: (id: string) => ({
                url: `/api/myth-fact/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['MythFacts'],
        }),
        createMythFact: builder.mutation({
            query: (formData) => ({
                url: '/api/myth-fact/create',
                method: 'POST',
                body: formData,
            }),
            invalidatesTags: ['MythFacts'],
        }),
        updateMythFact: builder.mutation({
            query: ({ id, formData }) => ({
                url: `/api/myth-fact/${id}`,
                method: 'PUT',
                body: formData,
            }),
            invalidatesTags: ['MythFacts'],
        }),
    }),
});

export const {
    useGetMythFactsQuery,
    useGetSingleMythFactsQuery,
    useDeleteMythFactMutation,
    useCreateMythFactMutation,
    useUpdateMythFactMutation
} = mythFactsApi;
