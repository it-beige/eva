import { ProjectSettings, Member, ApiToken, UpdateProjectRequest, AddMemberRequest, UpdateMemberRequest, CreateTokenRequest } from '../services/settingsApi';
interface SettingsState {
    project: ProjectSettings | null;
    projectLoading: boolean;
    projectSaving: boolean;
    members: Member[];
    membersLoading: boolean;
    memberActionLoading: boolean;
    tokens: ApiToken[];
    tokensLoading: boolean;
    tokenActionLoading: boolean;
    newlyCreatedToken: string | null;
    error: string | null;
    successMessage: string | null;
}
export declare const fetchProjectSettings: import("@reduxjs/toolkit").AsyncThunk<ProjectSettings, void, import("@reduxjs/toolkit").AsyncThunkConfig>;
export declare const updateProjectSettings: import("@reduxjs/toolkit").AsyncThunk<ProjectSettings, UpdateProjectRequest, import("@reduxjs/toolkit").AsyncThunkConfig>;
export declare const fetchMembers: import("@reduxjs/toolkit").AsyncThunk<Member[], void, import("@reduxjs/toolkit").AsyncThunkConfig>;
export declare const addMember: import("@reduxjs/toolkit").AsyncThunk<Member, AddMemberRequest, import("@reduxjs/toolkit").AsyncThunkConfig>;
export declare const updateMember: import("@reduxjs/toolkit").AsyncThunk<Member, {
    id: string;
    data: UpdateMemberRequest;
}, import("@reduxjs/toolkit").AsyncThunkConfig>;
export declare const removeMember: import("@reduxjs/toolkit").AsyncThunk<string, string, import("@reduxjs/toolkit").AsyncThunkConfig>;
export declare const fetchTokens: import("@reduxjs/toolkit").AsyncThunk<ApiToken[], void, import("@reduxjs/toolkit").AsyncThunkConfig>;
export declare const createToken: import("@reduxjs/toolkit").AsyncThunk<import("../services/settingsApi").CreateTokenResponse, CreateTokenRequest, import("@reduxjs/toolkit").AsyncThunkConfig>;
export declare const deleteToken: import("@reduxjs/toolkit").AsyncThunk<string, string, import("@reduxjs/toolkit").AsyncThunkConfig>;
export declare const clearError: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"settings/clearError">, clearSuccessMessage: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"settings/clearSuccessMessage">, clearNewlyCreatedToken: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"settings/clearNewlyCreatedToken">, setSuccessMessage: import("@reduxjs/toolkit").ActionCreatorWithPayload<string, "settings/setSuccessMessage">;
declare const _default: import("@reduxjs/toolkit").Reducer<SettingsState>;
export default _default;
