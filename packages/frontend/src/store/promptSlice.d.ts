import { Prompt, PromptVersion, CreatePromptRequest, UpdatePromptRequest, QueryPromptParams } from '../services/promptApi';
interface PromptState {
    prompts: Prompt[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    currentPrompt: Prompt | null;
    versions: PromptVersion[];
    loading: boolean;
    error: string | null;
}
export declare const fetchPrompts: import("@reduxjs/toolkit").AsyncThunk<import("../services/promptApi").PaginatedResponse<Prompt>, QueryPromptParams, import("@reduxjs/toolkit").AsyncThunkConfig>;
export declare const fetchPrompt: import("@reduxjs/toolkit").AsyncThunk<Prompt, string, import("@reduxjs/toolkit").AsyncThunkConfig>;
export declare const createPrompt: import("@reduxjs/toolkit").AsyncThunk<Prompt, CreatePromptRequest, import("@reduxjs/toolkit").AsyncThunkConfig>;
export declare const updatePrompt: import("@reduxjs/toolkit").AsyncThunk<Prompt, {
    id: string;
    data: UpdatePromptRequest;
}, import("@reduxjs/toolkit").AsyncThunkConfig>;
export declare const deletePrompt: import("@reduxjs/toolkit").AsyncThunk<string, string, import("@reduxjs/toolkit").AsyncThunkConfig>;
export declare const fetchVersions: import("@reduxjs/toolkit").AsyncThunk<PromptVersion[], string, import("@reduxjs/toolkit").AsyncThunkConfig>;
export declare const setCurrentPrompt: import("@reduxjs/toolkit").ActionCreatorWithPayload<Prompt | null, "prompt/setCurrentPrompt">, clearError: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"prompt/clearError">;
declare const _default: import("@reduxjs/toolkit").Reducer<PromptState>;
export default _default;
