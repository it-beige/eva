export interface Prompt {
    id: string;
    name: string;
    content: string;
    metadata: Record<string, unknown> | null;
    description: string | null;
    version: number;
    createdBy: string | null;
    createdAt: string;
    updatedAt: string;
    versions?: PromptVersion[];
}
export interface PromptVersion {
    id: string;
    promptId: string;
    version: number;
    content: string;
    createdAt: string;
}
export interface CreatePromptRequest {
    name: string;
    content: string;
    metadata?: Record<string, unknown>;
    description?: string;
}
export interface UpdatePromptRequest {
    content: string;
    metadata?: Record<string, unknown>;
    description?: string;
}
export interface QueryPromptParams {
    page?: number;
    pageSize?: number;
    keyword?: string;
}
export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}
export declare const promptApi: {
    getPrompts: (params?: QueryPromptParams) => Promise<import("axios").AxiosResponse<PaginatedResponse<Prompt>, any, {}>>;
    getPrompt: (id: string) => Promise<import("axios").AxiosResponse<Prompt, any, {}>>;
    createPrompt: (data: CreatePromptRequest) => Promise<import("axios").AxiosResponse<Prompt, any, {}>>;
    updatePrompt: (id: string, data: UpdatePromptRequest) => Promise<import("axios").AxiosResponse<Prompt, any, {}>>;
    deletePrompt: (id: string) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    getVersions: (promptId: string) => Promise<import("axios").AxiosResponse<PromptVersion[], any, {}>>;
    getVersion: (promptId: string, versionId: string) => Promise<import("axios").AxiosResponse<PromptVersion, any, {}>>;
};
export default promptApi;
