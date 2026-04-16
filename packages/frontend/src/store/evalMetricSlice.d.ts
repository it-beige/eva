import { EvalMetric, MetricType, MetricScope, PaginatedResponse } from '@eva/shared';
import { QueryEvalMetricParams, CreateEvalMetricData, UpdateEvalMetricData, ParseRepoData, ParseRepoResponse } from '../services/evalMetricApi';
interface EvalMetricState {
    items: EvalMetric[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    currentMetric: EvalMetric | null;
    currentScope: MetricScope;
    keyword: string;
    selectedType: MetricType | null;
    selectedRowKeys: string[];
    loading: boolean;
    creating: boolean;
    updating: boolean;
    deleting: boolean;
    createModalVisible: boolean;
    editingMetric: EvalMetric | null;
    error: string | null;
}
export declare const fetchEvalMetrics: import("@reduxjs/toolkit").AsyncThunk<PaginatedResponse<EvalMetric>, QueryEvalMetricParams, import("@reduxjs/toolkit").AsyncThunkConfig>;
export declare const fetchEvalMetricById: import("@reduxjs/toolkit").AsyncThunk<EvalMetric, string, import("@reduxjs/toolkit").AsyncThunkConfig>;
export declare const createEvalMetric: import("@reduxjs/toolkit").AsyncThunk<EvalMetric, CreateEvalMetricData, import("@reduxjs/toolkit").AsyncThunkConfig>;
export declare const updateEvalMetric: import("@reduxjs/toolkit").AsyncThunk<EvalMetric, {
    id: string;
    data: UpdateEvalMetricData;
}, import("@reduxjs/toolkit").AsyncThunkConfig>;
export declare const deleteEvalMetric: import("@reduxjs/toolkit").AsyncThunk<string, string, import("@reduxjs/toolkit").AsyncThunkConfig>;
export declare const deleteEvalMetrics: import("@reduxjs/toolkit").AsyncThunk<string[], string[], import("@reduxjs/toolkit").AsyncThunkConfig>;
export declare const parseRepoMetrics: import("@reduxjs/toolkit").AsyncThunk<ParseRepoResponse, ParseRepoData, import("@reduxjs/toolkit").AsyncThunkConfig>;
export declare const setCurrentScope: import("@reduxjs/toolkit").ActionCreatorWithPayload<MetricScope, "evalMetric/setCurrentScope">, setKeyword: import("@reduxjs/toolkit").ActionCreatorWithPayload<string, "evalMetric/setKeyword">, setSelectedType: import("@reduxjs/toolkit").ActionCreatorWithPayload<MetricType | null, "evalMetric/setSelectedType">, setPage: import("@reduxjs/toolkit").ActionCreatorWithPayload<number, "evalMetric/setPage">, setPageSize: import("@reduxjs/toolkit").ActionCreatorWithPayload<number, "evalMetric/setPageSize">, setSelectedRowKeys: import("@reduxjs/toolkit").ActionCreatorWithPayload<string[], "evalMetric/setSelectedRowKeys">, setEditingMetric: import("@reduxjs/toolkit").ActionCreatorWithPayload<EvalMetric | null, "evalMetric/setEditingMetric">, showCreateModal: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"evalMetric/showCreateModal">, showEditModal: import("@reduxjs/toolkit").ActionCreatorWithPayload<EvalMetric, "evalMetric/showEditModal">, hideCreateModal: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"evalMetric/hideCreateModal">, clearError: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"evalMetric/clearError">, resetState: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"evalMetric/resetState">;
declare const _default: import("@reduxjs/toolkit").Reducer<EvalMetricState>;
export default _default;
