import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  leaderboardApi,
  LeaderboardItem,
  LeaderboardSummary,
  QueryLeaderboardParams,
} from '../services/leaderboardApi';

interface LeaderboardState {
  items: LeaderboardItem[];
  summary: LeaderboardSummary | null;
  loading: boolean;
  summaryLoading: boolean;
  error: string | null;
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  filters: {
    evalSetId?: string;
    metricId?: string;
    sortBy: 'score' | 'rank';
    order: 'asc' | 'desc';
  };
}

const initialState: LeaderboardState = {
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
export const fetchLeaderboard = createAsyncThunk(
  'leaderboard/fetchLeaderboard',
  async (params: QueryLeaderboardParams, { rejectWithValue }) => {
    try {
      const response = await leaderboardApi.getLeaderboard(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '获取排行榜失败');
    }
  }
);

export const fetchLeaderboardSummary = createAsyncThunk(
  'leaderboard/fetchSummary',
  async (_, { rejectWithValue }) => {
    try {
      const response = await leaderboardApi.getSummary();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '获取汇总统计失败');
    }
  }
);

const leaderboardSlice = createSlice({
  name: 'leaderboard',
  initialState,
  reducers: {
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    setPageSize: (state, action: PayloadAction<number>) => {
      state.pageSize = action.payload;
      state.page = 1;
    },
    setFilters: (
      state,
      action: PayloadAction<Partial<LeaderboardState['filters']>>
    ) => {
      state.filters = { ...state.filters, ...action.payload };
      state.page = 1;
    },
    setEvalSetFilter: (state, action: PayloadAction<string | undefined>) => {
      state.filters.evalSetId = action.payload;
      state.page = 1;
    },
    setMetricFilter: (state, action: PayloadAction<string | undefined>) => {
      state.filters.metricId = action.payload;
      state.page = 1;
    },
    setSortBy: (state, action: PayloadAction<'score' | 'rank'>) => {
      state.filters.sortBy = action.payload;
    },
    setOrder: (state, action: PayloadAction<'asc' | 'desc'>) => {
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
      state.error = action.payload as string;
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
      state.error = action.payload as string;
    });
  },
});

export const {
  setPage,
  setPageSize,
  setFilters,
  setEvalSetFilter,
  setMetricFilter,
  setSortBy,
  setOrder,
  clearError,
  resetFilters,
} = leaderboardSlice.actions;

export default leaderboardSlice.reducer;
