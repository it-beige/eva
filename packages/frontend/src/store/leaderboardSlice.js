import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { leaderboardApi, } from '../services/leaderboardApi';
const initialState = {
    items: [],
    summary: null,
    loading: false,
    summaryLoading: false,
    error: null,
    total: 0,
    page: 1,
    pageSize: 10,
    totalPages: 0,
    filters: {
        sortBy: 'score',
        order: 'desc',
    },
};
// 异步 Thunks
export const fetchLeaderboard = createAsyncThunk('leaderboard/fetchLeaderboard', async (params, { rejectWithValue }) => {
    try {
        const response = await leaderboardApi.getLeaderboard(params);
        return response;
    }
    catch (error) {
        return rejectWithValue(error.response?.data?.message || '获取排行榜失败');
    }
});
export const fetchLeaderboardSummary = createAsyncThunk('leaderboard/fetchSummary', async (_, { rejectWithValue }) => {
    try {
        const response = await leaderboardApi.getSummary();
        return response;
    }
    catch (error) {
        return rejectWithValue(error.response?.data?.message || '获取汇总统计失败');
    }
});
const leaderboardSlice = createSlice({
    name: 'leaderboard',
    initialState,
    reducers: {
        setPage: (state, action) => {
            state.page = action.payload;
        },
        setPageSize: (state, action) => {
            state.pageSize = action.payload;
            state.page = 1;
        },
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
            state.page = 1;
        },
        setEvalSetFilter: (state, action) => {
            state.filters.evalSetId = action.payload;
            state.page = 1;
        },
        setMetricFilter: (state, action) => {
            state.filters.metricId = action.payload;
            state.page = 1;
        },
        setSortBy: (state, action) => {
            state.filters.sortBy = action.payload;
        },
        setOrder: (state, action) => {
            state.filters.order = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
        resetFilters: (state) => {
            state.filters = {
                sortBy: 'score',
                order: 'desc',
            };
            state.page = 1;
        },
    },
    extraReducers: (builder) => {
        // Fetch Leaderboard
        builder.addCase(fetchLeaderboard.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchLeaderboard.fulfilled, (state, action) => {
            state.loading = false;
            state.items = action.payload.items;
            state.total = action.payload.total;
            state.page = action.payload.page;
            state.pageSize = action.payload.pageSize;
            state.totalPages = action.payload.totalPages;
        });
        builder.addCase(fetchLeaderboard.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });
        // Fetch Summary
        builder.addCase(fetchLeaderboardSummary.pending, (state) => {
            state.summaryLoading = true;
        });
        builder.addCase(fetchLeaderboardSummary.fulfilled, (state, action) => {
            state.summaryLoading = false;
            state.summary = action.payload;
        });
        builder.addCase(fetchLeaderboardSummary.rejected, (state, action) => {
            state.summaryLoading = false;
            state.error = action.payload;
        });
    },
});
export const { setPage, setPageSize, setFilters, setEvalSetFilter, setMetricFilter, setSortBy, setOrder, clearError, resetFilters, } = leaderboardSlice.actions;
export default leaderboardSlice.reducer;
