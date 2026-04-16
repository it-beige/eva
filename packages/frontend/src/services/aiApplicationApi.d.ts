export interface AIApplication {
    id: string;
    name: string;
    description: string | null;
    icon: string | null;
    latestVersion: string | null;
    gitRepoUrl: string | null;
    projectId: string;
    createdAt: string;
    updatedAt: string;
    versions?: AppVersion[];
}
export interface AppVersion {
    id: string;
    appId: string;
    version: string;
    config: Record<string, unknown> | null;
    createdAt: string;
}
export interface CreateApplicationRequest {
    name: string;
    description?: string;
    icon?: string;
    gitRepoUrl?: string;
    projectId: string;
}
export interface UpdateApplicationRequest {
    name?: string;
    description?: string;
    icon?: string;
    gitRepoUrl?: string;
    projectId?: string;
}
export interface ImportPublicAgentRequest {
    name: string;
    gitRepoUrl: string;
    projectId: string;
}
export interface CreateVersionRequest {
    version: string;
    config?: Record<string, unknown>;
}
export interface QueryApplicationsParams {
    page?: number;
    pageSize?: number;
    keyword?: string;
    projectId?: string;
}
export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}
export declare const aiApplicationApi: {
    getApplications: (params?: QueryApplicationsParams) => Promise<PaginatedResponse<AIApplication>>;
    getApplication: (id: string) => Promise<AIApplication>;
    createApplication: (data: CreateApplicationRequest) => Promise<AIApplication>;
    updateApplication: (id: string, data: UpdateApplicationRequest) => Promise<AIApplication>;
    deleteApplication: (id: string) => Promise<{
        message: string;
    }>;
    getVersions: (appId: string) => Promise<AppVersion[]>;
    createVersion: (appId: string, data: CreateVersionRequest) => Promise<AppVersion>;
    importPublicAgent: (data: ImportPublicAgentRequest) => Promise<AIApplication>;
};
export default aiApplicationApi;
