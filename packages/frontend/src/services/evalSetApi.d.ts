import { EvalSet, EvalSetItem, EvalSetType, PaginatedResponse } from '@eva/shared';
export interface CreateEvalSetData {
    name: string;
    type: EvalSetType;
    description?: string;
    sourceType: string;
    gitRepoUrl?: string;
    publicEvalSetId?: string;
    fileUrl?: string;
    odpsTableName?: string;
    odpsPartition?: string;
    exampleFileUrl?: string;
    aiModelId?: string;
    aiGenerateCount?: number;
    columns?: Array<{
        name: string;
        type: string;
    }>;
    sdkEndpoint?: string;
    sdkApiKey?: string;
}
export interface UpdateEvalSetData {
    name?: string;
    description?: string;
    gitRepoUrl?: string;
}
export interface QueryEvalSetParams {
    page?: number;
    pageSize?: number;
    type?: EvalSetType;
    keyword?: string;
}
export interface CreateEvalSetItemData {
    input: Record<string, unknown>;
    output?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
}
export interface UpdateEvalSetItemData {
    input?: Record<string, unknown>;
    output?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
}
export declare const evalSetApi: {
    getEvalSets: (params?: QueryEvalSetParams) => Promise<PaginatedResponse<EvalSet>>;
    getEvalSet: (id: string) => Promise<EvalSet>;
    createEvalSet: (data: CreateEvalSetData) => Promise<EvalSet>;
    updateEvalSet: (id: string, data: UpdateEvalSetData) => Promise<EvalSet>;
    deleteEvalSet: (id: string) => Promise<void>;
    addTag: (id: string, tagName: string) => Promise<EvalSet>;
    removeTag: (id: string, tagName: string) => Promise<void>;
};
export declare const evalSetItemApi: {
    getItems: (evalSetId: string, params?: {
        page?: number;
        pageSize?: number;
    }) => Promise<PaginatedResponse<EvalSetItem>>;
    createItem: (evalSetId: string, data: CreateEvalSetItemData) => Promise<EvalSetItem>;
    updateItem: (evalSetId: string, itemId: string, data: UpdateEvalSetItemData) => Promise<EvalSetItem>;
    deleteItem: (evalSetId: string, itemId: string) => Promise<void>;
    batchImport: (evalSetId: string, fileUrl: string) => Promise<{
        imported: number;
    }>;
    exportItems: (evalSetId: string) => Promise<{
        fileUrl: string;
    }>;
};
declare const _default: {
    items: {
        getItems: (evalSetId: string, params?: {
            page?: number;
            pageSize?: number;
        }) => Promise<PaginatedResponse<EvalSetItem>>;
        createItem: (evalSetId: string, data: CreateEvalSetItemData) => Promise<EvalSetItem>;
        updateItem: (evalSetId: string, itemId: string, data: UpdateEvalSetItemData) => Promise<EvalSetItem>;
        deleteItem: (evalSetId: string, itemId: string) => Promise<void>;
        batchImport: (evalSetId: string, fileUrl: string) => Promise<{
            imported: number;
        }>;
        exportItems: (evalSetId: string) => Promise<{
            fileUrl: string;
        }>;
    };
    getEvalSets: (params?: QueryEvalSetParams) => Promise<PaginatedResponse<EvalSet>>;
    getEvalSet: (id: string) => Promise<EvalSet>;
    createEvalSet: (data: CreateEvalSetData) => Promise<EvalSet>;
    updateEvalSet: (id: string, data: UpdateEvalSetData) => Promise<EvalSet>;
    deleteEvalSet: (id: string) => Promise<void>;
    addTag: (id: string, tagName: string) => Promise<EvalSet>;
    removeTag: (id: string, tagName: string) => Promise<void>;
};
export default _default;
