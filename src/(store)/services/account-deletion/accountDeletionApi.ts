import { PaginatedAccountDeletionResponse } from '@/utils/Types';
import { rootApi } from '../apiSlice';

export interface GetDeletionRequestsParams {
  page?: number;
  limit?: number;
  status?: string;
}

export interface DeletionRequestDetailsResponse {
  success: boolean;
  request: {
    _id: string;
    userId: string;
    name: string;
    email: string;
    phoneNumber: string;
    reason?: string;
    status: 'pending' | 'completed' | 'rejected';
    lesionCount: number;
    questionnaireCount: number;
    requestedAt: string;
    processedAt?: string;
    rejectionReason?: string;
  };
  userExists: boolean;
  user: {
    _id: string;
    name: string;
    email: string;
    phoneNumber?: string;
    role: string;
    status: string;
    createdAt: string;
  } | null;
  relations: {
    lesions: Array<{
      _id: string;
      case_number?: string;
      fullname: string;
      contact_number: string;
      location: string;
      status: string;
      adminAction: boolean;
      createdAt: string;
    }>;
    lesionCount: number;
    questionnaires: Array<{
      _id: string;
      status: string;
      adminAction: boolean;
      createdAt: string;
      presenceOfSharpTeeth?: string;
      presenceOfDecayedTeeth?: string;
    }>;
    questionnaireCount: number;
    notificationsCount: number;
  };
}

export const accountDeletionApi = rootApi.injectEndpoints({
  endpoints: (builder) => ({
    getAccountDeletionRequests: builder.query<
      PaginatedAccountDeletionResponse,
      GetDeletionRequestsParams
    >({
      query: ({ page = 1, limit = 10, status }) => ({
        url: '/api/account-deletion/admin',
        params: {
          page,
          limit,
          ...(status && status !== 'all' ? { status } : {}),
        },
      }),
      providesTags: ['AccountDeletion'],
      keepUnusedDataFor: 30,
    }),

    getAccountDeletionRequestDetails: builder.query<
      DeletionRequestDetailsResponse,
      string
    >({
      query: (id) => `/api/account-deletion/admin/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'AccountDeletion', id }],
    }),

    deleteUserAndRecords: builder.mutation<
      { success: boolean; message: string; details: Record<string, unknown> },
      string
    >({
      query: (id) => ({
        url: `/api/account-deletion/admin/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['AccountDeletion', 'User', 'Lesion', 'Questionnaire'],
    }),

    rejectAccountDeletionRequest: builder.mutation<
      { success: boolean; message: string },
      { id: string; rejectionReason?: string }
    >({
      query: ({ id, rejectionReason }) => ({
        url: `/api/account-deletion/admin/${id}`,
        method: 'PUT',
        body: {
          action: 'reject',
          rejectionReason,
        },
      }),
      invalidatesTags: ['AccountDeletion'],
    }),
  }),
});

export const {
  useGetAccountDeletionRequestsQuery,
  useGetAccountDeletionRequestDetailsQuery,
  useDeleteUserAndRecordsMutation,
  useRejectAccountDeletionRequestMutation,
} = accountDeletionApi;
