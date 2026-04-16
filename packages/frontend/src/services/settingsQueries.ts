import {
  AddMemberRequest,
  ApiTokenResponse,
  CreateTokenRequest,
  CreateTokenResponse,
  ProjectSettingsResponse,
  UpdateMemberRequest,
  UpdateProjectRequest,
  WorkspaceMember,
} from '@eva/shared';
import { evaApi } from './evaApi';

export const settingsQueries = evaApi.injectEndpoints({
  endpoints: (builder) => ({
    getProjectSettings: builder.query<ProjectSettingsResponse, void>({
      query: () => ({
        url: '/settings/project',
      }),
      providesTags: [{ type: 'ProjectSettings', id: 'CURRENT' }],
    }),
    updateProjectSettings: builder.mutation<
      ProjectSettingsResponse,
      UpdateProjectRequest
    >({
      query: (data) => ({
        url: '/settings/project',
        method: 'put',
        data,
      }),
      invalidatesTags: [{ type: 'ProjectSettings', id: 'CURRENT' }],
    }),
    getMembers: builder.query<WorkspaceMember[], void>({
      query: () => ({
        url: '/settings/members',
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((member) => ({
                type: 'Members' as const,
                id: member.id,
              })),
              { type: 'Members' as const, id: 'LIST' },
            ]
          : [{ type: 'Members' as const, id: 'LIST' }],
    }),
    addMember: builder.mutation<WorkspaceMember, AddMemberRequest>({
      query: (data) => ({
        url: '/settings/members',
        method: 'post',
        data,
      }),
      invalidatesTags: [{ type: 'Members', id: 'LIST' }],
    }),
    updateMember: builder.mutation<
      WorkspaceMember,
      { id: string; data: UpdateMemberRequest }
    >({
      query: ({ id, data }) => ({
        url: `/settings/members/${id}`,
        method: 'put',
        data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Members', id },
        { type: 'Members', id: 'LIST' },
      ],
    }),
    removeMember: builder.mutation<void, string>({
      query: (id) => ({
        url: `/settings/members/${id}`,
        method: 'delete',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Members', id },
        { type: 'Members', id: 'LIST' },
      ],
    }),
    getTokens: builder.query<ApiTokenResponse[], void>({
      query: () => ({
        url: '/settings/tokens',
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((token) => ({
                type: 'Tokens' as const,
                id: token.id,
              })),
              { type: 'Tokens' as const, id: 'LIST' },
            ]
          : [{ type: 'Tokens' as const, id: 'LIST' }],
    }),
    createToken: builder.mutation<CreateTokenResponse, CreateTokenRequest>({
      query: (data) => ({
        url: '/settings/tokens',
        method: 'post',
        data,
      }),
      invalidatesTags: [{ type: 'Tokens', id: 'LIST' }],
    }),
    deleteToken: builder.mutation<void, string>({
      query: (id) => ({
        url: `/settings/tokens/${id}`,
        method: 'delete',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Tokens', id },
        { type: 'Tokens', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetProjectSettingsQuery,
  useUpdateProjectSettingsMutation,
  useGetMembersQuery,
  useAddMemberMutation,
  useUpdateMemberMutation,
  useRemoveMemberMutation,
  useGetTokensQuery,
  useCreateTokenMutation,
  useDeleteTokenMutation,
} = settingsQueries;
