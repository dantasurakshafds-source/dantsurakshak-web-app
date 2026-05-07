 
import { rootApi } from "../apiSlice";
export const questionnaireApi = rootApi.injectEndpoints({
    endpoints: (builder) => ({
        getQuestionnaire: builder.query({
            query: ({ page, limit}) => ({
                url: '/api/questionnaire',
                params: { page, limit },
            }),
            providesTags: ['Questionnaire'],
        }),
        getSinglQuestionnaire: builder.query({
            query: ({ id }) => ({
                url: `/api/questionnaire/${id}`
            }),
            providesTags: ['Questionnaire'],
        }),
    }),
});
export const {
    useGetQuestionnaireQuery,
    useGetSinglQuestionnaireQuery
} = questionnaireApi;
