import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  playgroundApi,
  RunPlaygroundRequest,
  PlaygroundStreamEvent,
} from '../services/playgroundApi';

interface PlaygroundState {
  input: string;
  output: string;
  isStreaming: boolean;
  loading: boolean;
  error: string | null;
  usage: {
    inputTokens: number;
    outputTokens: number;
  } | null;
  duration: number | null;
  history: Array<{
    id: string;
    input: string;
    output: string;
    timestamp: number;
  }>;
}

const initialState: PlaygroundState = {
  input: '',
  output: '',
  isStreaming: false,
  loading: false,
  error: null,
  usage: null,
  duration: null,
  history: [],
};

// 异步 Thunks
export const runPlayground = createAsyncThunk(
  'playground/run',
  async (request: RunPlaygroundRequest, { rejectWithValue }) => {
    try {
      const response = await playgroundApi.run(request);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '执行失败');
    }
  }
);

export const runPlaygroundStream = createAsyncThunk(
  'playground/runStream',
  async (
    { request, onEvent }: { request: RunPlaygroundRequest; onEvent: (event: PlaygroundStreamEvent) => void },
    { rejectWithValue }
  ) => {
    try {
      await playgroundApi.runStreamSSE(request, onEvent);
      return undefined;
    } catch (error: any) {
      return rejectWithValue(error.message || '流式执行失败');
    }
  }
);

const playgroundSlice = createSlice({
  name: 'playground',
  initialState,
  reducers: {
    setInput: (state, action: PayloadAction<string>) => {
      state.input = action.payload;
    },
    appendOutput: (state, action: PayloadAction<string>) => {
      state.output += action.payload;
    },
    setOutput: (state, action: PayloadAction<string>) => {
      state.output = action.payload;
    },
    setStreaming: (state, action: PayloadAction<boolean>) => {
      state.isStreaming = action.payload;
    },
    setUsage: (
      state,
      action: PayloadAction<{ inputTokens: number; outputTokens: number } | null>
    ) => {
      state.usage = action.payload;
    },
    setDuration: (state, action: PayloadAction<number | null>) => {
      state.duration = action.payload;
    },
    clearOutput: (state) => {
      state.output = '';
      state.usage = null;
      state.duration = null;
      state.error = null;
    },
    addToHistory: (
      state,
      action: PayloadAction<{ input: string; output: string }>
    ) => {
      state.history.unshift({
        id: Date.now().toString(),
        input: action.payload.input,
        output: action.payload.output,
        timestamp: Date.now(),
      });
      // 只保留最近 20 条
      if (state.history.length > 20) {
        state.history = state.history.slice(0, 20);
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    clearHistory: (state) => {
      state.history = [];
    },
  },
  extraReducers: (builder) => {
    // Run Playground
    builder.addCase(runPlayground.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.output = '';
    });
    builder.addCase(runPlayground.fulfilled, (state, action) => {
      state.loading = false;
      state.output = action.payload.output;
      state.usage = action.payload.usage;
      state.duration = action.payload.duration;
    });
    builder.addCase(runPlayground.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Run Playground Stream
    builder.addCase(runPlaygroundStream.pending, (state) => {
      state.isStreaming = true;
      state.error = null;
      state.output = '';
      state.usage = null;
      state.duration = null;
    });
    builder.addCase(runPlaygroundStream.fulfilled, (state) => {
      state.isStreaming = false;
    });
    builder.addCase(runPlaygroundStream.rejected, (state, action) => {
      state.isStreaming = false;
      state.error = action.payload as string;
    });
  },
});

export const {
  setInput,
  appendOutput,
  setOutput,
  setStreaming,
  setUsage,
  setDuration,
  clearOutput,
  addToHistory,
  clearError,
  clearHistory,
} = playgroundSlice.actions;

export default playgroundSlice.reducer;
