import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { evalTaskApi, } from '../services/evalTaskApi';
import { EvalTaskStatus } from '@eva/shared';
const initialState = {
    tasks: [],
    loading: false,
    error: null,
    total: 0,
    page: 1,
    pageSize: 20,
    totalPages: 0,
    currentTask: null,
    logs: [],
    selectedTaskIds: [],
};
// 异步 Thunks
export const fetchEvalTasks = createAsyncThunk('evalTask/fetchEvalTasks', async (params, { rejectWithValue }) => {
    try {
        const response = await evalTaskApi.getEvalTasks(params);
        return response;
    }
    catch (error) {
        return rejectWithValue(error.response?.data?.message || '获取评测任务列表失败');
    }
});
export const fetchEvalTaskById = createAsyncThunk('evalTask/fetchEvalTaskById', async (id, { rejectWithValue }) => {
    try {
        const response = await evalTaskApi.getEvalTask(id);
        return response;
    }
    catch (error) {
        return rejectWithValue(error.response?.data?.message || '获取评测任务详情失败');
    }
});
export const createEvalTask = createAsyncThunk('evalTask/createEvalTask', async (data, { rejectWithValue }) => {
    try {
        const response = await evalTaskApi.createEvalTask(data);
        return response;
    }
    catch (error) {
        return rejectWithValue(error.response?.data?.message || '创建评测任务失败');
    }
});
export const copyEvalTask = createAsyncThunk('evalTask/copyEvalTask', async (id, { rejectWithValue }) => {
    try {
        const response = await evalTaskApi.copyEvalTask(id);
        return response;
    }
    catch (error) {
        return rejectWithValue(error.response?.data?.message || '复制评测任务失败');
    }
});
export const abortEvalTask = createAsyncThunk('evalTask/abortEvalTask', async (id, { rejectWithValue }) => {
    try {
        const response = await evalTaskApi.abortEvalTask(id);
        return response;
    }
    catch (error) {
        return rejectWithValue(error.response?.data?.message || '中止评测任务失败');
    }
});
export const fetchEvalTaskLogs = createAsyncThunk('evalTask/fetchEvalTaskLogs', async (id, { rejectWithValue }) => {
    try {
        const response = await evalTaskApi.getEvalTaskLogs(id);
        return response;
    }
    catch (error) {
        return rejectWithValue(error.response?.data?.message || '获取任务日志失败');
    }
});
export const batchAbortEvalTasks = createAsyncThunk('evalTask/batchAbortEvalTasks', async (ids, { rejectWithValue }) => {
    try {
        const response = await evalTaskApi.batchOperation({ ids, operation: 'abort' });
        return { ...response, ids };
    }
    catch (error) {
        return rejectWithValue(error.response?.data?.message || '批量中止任务失败');
    }
});
export const batchDeleteEvalTasks = createAsyncThunk('evalTask/batchDeleteEvalTasks', async (ids, { rejectWithValue }) => {
    try {
        const response = await evalTaskApi.batchOperation({ ids, operation: 'delete' });
        return { ...response, ids };
    }
    catch (error) {
        return rejectWithValue(error.response?.data?.message || '批量删除任务失败');
    }
});
const evalTaskSlice = createSlice({
    name: 'evalTask',
    initialState,
    reducers: {
        setPage: (state, action) => {
            state.page = action.payload;
        },
        setPageSize: (state, action) => {
            state.pageSize = action.payload;
        },
        clearCurrentTask: (state) => {
            state.currentTask = null;
            state.logs = [];
        },
        clearError: (state) => {
            state.error = null;
        },
        setSelectedTaskIds: (state, action) => {
            state.selectedTaskIds = action.payload;
        },
        updateTaskProgress: (state, action) => {
            const { taskId, progress } = action.payload;
            const task = state.tasks.find((t) => t.id === taskId);
            if (task) {
                task.progress = progress;
            }
            if (state.currentTask?.id === taskId) {
                state.currentTask.progress = progress;
            }
        },
        updateTaskStatus: (state, action) => {
            const { taskId, status } = action.payload;
            const task = state.tasks.find((t) => t.id === taskId);
            if (task) {
                task.status = status;
            }
            if (state.currentTask?.id === taskId) {
                state.currentTask.status = status;
            }
        },
        addLog: (state, action) => {
            const { taskId, log } = action.payload;
            if (state.currentTask?.id === taskId) {
                state.logs.push(log);
            }
        },
    },
    extraReducers: (builder) => {
        // Fetch EvalTasks
        builder.addCase(fetchEvalTasks.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchEvalTasks.fulfilled, (state, action) => {
            state.loading = false;
            state.tasks = action.payload.items;
            state.total = action.payload.total;
            state.page = action.payload.page;
            state.pageSize = action.payload.pageSize;
            state.totalPages = action.payload.totalPages;
        });
        builder.addCase(fetchEvalTasks.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });
        // Fetch EvalTask By Id
        builder.addCase(fetchEvalTaskById.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchEvalTaskById.fulfilled, (state, action) => {
            state.loading = false;
            state.currentTask = action.payload;
        });
        builder.addCase(fetchEvalTaskById.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });
        // Create EvalTask
        builder.addCase(createEvalTask.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(createEvalTask.fulfilled, (state, action) => {
            state.loading = false;
            state.tasks.unshift(action.payload);
            state.total += 1;
        });
        builder.addCase(createEvalTask.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });
        // Copy EvalTask
        builder.addCase(copyEvalTask.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(copyEvalTask.fulfilled, (state, action) => {
            state.loading = false;
            state.tasks.unshift(action.payload);
            state.total += 1;
        });
        builder.addCase(copyEvalTask.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });
        // Abort EvalTask
        builder.addCase(abortEvalTask.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(abortEvalTask.fulfilled, (state, action) => {
            state.loading = false;
            const index = state.tasks.findIndex((t) => t.id === action.payload.id);
            if (index !== -1) {
                state.tasks[index] = action.payload;
            }
            if (state.currentTask?.id === action.payload.id) {
                state.currentTask = action.payload;
            }
        });
        builder.addCase(abortEvalTask.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });
        // Fetch EvalTask Logs
        builder.addCase(fetchEvalTaskLogs.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchEvalTaskLogs.fulfilled, (state, action) => {
            state.loading = false;
            state.logs = action.payload;
        });
        builder.addCase(fetchEvalTaskLogs.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });
        // Batch Abort EvalTasks
        builder.addCase(batchAbortEvalTasks.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(batchAbortEvalTasks.fulfilled, (state, action) => {
            state.loading = false;
            const { ids } = action.payload;
            state.tasks = state.tasks.map((task) => {
                if (ids.includes(task.id)) {
                    return { ...task, status: EvalTaskStatus.ABORTED };
                }
                return task;
            });
            state.selectedTaskIds = [];
        });
        builder.addCase(batchAbortEvalTasks.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });
        // Batch Delete EvalTasks
        builder.addCase(batchDeleteEvalTasks.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(batchDeleteEvalTasks.fulfilled, (state, action) => {
            state.loading = false;
            const { ids } = action.payload;
            state.tasks = state.tasks.filter((task) => !ids.includes(task.id));
            state.total -= ids.length;
            state.selectedTaskIds = [];
        });
        builder.addCase(batchDeleteEvalTasks.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });
    },
});
export const { setPage, setPageSize, clearCurrentTask, clearError, setSelectedTaskIds, updateTaskProgress, updateTaskStatus, addLog, } = evalTaskSlice.actions;
export default evalTaskSlice.reducer;
