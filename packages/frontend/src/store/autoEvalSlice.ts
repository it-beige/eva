import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  AutoEval,
  AutoEvalStatus,
  PaginatedResponse,
  MetricType,
} from '@eva/shared';
import autoEvalApi, {
  QueryAutoEvalParams,
  CreateAutoEvalData,
  UpdateAutoEvalData,
  DebugFilterData,
  DebugEvalData,
  DebugFilterResult,
  DebugEvalResult,
  FilterRules,
} from '../services/autoEvalApi';

// ==================== State Interface ====================

interface AutoEvalState {
  // 列表数据
  items: AutoEval[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;

  // 当前选中的规则
  currentAutoEval: AutoEval | null;

  // 查询条件
  keyword: string;
  selectedStatus: AutoEvalStatus | null;

  // 选中的行ID（用于批量操作）
  selectedRowKeys: string[];

  // 加载状态
  loading: boolean;
  creating: boolean;
  updating: boolean;
  deleting: boolean;

  // 调试结果
  debugFilterResults: DebugFilterResult[];
  debugEvalResults: DebugEvalResult[];
  debugLoading: boolean;

  // 创建表单状态
  createForm: {
    name: string;
    status: AutoEvalStatus;
    filterRules: FilterRules;
    sampleRate: number;
    metricIds: string[];
    selectedMetricType: MetricType;
  };

  // 错误信息
  error: string | null;
}

const initialState: AutoEvalState = {
  items: [],
  total: 0,
  page: 1,
  pageSize: 10,
  totalPages: 0,

  currentAutoEval: null,

  keyword: '',
  selectedStatus: null,

  selectedRowKeys: [],

  loading: false,
  creating: false,
  updating: false,
  deleting: false,

  debugFilterResults: [],
  debugEvalResults: [],
  debugLoading: false,

  createForm: {
    name: '',
    status: AutoEvalStatus.ENABLED,
    filterRules: { conditions: [] },
    sampleRate: 10,
    metricIds: [],
    selectedMetricType: MetricType.LLM,
  },

  error: null,
};

// ==================== Async Thunks ====================

// 获取自动化评测列表
export const fetchAutoEvals = createAsyncThunk(
  'autoEval/fetchList',
  async (params: QueryAutoEvalParams = {}, { getState }) => {
    const state = getState() as { autoEval: AutoEvalState };
    const { keyword, selectedStatus, page, pageSize } = state.autoEval;

    const queryParams: QueryAutoEvalParams = {
      page,
      pageSize,
      ...(keyword && { keyword }),
      ...(selectedStatus && { status: selectedStatus }),
      ...params,
    };

    const response = await autoEvalApi.getList(queryParams);
    return response;
  },
);

// 获取单个自动化评测详情
export const fetchAutoEvalById = createAsyncThunk(
  'autoEval/fetchById',
  async (id: string) => {
    const response = await autoEvalApi.getById(id);
    return response;
  },
);

// 创建自动化评测
export const createAutoEval = createAsyncThunk(
  'autoEval/create',
  async (data: CreateAutoEvalData, { dispatch }) => {
    const response = await autoEvalApi.create(data);
    // 创建成功后刷新列表
    dispatch(fetchAutoEvals({}));
    return response;
  },
);

// 更新自动化评测
export const updateAutoEval = createAsyncThunk(
  'autoEval/update',
  async (
    { id, data }: { id: string; data: UpdateAutoEvalData },
    { dispatch },
  ) => {
    const response = await autoEvalApi.update(id, data);
    // 更新成功后刷新列表
    dispatch(fetchAutoEvals({}));
    return response;
  },
);

// 删除自动化评测
export const deleteAutoEval = createAsyncThunk(
  'autoEval/delete',
  async (id: string, { dispatch }) => {
    await autoEvalApi.delete(id);
    // 删除成功后刷新列表
    dispatch(fetchAutoEvals({}));
    return id;
  },
);

// 批量删除自动化评测
export const deleteAutoEvals = createAsyncThunk(
  'autoEval/deleteMany',
  async (ids: string[], { dispatch }) => {
    await autoEvalApi.deleteMany(ids);
    // 删除成功后刷新列表
    dispatch(fetchAutoEvals({}));
    return ids;
  },
);

// 调试过滤采样规则
export const debugFilter = createAsyncThunk(
  'autoEval/debugFilter',
  async (data: DebugFilterData) => {
    const response = await autoEvalApi.debugFilter(data);
    return response;
  },
);

// 调试评测规则
export const debugEval = createAsyncThunk(
  'autoEval/debugEval',
  async (data: DebugEvalData) => {
    const response = await autoEvalApi.debugEval(data);
    return response;
  },
);

// ==================== Slice ====================

const autoEvalSlice = createSlice({
  name: 'autoEval',
  initialState,
  reducers: {
    // 设置搜索关键字
    setKeyword: (state, action: PayloadAction<string>) => {
      state.keyword = action.payload;
      state.page = 1;
    },

    // 设置筛选状态
    setSelectedStatus: (state, action: PayloadAction<AutoEvalStatus | null>) => {
      state.selectedStatus = action.payload;
      state.page = 1;
    },

    // 设置分页
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },

    setPageSize: (state, action: PayloadAction<number>) => {
      state.pageSize = action.payload;
      state.page = 1;
    },

    // 设置选中的行
    setSelectedRowKeys: (state, action: PayloadAction<string[]>) => {
      state.selectedRowKeys = action.payload;
    },

    // 设置当前编辑的规则
    setCurrentAutoEval: (state, action: PayloadAction<AutoEval | null>) => {
      state.currentAutoEval = action.payload;
    },

    // 更新创建表单
    setCreateFormName: (state, action: PayloadAction<string>) => {
      state.createForm.name = action.payload;
    },

    setCreateFormStatus: (state, action: PayloadAction<AutoEvalStatus>) => {
      state.createForm.status = action.payload;
    },

    setCreateFormFilterRules: (state, action: PayloadAction<FilterRules>) => {
      state.createForm.filterRules = action.payload;
    },

    setCreateFormSampleRate: (state, action: PayloadAction<number>) => {
      state.createForm.sampleRate = action.payload;
    },

    setCreateFormMetricIds: (state, action: PayloadAction<string[]>) => {
      state.createForm.metricIds = action.payload;
    },

    setCreateFormMetricType: (state, action: PayloadAction<MetricType>) => {
      state.createForm.selectedMetricType = action.payload;
    },

    // 添加过滤条件
    addFilterCondition: (state, action: PayloadAction<{ field: string; operator: string; value: string }>) => {
      state.createForm.filterRules.conditions.push(action.payload);
    },

    // 移除过滤条件
    removeFilterCondition: (state, action: PayloadAction<number>) => {
      state.createForm.filterRules.conditions.splice(action.payload, 1);
    },

    // 更新过滤条件
    updateFilterCondition: (
      state,
      action: PayloadAction<{ index: number; field?: string; operator?: string; value?: string }>,
    ) => {
      const { index, field, operator, value } = action.payload;
      if (field !== undefined) state.createForm.filterRules.conditions[index].field = field;
      if (operator !== undefined) state.createForm.filterRules.conditions[index].operator = operator;
      if (value !== undefined) state.createForm.filterRules.conditions[index].value = value;
    },

    // 清空调试结果
    clearDebugResults: (state) => {
      state.debugFilterResults = [];
      state.debugEvalResults = [];
    },

    // 重置创建表单
    resetCreateForm: (state) => {
      state.createForm = {
        name: '',
        status: AutoEvalStatus.ENABLED,
        filterRules: { conditions: [] },
        sampleRate: 10,
        metricIds: [],
        selectedMetricType: MetricType.LLM,
      };
    },

    // 清空错误
    clearError: (state) => {
      state.error = null;
    },

    // 重置状态
    resetState: () => initialState,
  },
  extraReducers: (builder) => {
    // fetchAutoEvals
    builder
      .addCase(fetchAutoEvals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchAutoEvals.fulfilled,
        (state, action: PayloadAction<PaginatedResponse<AutoEval>>) => {
          state.loading = false;
          state.items = action.payload.items || [];
          state.total = action.payload.total;
          state.page = action.payload.page;
          state.pageSize = action.payload.pageSize;
          state.totalPages =
            action.payload.totalPages ||
            Math.ceil(action.payload.total / action.payload.pageSize);
        },
      )
      .addCase(fetchAutoEvals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '获取列表失败';
      });

    // fetchAutoEvalById
    builder
      .addCase(fetchAutoEvalById.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        fetchAutoEvalById.fulfilled,
        (state, action: PayloadAction<AutoEval>) => {
          state.loading = false;
          state.currentAutoEval = action.payload;
        },
      )
      .addCase(fetchAutoEvalById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '获取详情失败';
      });

