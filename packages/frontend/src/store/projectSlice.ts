import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import projectApi, {
  type ProjectListParams,
  type ProjectItem,
} from '../services/projectApi';

interface ProjectState {
  list: ProjectItem[];
  total: number;
  page: number;
  pageSize: number;
  loading: boolean;
  error: string | null;
  currentProject: ProjectItem | null;
  currentProjectLoading: boolean;
}

const initialState: ProjectState = {
  list: [],
  total: 0,
  page: 1,
  pageSize: 20,
  loading: false,
  error: null,
  currentProject: null,
  currentProjectLoading: false,
};

export const fetchProjects = createAsyncThunk(
  'project/fetchProjects',
  async (params: ProjectListParams) => {
    return projectApi.getProjects(params);
  },
);

export const fetchProjectDetail = createAsyncThunk(
  'project/fetchProjectDetail',
  async (id: string) => {
    return projectApi.getProject(id);
  },
);

export const deleteProject = createAsyncThunk(
  'project/deleteProject',
  async (id: string) => {
    await projectApi.deleteProject(id);
    return id;
  },
);

const projectSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {
    clearCurrentProject(state) {
      state.currentProject = null;
    },
    setPage(state, action: PayloadAction<number>) {
      state.page = action.payload;
    },
    setPageSize(state, action: PayloadAction<number>) {
      state.pageSize = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.list;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.pageSize = action.payload.pageSize;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '加载失败';
      })
      .addCase(fetchProjectDetail.pending, (state) => {
        state.currentProjectLoading = true;
      })
      .addCase(fetchProjectDetail.fulfilled, (state, action) => {
        state.currentProjectLoading = false;
        state.currentProject = action.payload;
      })
      .addCase(fetchProjectDetail.rejected, (state) => {
        state.currentProjectLoading = false;
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.list = state.list.filter((p) => p.projectId !== action.payload);
        state.total -= 1;
      });
  },
});

export const { clearCurrentProject, setPage, setPageSize } = projectSlice.actions;
export default projectSlice.reducer;
