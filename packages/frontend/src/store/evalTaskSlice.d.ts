import { EvalTaskWithEvalSet, CreateEvalTaskRequest, QueryEvalTasksParams } from '../services/evalTaskApi';
import { EvalTaskStatus } from '@eva/shared';
interface EvalTaskState {
    tasks: EvalTaskWithEvalSet[];
    loading: boolean;
    error: string | null;
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    currentTask: EvalTaskWithEvalSet | null;
    logs: string[];
    selectedTaskIds: string[];
}
export declare const fetchEvalTasks: import("@reduxjs/toolkit").AsyncThunk<import("@eva/shared").PaginatedResponse<EvalTaskWithEvalSet>, QueryEvalTasksParams, import("@reduxjs/toolkit").AsyncThunkConfig>;
export declare const fetchEvalTaskById: import("@reduxjs/toolkit").AsyncThunk<EvalTaskWithEvalSet, string, import("@reduxjs/toolkit").AsyncThunkConfig>;
export declare const createEvalTask: import("@reduxjs/toolkit").AsyncThunk<import("@eva/shared").EvalTask, CreateEvalTaskRequest, import("@reduxjs/toolkit").AsyncThunkConfig>;
export declare const copyEvalTask: import("@reduxjs/toolkit").AsyncThunk<import("@eva/shared").EvalTask, string, import("@reduxjs/toolkit").AsyncThunkConfig>;
export declare const abortEvalTask: import("@reduxjs/toolkit").AsyncThunk<import("@eva/shared").EvalTask, string, import("@reduxjs/toolkit").AsyncThunkConfig>;
export declare const fetchEvalTaskLogs: import("@reduxjs/toolkit").AsyncThunk<string[], string, import("@reduxjs/toolkit").AsyncThunkConfig>;
export declare const batchAbortEvalTasks: import("@reduxjs/toolkit").AsyncThunk<{
    ids: string[];
    success: number;
    failed: number;
}, string[], import("@reduxjs/toolkit").AsyncThunkConfig>;
export declare const batchDeleteEvalTasks: import("@reduxjs/toolkit").AsyncThunk<{
    ids: string[];
    success: number;
    failed: number;
}, string[], import("@reduxjs/toolkit").AsyncThunkConfig>;
export declare const setPage: import("@reduxjs/toolkit").ActionCreatorWithPayload<number, "evalTask/setPage">, setPageSize: import("@reduxjs/toolkit").ActionCreatorWithPayload<number, "evalTask/setPageSize">, clearCurrentTask: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"evalTask/clearCurrentTask">, clearError: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"evalTask/clearError">, setSelectedTaskIds: import("@reduxjs/toolkit").ActionCreatorWithPayload<string[], "evalTask/setSelectedTaskIds">, updateTaskProgress: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    taskId: string;
    progress: number;
}, "evalTask/updateTaskProgress">, updateTaskStatus: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    taskId: string;
    status: EvalTaskStatus;
}, "evalTask/updateTaskStatus">, addLog: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    taskId: string;
    log: string;
}, "evalTask/addLog">;
declare const _default: import("@reduxjs/toolkit").Reducer<EvalTaskState>;
export default _default;
