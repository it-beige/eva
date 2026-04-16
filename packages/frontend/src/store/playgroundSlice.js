import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { playgroundApi, } from '../services/playgroundApi';
const initialState = {
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
export const runPlayground = createAsyncThunk('playground/run', async (request, { rejectWithValue }) => {
    try {
        const response = await playgroundApi.run(request);
        return response;
    }
    catch (error) {
        return rejectWithValue(error.response?.data?.message || '执行失败');
    }
});
export const runPlaygroundStream = createAsyncThunk('playground/runStream', async ({ request, onEvent }, { rejectWithValue }) => {
    try {
        await playgroundApi.runStreamSSE(request, onEvent);
    }
    catch (error) {
        return rejectWithValue(error.message || '流式执行失败');
    }
});
const playgroundSlice = createSlice({
    name: 'playground',
    initialState,
    reducers: {
        setInput: (state, action) => {
            state.input = action.payload;
        },
        appendOutput: (state, action) => {
            state.output += action.payload;
        },
        setOutput: (state, action) => {
            state.output = action.payload;
        },
        setStreaming: (state, action) => {
            state.isStreaming = action.payload;
        },
        setUsage: (state, action) => {
            state.usage = action.payload;
        },
        setDuration: (state, action) => {
            state.duration = action.payload;
        },
        clearOutput: (state) => {
            state.output = '';
            state.usage = null;
            state.duration = null;
            state.error = null;
        },
        addToHistory: (state, action) => {
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
            state.error = action.payload;
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
            state.error = action.payload;
        });
    },
});
export const { setInput, appendOutput, setOutput, setStreaming, setUsage, setDuration, clearOutput, addToHistory, clearError, clearHistory, } = playgroundSlice.actions;
export default playgroundSlice.reducer;
