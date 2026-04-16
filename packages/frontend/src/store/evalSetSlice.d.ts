import { EvalSet, EvalSetItem, EvalSetType, PaginatedResponse } from '@eva/shared';
import { CreateEvalSetData, UpdateEvalSetData, CreateEvalSetItemData, UpdateEvalSetItemData } from '../services/evalSetApi';
interface EvalSetState {
    evalSets: EvalSet[];
    total: number;
    page: number;
    pageSize: number;
    loading: boolean;
    error: string | null;
    currentEvalSet: EvalSet | null;
    detailLoading: boolean;
    items: EvalSetItem[];
    itemsTotal: number;
    itemsPage: number;
    itemsPageSize: number;
    itemsLoading: boolean;
    creating: boolean;
    updating: boolean;
    deleting: boolean;
    filterType: EvalSetType | undefined;
    keyword: string;
}
export declare const fetchEvalSets: import("@reduxjs/toolkit").AsyncThunk<PaginatedResponse<EvalSet>, {
    page?: number;
    pageSize?: number;
    type?: EvalSetType;
    keyword?: string;
}, import("@reduxjs/toolkit").AsyncThunkConfig>;
export declare const fetchEvalSet: import("@reduxjs/toolkit").AsyncThunk<EvalSet, string, import("@reduxjs/toolkit").AsyncThunkConfig>;
export declare const createEvalSet: import("@reduxjs/toolkit").AsyncThunk<EvalSet, CreateEvalSetData, import("@reduxjs/toolkit").AsyncThunkConfig>;
export declare const updateEvalSet: import("@reduxjs/toolkit").AsyncThunk<EvalSet, {
    id: string;
    data: UpdateEvalSetData;
}, import("@reduxjs/toolkit").AsyncThunkConfig>;
export declare const deleteEvalSet: import("@reduxjs/toolkit").AsyncThunk<string, string, import("@reduxjs/toolkit").AsyncThunkConfig>;
export declare const fetchEvalSetItems: import("@reduxjs/toolkit").AsyncThunk<PaginatedResponse<EvalSetItem>, {
    evalSetId: string;
    params?: {
        page?: number;
        pageSize?: number;
    };
}, import("@reduxjs/toolkit").AsyncThunkConfig>;
export declare const createEvalSetItem: import("@reduxjs/toolkit").AsyncThunk<EvalSetItem, {
    evalSetId: string;
    data: CreateEvalSetItemData;
}, import("@reduxjs/toolkit").AsyncThunkConfig>;
export declare const updateEvalSetItem: import("@reduxjs/toolkit").AsyncThunk<EvalSetItem, {
    evalSetId: string;
    itemId: string;
    data: UpdateEvalSetItemData;
}, import("@reduxjs/toolkit").AsyncThunkConfig>;
export declare const deleteEvalSetItem: import("@reduxjs/toolkit").AsyncThunk<string, {
    evalSetId: string;
    itemId: string;
}, import("@reduxjs/toolkit").AsyncThunkConfig>;
export declare const setFilterType: import("@reduxjs/toolkit").ActionCreatorWithOptionalPayload<EvalSetType | undefined, "evalSet/setFilterType">, setKeyword: import("@reduxjs/toolkit").ActionCreatorWithPayload<string, "evalSet/setKeyword">, clearCurrentEvalSet: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"evalSet/clearCurrentEvalSet">, clearError: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"evalSet/clearError">, setPage: import("@reduxjs/toolkit").ActionCreatorWithPayload<number, "evalSet/setPage">, setPageSize: import("@reduxjs/toolkit").ActionCreatorWithPayload<number, "evalSet/setPageSize">, setItemsPage: import("@reduxjs/toolkit").ActionCreatorWithPayload<number, "evalSet/setItemsPage">, setItemsPageSize: import("@reduxjs/toolkit").ActionCreatorWithPayload<number, "evalSet/setItemsPageSize">;
declare const _default: import("@reduxjs/toolkit").Reducer<EvalSetState>;
export default _default;
