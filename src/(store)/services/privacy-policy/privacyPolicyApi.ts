

import { rootApi } from "../apiSlice";


export const privacyPolicy = rootApi.injectEndpoints({
    endpoints: (builder) => ({
        getPrivacyPolices: builder.query({
            query: ({ page, limit, lang }) => ({
                url: '/api/privacy-policy/get',
                params: { page, limit, ...(lang && { lang }) },
            }),
            providesTags: ['PrivacyPolicy'],
        }),
        getSinglePrivacyPolicy: builder.query({
            query: ({ id, lang }) => ({
                url: `/api/privacy-policy/${id}`,
                params: lang ? { lang } : {},
            }),
            providesTags: ['PrivacyPolicy'],
        }),
        deletePrivacyPolicy: builder.mutation({
            query: (id: string) => ({
                url: `/api/privacy-policy/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['PrivacyPolicy'],
        }),
        createPrivacyPolicy: builder.mutation({
            query: (formData) => ({
                url: '/api/privacy-policy/create',
                method: 'POST',
                body: formData,
            }),
            invalidatesTags: ['PrivacyPolicy'],
        }),
        updatePrivacyPolicy: builder.mutation({
            query: ({ id, formData }) => ({
                url: `/api/privacy-policy/${id}`,
                method: 'PUT',
                body: formData,
            }),
            invalidatesTags: ['PrivacyPolicy'],
        }),
    }),
});

export const {
    useGetPrivacyPolicesQuery,
    useGetSinglePrivacyPolicyQuery,
    useDeletePrivacyPolicyMutation,
    useCreatePrivacyPolicyMutation,
    useUpdatePrivacyPolicyMutation
} = privacyPolicy;
