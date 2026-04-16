import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { aiApplicationApi, } from '../services/aiApplicationApi';
const initialState = {
    applications: [],
    loading: false,
    error: null,
    total: 0,
    page: 1,
    pageSize: 12,
    totalPages: 0,
    currentApplication: null,
};
// 异步 Thunks
export const fetchApplications = createAsyncThunk('aiApplication/fetchApplications', async (params, { rejectWithValue }) => {
    try {
        const response = await aiApplicationApi.getApplications(params);
        return response;
    }
    catch (error) {
        return rejectWithValue(error.response?.data?.message || '获取应用列表失败');
    }
});
export const fetchApplicationById = createAsyncThunk('aiApplication/fetchApplicationById', async (id, { rejectWithValue }) => {
    try {
        const response = await aiApplicationApi.getApplication(id);
        return response;
    }
    catch (error) {
        return rejectWithValue(error.response?.data?.message || '获取应用详情失败');
    }
});
export const createApplication = createAsyncThunk('aiApplication/createApplication', async (data, { rejectWithValue }) => {
    try {
        const response = await aiApplicationApi.createApplication(data);
        return response;
    }
    catch (error) {
        return rejectWithValue(error.response?.data?.message || '创建应用失败');
    }
});
export const updateApplication = createAsyncThunk('aiApplication/updateApplication', async ({ id, data }, { rejectWithValue }) => {
    try {
        const response = await aiApplicationApi.updateApplication(id, data);
        return response;
    }
    catch (error) {
        return rejectWithValue(error.response?.data?.message || '更新应用失败');
    }
});
export const deleteApplication = createAsyncThunk('aiApplication/deleteApplication', async (id, { rejectWithValue }) => {
    try {
        await aiApplicationApi.deleteApplication(id);
        return id;
    }
    catch (error) {
        return rejectWithValue(error.response?.data?.message || '删除应用失败');
    }
});
export const importPublicAgent = createAsyncThunk('aiApplication/importPublicAgent', async (data, { rejectWithValue }) => {
    try {
        const response = await aiApplicationApi.importPublicAgent(data);
        return response;
    }
    catch (error) {
        return rejectWithValue(error.response?.data?.message || '引用公共Agent失败');
    }
});
const aiApplicationSlice = createSlice({
    name: 'aiApplication',
    initialState,
    reducers: {
        setPage: (state, action) => {
            state.page = action.payload;
        },
        setPageSize: (state, action) => {
            state.pageSize = action.payload;
        },
        clearCurrentApplication: (state) => {
            state.currentApplication = null;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // Fetch Applications
        builder.addCase(fetchApplications.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchApplications.fulfilled, (state, action) => {
            state.loading = false;
            state.applications = action.payload.items;
            state.total = action.payload.total;
            state.page = action.payload.page;
            state.pageSize = action.payload.pageSize;
            state.totalPages = action.payload.totalPages;
        });
        builder.addCase(fetchApplications.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });
        // Fetch Application By Id
        builder.addCase(fetchApplicationById.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchApplicationById.fulfilled, (state, action) => {
            state.loading = false;
            state.currentApplication = action.payload;
        });
        builder.addCase(fetchApplicationById.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });
        // Create Application
        builder.addCase(createApplication.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(createApplication.fulfilled, (state, action) => {
            state.loading = false;
            state.applications.unshift(action.payload);
            state.total += 1;
        });
        builder.addCase(createApplication.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });
        // Update Application
        builder.addCase(updateApplication.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(updateApplication.fulfilled, (state, action) => {
            state.loading = false;
            const index = state.applications.findIndex((app) => app.id === action.payload.id);
            if (index !== -1) {
                state.applications[index] = action.payload;
            }
            if (state.currentApplication?.id === action.payload.id) {
                state.currentApplication = action.payload;
            }
        });
        builder.addCase(updateApplication.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });
        // Delete Application
        builder.addCase(deleteApplication.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(deleteApplication.fulfilled, (state, action) => {
            state.loading = false;
            state.applications = state.applications.filter((app) => app.id !== action.payload);
            state.total -= 1;
            if (state.currentApplication?.id === action.payload) {
                state.currentApplication = null;
            }
        });
        builder.addCase(deleteApplication.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });
        // Import Public Agent
        builder.addCase(importPublicAgent.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(importPublicAgent.fulfilled, (state, action) => {
            state.loading = false;
            state.applications.unshift(action.payload);
            state.total += 1;
        });
        builder.addCase(importPublicAgent.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });
    },
});
export const { setPage, setPageSize, clearCurrentApplication, clearError } = aiApplicationSlice.actions;
export default aiApplicationSlice.reducer;
