import { DiseaseTypes, SingleDiseaseResponse} from "@/utils/Types";
 
import { rootApi } from "../apiSlice";
 
export const diseaseApi = rootApi.injectEndpoints({
  endpoints: (builder) => ({
    getDiseases: builder.query({
      query: ({ page = 1, limit = 10,  lang }) => ({
        url: '/api/diseases',
        params: { page, limit,   ...(lang && { lang }) },
      }),
      providesTags: ['Disease'],
    }),
    getSingleDiseases: builder.query<SingleDiseaseResponse, { id: string; lang?: string }>({
      query: ({ id, lang }) => ({
        url: `/api/disease/${id}`,
        params: lang ? { lang } : {},
      }),
      providesTags: ['Disease'],
    }),
    deleteDisease: builder.mutation({
      query: (id: string) => ({
        url: `/api/disease/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Disease'],
    }),
    createDisease: builder.mutation<DiseaseTypes, FormData>({
      query: (formData) => ({
        url: '/api/disease/create',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Disease'],
    }),
    updateDiseases: builder.mutation<DiseaseTypes, { id: string; formData: FormData }>({
      query: ({ id, formData }) => ({
        url: `/api/disease/${id}`,
        method: 'PUT',
        body: formData,
      }),
      invalidatesTags: ['Disease'],
    }),
  }),
});

export const {useGetDiseasesQuery,useGetSingleDiseasesQuery,useDeleteDiseaseMutation,useCreateDiseaseMutation,useUpdateDiseasesMutation} = diseaseApi;
