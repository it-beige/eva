import { AIApplication, CreateApplicationRequest, UpdateApplicationRequest, ImportPublicAgentRequest, QueryApplicationsParams } from '../services/aiApplicationApi';
interface AIApplicationState {
    applications: AIApplication[];
    loading: boolean;
    error: string | null;
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    currentApplication: AIApplication | null;
}
export declare const fetchApplications: import("@reduxjs/toolkit").AsyncThunk<import("../services/aiApplicationApi").PaginatedResponse<AIApplication>, QueryApplicationsParams, import("@reduxjs/toolkit").AsyncThunkConfig>;
export declare const fetchApplicationById: import("@reduxjs/toolkit").AsyncThunk<AIApplication, string, import("@reduxjs/toolkit").AsyncThunkConfig>;
export declare const createApplication: import("@reduxjs/toolkit").AsyncThunk<AIApplication, CreateApplicationRequest, import("@reduxjs/toolkit").AsyncThunkConfig>;
export declare const updateApplication: import("@reduxjs/toolkit").AsyncThunk<AIApplication, {
    id: string;
    data: UpdateApplicationRequest;
}, import("@reduxjs/toolkit").AsyncThunkConfig>;
export declare const deleteApplication: import("@reduxjs/toolkit").AsyncThunk<string, string, import("@reduxjs/toolkit").AsyncThunkConfig>;
export declare const importPublicAgent: import("@reduxjs/toolkit").AsyncThunk<AIApplication, ImportPublicAgentRequest, import("@reduxjs/toolkit").AsyncThunkConfig>;
export declare const setPage: import("@reduxjs/toolkit").ActionCreatorWithPayload<number, "aiApplication/setPage">, setPageSize: import("@reduxjs/toolkit").ActionCreatorWithPayload<number, "aiApplication/setPageSize">, clearCurrentApplication: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"aiApplication/clearCurrentApplication">, clearError: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"aiApplication/clearError">;
declare const _default: import("@reduxjs/toolkit").Reducer<AIApplicationState>;
export default _default;
