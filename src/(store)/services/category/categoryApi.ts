import { rootApi } from "../apiSlice";
import { CategoryResponse } from "@/utils/Types";



export const categoryApi = rootApi.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query<CategoryResponse, void>({
      query: () => ({
        url: "/api/category",
      }),
      providesTags: ["Category"],
    }),
  }),
});

export const { useGetCategoriesQuery } = categoryApi;
