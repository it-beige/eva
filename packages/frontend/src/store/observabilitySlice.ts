import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { observabilityApi } from '../services/observabilityApi';
import type { TraceLog, TraceListResult, QueryTraceParams } from '../types/observability';

// Async thunks
export const fetchTraces = createAsyncThunk(
  'observability/fetchTraces',
  async (params: QueryTraceParams, { rejectWithValue }) => {
    try {
      const response = await observabilityApi.getTraces(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '获取Trace列表失败');
    }
  }
);

export const fetchTraceDetail = createAsyncThunk(
  'observability/fetchTraceDetail',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await observabilityApi.getTraceById(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '获取Trace详情失败');
    }
  }
);

export const fetchBehaviorLogs = createAsyncThunk(
  'observability/fetchBehaviorLogs',
  async (traceId: string, { rejectWithValue }) => {
    try {
      const response = await observabilityApi.getBehaviorLogs(traceId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '获取行为日志失败');
    }
  }
);

interface FilterState {
  timeRange: string;
  startTime?: string;
  endTime?: string;
  idSearch: string;
  status: string;
  userId: string;
  inputKeyword: string;
  outputKeyword: string;
}

interface ObservabilityState {
  traces: TraceLog[];
  total: number;
  currentPage: number;
  pageSize: number;
  filters: FilterState;
  selectedTrace: TraceLog | null;
  behaviorLogs: TraceLog[];
  loading: boolean;
  detailLoading: boolean;
  logsLoading: boolean;
  error: string | null;
}

const getTodayRange = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  return {
    startTime: start.toISOString(),
    endTime: end.toISOString(),
  };
};

const { startTime, endTime } = getTodayRange();

const initialState: ObservabilityState = {
  traces: [],
  total: 0,
  currentPage: 1,
  pageSize: 20,
  filters: {
    timeRange: 'today',
    startTime,
    endTime,
    idSearch: '',
    status: '',
    userId: '',
    inputKeyword: '',
    outputKeyword: '',
  },
  selectedTrace: null,
  behaviorLogs: [],
  loading: false,
  detailLoading: false,
  logsLoading: false,
  error: null,
};

const observabilitySlice = createSlice({
  name: 'observability',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<FilterState>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      const { startTime, endTime } = getTodayRange();
      state.filters = {
        timeRange: 'today',
        startTime,
        endTime,
        idSearch: '',
        status: '',
        userId: '',
        inputKeyword: '',
        outputKeyword: '',
      };
      state.currentPage = 1;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    setPageSize: (state, action: PayloadAction<number>) => {
      state.pageSize = action.payload;
      state.currentPage = 1;
    },
    clearSelectedTrace: (state) => {
      state.selectedTrace = null;
      state.behaviorLogs = [];
    },
  },
  extraReducers: (builder) => {
    // Fetch traces
    builder.addCase(fetchTraces.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchTraces.fulfilled, (state, action: PayloadAction<TraceListResult>) => {
      state.loading = false;
      state.traces = action.payload.list;
      state.total = action.payload.total;
      state.currentPage = action.payload.page;
      state.pageSize = action.payload.pageSize;
    });
    builder.addCase(fetchTraces.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch trace detail
    builder.addCase(fetchTraceDetail.pending, (state) => {
      state.detailLoading = true;
    });
    builder.addCase(fetchTraceDetail.fulfilled, (state, action: PayloadAction<TraceLog>) => {
      state.detailLoading = false;
      state.selectedTrace = action.payload;
    });
    builder.addCase(fetchTraceDetail.rejected, (state, action) => {
      state.detailLoading = false;
      state.error = action.payload as string;
    });

    // Fetch behavior logs
    builder.addCase(fetchBehaviorLogs.pending, (state) => {
      state.logsLoading = true;
    });
    builder.addCase(fetchBehaviorLogs.fulfilled, (state, action: PayloadAction<TraceLog[]>) => {
      state.logsLoading = false;
      state.behaviorLogs = action.payload;
    });
    builder.addCase(fetchBehaviorLogs.rejected, (state, action) => {
      state.logsLoading = false;
      state.error = action.payload as string;
    });
  },
});

export const { setFilters, resetFilters, setPage, setPageSize, clearSelectedTrace } = observabilitySlice.actions;
export default observabilitySlice.reducer;
