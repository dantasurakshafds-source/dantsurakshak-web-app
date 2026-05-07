
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const rootApi = createApi({
  reducerPath: 'rootApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/',
    credentials: 'include',
  }),
  tagTypes: ['User', 'Slider', 'Disease', 'Lesion', 'Category', 'Questionnaire', 'HabitHealth', 'DentalEmergency', 'MythFacts', 'TextSlider', 'Faqs', 'PrivacyPolicy','Terms'],
  endpoints: () => ({}),
})
