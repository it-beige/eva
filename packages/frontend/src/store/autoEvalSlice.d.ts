import { AutoEval, AutoEvalStatus, PaginatedResponse, MetricType } from '@eva/shared';
import { QueryAutoEvalParams, CreateAutoEvalData, UpdateAutoEvalData, DebugFilterData, DebugEvalData, DebugFilterResult, DebugEvalResult, FilterRules } from '../services/autoEvalApi';
interface AutoEvalState {
    items: AutoEval[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    currentAutoEval: AutoEval | null;
    keyword: string;
    selectedStatus: AutoEvalStatus | null;
    selectedRowKeys: string[];
    loading: boolean;
    creating: boolean;
    updating: boolean;
    deleting: boolean;
    debugFilterResults: DebugFilterResult[];
    debugEvalResults: DebugEvalResult[];
    debugLoading: boolean;
    createForm: {
        name: string;
        status: AutoEvalStatus;
        filterRules: FilterRules;
        sampleRate: number;
        metricIds: string[];
        selectedMetricType: MetricType;
    };
    error: string | null;
}
export declare const fetchAutoEvals: import("@reduxjs/toolkit").AsyncThunk<PaginatedResponse<AutoEval>, QueryAutoEvalParams, import("@reduxjs/toolkit").AsyncThunkConfig>;
export declare const fetchAutoEvalById: import("@reduxjs/toolkit").AsyncThunk<AutoEval, string, import("@reduxjs/toolkit").AsyncThunkConfig>;
export declare const createAutoEval: import("@reduxjs/toolkit").AsyncThunk<AutoEval, CreateAutoEvalData, import("@reduxjs/toolkit").AsyncThunkConfig>;
export declare const updateAutoEval: import("@reduxjs/toolkit").AsyncThunk<AutoEval, {
    id: string;
    data: UpdateAutoEvalData;
}, import("@reduxjs/toolkit").AsyncThunkConfig>;
export declare const deleteAutoEval: import("@reduxjs/toolkit").AsyncThunk<string, string, import("@reduxjs/toolkit").AsyncThunkConfig>;
export declare const deleteAutoEvals: import("@reduxjs/toolkit").AsyncThunk<string[], string[], import("@reduxjs/toolkit").AsyncThunkConfig>;
export declare const debugFilter: import("@reduxjs/toolkit").AsyncThunk<DebugFilterResult[], DebugFilterData, import("@reduxjs/toolkit").AsyncThunkConfig>;
export declare const debugEval: import("@reduxjs/toolkit").AsyncThunk<DebugEvalResult[], DebugEvalData, import("@reduxjs/toolkit").AsyncThunkConfig>;
export declare const setKeyword: import("@reduxjs/toolkit").ActionCreatorWithPayload<string, "autoEval/setKeyword">, setSelectedStatus: import("@reduxjs/toolkit").ActionCreatorWithPayload<AutoEvalStatus | null, "autoEval/setSelectedStatus">, setPage: import("@reduxjs/toolkit").ActionCreatorWithPayload<number, "autoEval/setPage">, setPageSize: import("@reduxjs/toolkit").ActionCreatorWithPayload<number, "autoEval/setPageSize">, setSelectedRowKeys: import("@reduxjs/toolkit").ActionCreatorWithPayload<string[], "autoEval/setSelectedRowKeys">, setCurrentAutoEval: import("@reduxjs/toolkit").ActionCreatorWithPayload<AutoEval | null, "autoEval/setCurrentAutoEval">, setCreateFormName: import("@reduxjs/toolkit").ActionCreatorWithPayload<string, "autoEval/setCreateFormName">, setCreateFormStatus: import("@reduxjs/toolkit").ActionCreatorWithPayload<AutoEvalStatus, "autoEval/setCreateFormStatus">, setCreateFormFilterRules: import("@reduxjs/toolkit").ActionCreatorWithPayload<FilterRules, "autoEval/setCreateFormFilterRules">, setCreateFormSampleRate: import("@reduxjs/toolkit").ActionCreatorWithPayload<number, "autoEval/setCreateFormSampleRate">, setCreateFormMetricIds: import("@reduxjs/toolkit").ActionCreatorWithPayload<string[], "autoEval/setCreateFormMetricIds">, setCreateFormMetricType: import("@reduxjs/toolkit").ActionCreatorWithPayload<MetricType, "autoEval/setCreateFormMetricType">, addFilterCondition: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    field: string;
    operator: string;
    value: string;
}, "autoEval/addFilterCondition">, removeFilterCondition: import("@reduxjs/toolkit").ActionCreatorWithPayload<number, "autoEval/removeFilterCondition">, updateFilterCondition: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    index: number;
    field?: string;
    operator?: string;
    value?: string;
}, "autoEval/updateFilterCondition">, clearDebugResults: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"autoEval/clearDebugResults">, resetCreateForm: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"autoEval/resetCreateForm">, clearError: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"autoEval/clearError">, resetState: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"autoEval/resetState">;
declare const _default: import("@reduxjs/toolkit").Reducer<AutoEvalState>;
export default _default;
