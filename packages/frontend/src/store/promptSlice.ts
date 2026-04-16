import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { promptApi, Prompt, PromptVersion, CreatePromptRequest, UpdatePromptRequest, QueryPromptParams } from '../services/promptApi';

interface PromptState {
  prompts: Prompt[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  currentPrompt: Prompt | null;
  versions: PromptVersion[];
  loading: boolean;
  error: string | null;
}

const initialState: PromptState = {
  prompts: [],
  total: 0,
  page: 1,
  pageSize: 10,
  totalPages: 0,
  currentPrompt: null,
  versions: [],
  loading: false,
  error: null,
};

// 异步 Thunks
export const fetchPrompts = createAsyncThunk(
  'prompt/fetchPrompts',
  async (params: QueryPromptParams = {}, { rejectWithValue }) => {
    try {
      const response = await promptApi.getPrompts(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '获取 Prompt 列表失败');
    }
  }
);

export const fetchPrompt = createAsyncThunk(
  'prompt/fetchPrompt',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await promptApi.getPrompt(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '获取 Prompt 详情失败');
    }
  }
);

export const createPrompt = createAsyncThunk(
  'prompt/createPrompt',
  async (data: CreatePromptRequest, { rejectWithValue }) => {
    try {
      const response = await promptApi.createPrompt(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '创建 Prompt 失败');
    }
  }
);

export const updatePrompt = createAsyncThunk(
  'prompt/updatePrompt',
  async ({ id, data }: { id: string; data: UpdatePromptRequest }, { rejectWithValue }) => {
    try {
      const response = await promptApi.updatePrompt(id, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '更新 Prompt 失败');
    }
  }
);

export const deletePrompt = createAsyncThunk(
  'prompt/deletePrompt',
  async (id: string, { rejectWithValue }) => {
    try {
      await promptApi.deletePrompt(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '删除 Prompt 失败');
    }
  }
);

export const fetchVersions = createAsyncThunk(
  'prompt/fetchVersions',
  async (promptId: string, { rejectWithValue }) => {
    try {
      const response = await promptApi.getVersions(promptId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '获取版本列表失败');
    }
  }
);

const promptSlice = createSlice({
  name: 'prompt',
  initialState,
  reducers: {
    setCurrentPrompt: (state, action: PayloadAction<Prompt | null>) => {
      state.currentPrompt = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Prompts
    builder
      .addCase(fetchPrompts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPrompts.fulfilled, (state, action) => {
        state.loading = false;
        state.prompts = action.payload.items;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.pageSize = action.payload.pageSize;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchPrompts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch Single Prompt
    builder
      .addCase(fetchPrompt.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPrompt.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPrompt = action.payload;
      })
      .addCase(fetchPrompt.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create Prompt
    builder
      .addCase(createPrompt.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPrompt.fulfilled, (state, action) => {
        state.loading = false;
        state.prompts.unshift(action.payload);
        state.total += 1;
      })
      .addCase(createPrompt.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update Prompt
    builder
      .addCase(updatePrompt.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePrompt.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.prompts.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.prompts[index] = action.payload;
        }
        if (state.currentPrompt?.id === action.payload.id) {
          state.currentPrompt = action.payload;
        }
      })
      .addCase(updatePrompt.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete Prompt
    builder
      .addCase(deletePrompt.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePrompt.fulfilled, (state, action) => {
        state.loading = false;
        state.prompts = state.prompts.filter((p) => p.id !== action.payload);
        state.total -= 1;
        if (state.currentPrompt?.id === action.payload) {
          state.currentPrompt = null;
        }
      })
      .addCase(deletePrompt.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch Versions
    builder
      .addCase(fetchVersions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVersions.fulfilled, (state, action) => {
        state.loading = false;
        state.versions = action.payload;
      })
      .addCase(fetchVersions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setCurrentPrompt, clearError } = promptSlice.actions;
export default promptSlice.reducer;
