import {
  ApplicationResponse,
  ApplicationVersionResponse,
  CreateApplicationRequest,
  CreateApplicationVersionRequest,
  ImportPublicAgentRequest,
  PaginatedResponse,
  QueryApplicationsParams,
  UpdateApplicationRequest,
} from '@eva/shared';
import { evaApi } from './evaApi';

export const applicationQueries = evaApi.injectEndpoints({
  endpoints: (builder) => ({
    getApplications: builder.query<
      PaginatedResponse<ApplicationResponse>,
      QueryApplicationsParams | void
    >({
      query: (params) => ({
        url: '/ai-applications',
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((item) => ({
                type: 'Applications' as const,
                id: item.id,
              })),
              { type: 'Applications' as const, id: 'LIST' },
            ]
          : [{ type: 'Applications' as const, id: 'LIST' }],
    }),
    getApplication: builder.query<ApplicationResponse, string>({
      query: (id) => ({
        url: `/ai-applications/${id}`,
      }),
      providesTags: (_result, _error, id) => [
        { type: 'Applications', id },
      ],
    }),
    getApplicationVersions: builder.query<ApplicationVersionResponse[], string>({
      query: (id) => ({
        url: `/ai-applications/${id}/versions`,
      }),
      providesTags: (_result, _error, id) => [
        { type: 'ApplicationVersions', id },
      ],
    }),
    createApplication: builder.mutation<
      ApplicationResponse,
      CreateApplicationRequest
    >({
      query: (data) => ({
        url: '/ai-applications',
        method: 'post',
        data,
      }),
      invalidatesTags: [{ type: 'Applications', id: 'LIST' }],
    }),
    updateApplication: builder.mutation<
      ApplicationResponse,
      { id: string; data: UpdateApplicationRequest }
    >({
      query: ({ id, data }) => ({
        url: `/ai-applications/${id}`,
        method: 'put',
        data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Applications', id },
        { type: 'Applications', id: 'LIST' },
      ],
    }),
    deleteApplication: builder.mutation<void, string>({
      query: (id) => ({
        url: `/ai-applications/${id}`,
        method: 'delete',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Applications', id },
        { type: 'Applications', id: 'LIST' },
      ],
    }),
    importPublicAgent: builder.mutation<
      ApplicationResponse,
      ImportPublicAgentRequest
    >({
      query: (data) => ({
        url: '/ai-applications/import-public',
        method: 'post',
        data,
      }),
      invalidatesTags: [{ type: 'Applications', id: 'LIST' }],
    }),
    createApplicationVersion: builder.mutation<
      ApplicationVersionResponse,
      { appId: string; data: CreateApplicationVersionRequest }
    >({
      query: ({ appId, data }) => ({
        url: `/ai-applications/${appId}/versions`,
        method: 'post',
        data,
      }),
      invalidatesTags: (_result, _error, { appId }) => [
        { type: 'ApplicationVersions', id: appId },
        { type: 'Applications', id: appId },
        { type: 'Applications', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetApplicationsQuery,
  useGetApplicationQuery,
  useGetApplicationVersionsQuery,
  useCreateApplicationMutation,
  useUpdateApplicationMutation,
  useDeleteApplicationMutation,
  useImportPublicAgentMutation,
  useCreateApplicationVersionMutation,
} = applicationQueries;