    // createAutoEval
    builder
      .addCase(createAutoEval.pending, (state) => {
        state.creating = true;
      })
      .addCase(createAutoEval.fulfilled, (state) => {
        state.creating = false;
        // 重置表单
        state.createForm = initialState.createForm;
      })
      .addCase(createAutoEval.rejected, (state, action) => {
        state.creating = false;
        state.error = action.error.message || '创建失败';
      });

    // updateAutoEval
    builder
      .addCase(updateAutoEval.pending, (state) => {
        state.updating = true;
      })
      .addCase(updateAutoEval.fulfilled, (state) => {
        state.updating = false;
        state.currentAutoEval = null;
      })
      .addCase(updateAutoEval.rejected, (state, action) => {
        state.updating = false;
        state.error = action.error.message || '更新失败';
      });

    // deleteAutoEval
    builder
      .addCase(deleteAutoEval.pending, (state) => {
        state.deleting = true;
      })
      .addCase(deleteAutoEval.fulfilled, (state, action) => {
        state.deleting = false;
        state.selectedRowKeys = state.selectedRowKeys.filter(
          (id) => id !== action.payload,
        );
      })
      .addCase(deleteAutoEval.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.error.message || '删除失败';
      });

    // deleteAutoEvals (批量删除)
    builder
      .addCase(deleteAutoEvals.pending, (state) => {
        state.deleting = true;
      })
      .addCase(deleteAutoEvals.fulfilled, (state, action) => {
        state.deleting = false;
        state.selectedRowKeys = state.selectedRowKeys.filter(
          (id) => !action.payload.includes(id),
        );
      })
      .addCase(deleteAutoEvals.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.error.message || '批量删除失败';
      });

    // debugFilter
    builder
      .addCase(debugFilter.pending, (state) => {
        state.debugLoading = true;
      })
      .addCase(
        debugFilter.fulfilled,
        (state, action: PayloadAction<DebugFilterResult[]>) => {
          state.debugLoading = false;
          state.debugFilterResults = action.payload;
        },
      )
      .addCase(debugFilter.rejected, (state, action) => {
        state.debugLoading = false;
        state.error = action.error.message || '调试过滤规则失败';
      });

    // debugEval
    builder
      .addCase(debugEval.pending, (state) => {
        state.debugLoading = true;
      })
      .addCase(
        debugEval.fulfilled,
        (state, action: PayloadAction<DebugEvalResult[]>) => {
          state.debugLoading = false;
          state.debugEvalResults = action.payload;
        },
      )
      .addCase(debugEval.rejected, (state, action) => {
        state.debugLoading = false;
        state.error = action.error.message || '调试评测规则失败';
      });
  },
});

export const {
  setKeyword,
  setSelectedStatus,
  setPage,
  setPageSize,
  setSelectedRowKeys,
  setCurrentAutoEval,
  setCreateFormName,
  setCreateFormStatus,
  setCreateFormFilterRules,
  setCreateFormSampleRate,
  setCreateFormMetricIds,
  setCreateFormMetricType,
  addFilterCondition,
  removeFilterCondition,
  updateFilterCondition,
  clearDebugResults,
  resetCreateForm,
  clearError,
  resetState,
} = autoEvalSlice.actions;

export default autoEvalSlice.reducer;
