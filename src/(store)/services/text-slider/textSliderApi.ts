import {   GetSlidersQueryParams,   TextSliderResponse, TextSlideType } from "@/utils/Types";
import { rootApi } from "../apiSlice";
export const textApi = rootApi.injectEndpoints({
  endpoints: (builder) => ({
    getTexts: builder.query<TextSliderResponse,GetSlidersQueryParams >({
      query: ({ page, limit,  lang }) => ({
        url: '/api/text-slides',
        params: { page, limit,   ...(lang && { lang }) },
      }),
      providesTags: ['TextSlider'],
    }),
    getSingleText: builder.query<TextSlideType, { id: string; lang?: string }>({
      query: ({ id, lang }) => ({
        url: `/api/text-slides/${id}`,
        params: lang ? { lang } : {},
      }),
      providesTags: ['TextSlider'],
    }),
    deleteText: builder.mutation({
      query: (id: string) => ({
        url: `/api/text-slides/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['TextSlider'],
    }),
    createText: builder.mutation<TextSlideType, FormData>({
      query: (formData) => ({
        url: '/api/text-slides/create',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['TextSlider'],
    }),
    updateText: builder.mutation<TextSlideType, { id: string; formData: FormData }>({
      query: ({ id, formData }) => ({
        url: `/api/text-slides/${id}`,
        method: 'PUT',
        body: formData,
      }),
      invalidatesTags: ['TextSlider'],
    }),
  }),
});

export const { 
    useGetTextsQuery,
    useGetSingleTextQuery,
    useDeleteTextMutation,
    useCreateTextMutation,
    useUpdateTextMutation
} = textApi;
