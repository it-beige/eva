import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { AutoEvalStatus, MetricType, } from '@eva/shared';
import autoEvalApi from '../services/autoEvalApi';
const initialState = {
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
export const fetchAutoEvals = createAsyncThunk('autoEval/fetchList', async (params = {}, { getState }) => {
    const state = getState();
    const { keyword, selectedStatus, page, pageSize } = state.autoEval;
    const queryParams = {
        page,
        pageSize,
        ...(keyword && { keyword }),
        ...(selectedStatus && { status: selectedStatus }),
        ...params,
    };
    const response = await autoEvalApi.getList(queryParams);
    return response;
});
// 获取单个自动化评测详情
export const fetchAutoEvalById = createAsyncThunk('autoEval/fetchById', async (id) => {
    const response = await autoEvalApi.getById(id);
    return response;
});
// 创建自动化评测
export const createAutoEval = createAsyncThunk('autoEval/create', async (data, { dispatch }) => {
    const response = await autoEvalApi.create(data);
    // 创建成功后刷新列表
    dispatch(fetchAutoEvals());
    return response;
});
// 更新自动化评测
export const updateAutoEval = createAsyncThunk('autoEval/update', async ({ id, data }, { dispatch }) => {
    const response = await autoEvalApi.update(id, data);
    // 更新成功后刷新列表
    dispatch(fetchAutoEvals());
    return response;
});
// 删除自动化评测
export const deleteAutoEval = createAsyncThunk('autoEval/delete', async (id, { dispatch }) => {
    await autoEvalApi.delete(id);
    // 删除成功后刷新列表
    dispatch(fetchAutoEvals());
    return id;
});
// 批量删除自动化评测
export const deleteAutoEvals = createAsyncThunk('autoEval/deleteMany', async (ids, { dispatch }) => {
    await autoEvalApi.deleteMany(ids);
    // 删除成功后刷新列表
    dispatch(fetchAutoEvals());
    return ids;
});
// 调试过滤采样规则
export const debugFilter = createAsyncThunk('autoEval/debugFilter', async (data) => {
    const response = await autoEvalApi.debugFilter(data);
    return response;
});
// 调试评测规则
export const debugEval = createAsyncThunk('autoEval/debugEval', async (data) => {
    const response = await autoEvalApi.debugEval(data);
    return response;
});
// ==================== Slice ====================
const autoEvalSlice = createSlice({
    name: 'autoEval',
    initialState,
    reducers: {
        // 设置搜索关键字
        setKeyword: (state, action) => {
            state.keyword = action.payload;
            state.page = 1;
        },
        // 设置筛选状态
        setSelectedStatus: (state, action) => {
            state.selectedStatus = action.payload;
            state.page = 1;
        },
        // 设置分页
        setPage: (state, action) => {
            state.page = action.payload;
        },
        setPageSize: (state, action) => {
            state.pageSize = action.payload;
            state.page = 1;
        },
        // 设置选中的行
        setSelectedRowKeys: (state, action) => {
            state.selectedRowKeys = action.payload;
        },
        // 设置当前编辑的规则
        setCurrentAutoEval: (state, action) => {
            state.currentAutoEval = action.payload;
        },
        // 更新创建表单
        setCreateFormName: (state, action) => {
            state.createForm.name = action.payload;
        },
        setCreateFormStatus: (state, action) => {
            state.createForm.status = action.payload;
        },
        setCreateFormFilterRules: (state, action) => {
            state.createForm.filterRules = action.payload;
        },
        setCreateFormSampleRate: (state, action) => {
            state.createForm.sampleRate = action.payload;
        },
        setCreateFormMetricIds: (state, action) => {
            state.createForm.metricIds = action.payload;
        },
        setCreateFormMetricType: (state, action) => {
            state.createForm.selectedMetricType = action.payload;
        },
        // 添加过滤条件
        addFilterCondition: (state, action) => {
            state.createForm.filterRules.conditions.push(action.payload);
        },
        // 移除过滤条件
        removeFilterCondition: (state, action) => {
            state.createForm.filterRules.conditions.splice(action.payload, 1);
        },
        // 更新过滤条件
        updateFilterCondition: (state, action) => {
            const { index, field, operator, value } = action.payload;
            if (field !== undefined)
                state.createForm.filterRules.conditions[index].field = field;
            if (operator !== undefined)
                state.createForm.filterRules.conditions[index].operator = operator;
            if (value !== undefined)
                state.createForm.filterRules.conditions[index].value = value;
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
            .addCase(fetchAutoEvals.fulfilled, (state, action) => {
            state.loading = false;
            state.items = action.payload.items || [];
            state.total = action.payload.total;
            state.page = action.payload.page;
            state.pageSize = action.payload.pageSize;
            state.totalPages =
                action.payload.totalPages ||
                    Math.ceil(action.payload.total / action.payload.pageSize);
        })
            .addCase(fetchAutoEvals.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message || '获取列表失败';
        });
        // fetchAutoEvalById
        builder
            .addCase(fetchAutoEvalById.pending, (state) => {
            state.loading = true;
        })
            .addCase(fetchAutoEvalById.fulfilled, (state, action) => {
            state.loading = false;
            state.currentAutoEval = action.payload;
        })
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
            state.selectedRowKeys = state.selectedRowKeys.filter((id) => id !== action.payload);
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
            state.selectedRowKeys = state.selectedRowKeys.filter((id) => !action.payload.includes(id));
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
            .addCase(debugFilter.fulfilled, (state, action) => {
            state.debugLoading = false;
            state.debugFilterResults = action.payload;
        })
            .addCase(debugFilter.rejected, (state, action) => {
            state.debugLoading = false;
            state.error = action.error.message || '调试过滤规则失败';
        });
        // debugEval
        builder
            .addCase(debugEval.pending, (state) => {
            state.debugLoading = true;
        })
            .addCase(debugEval.fulfilled, (state, action) => {
            state.debugLoading = false;
            state.debugEvalResults = action.payload;
        })
            .addCase(debugEval.rejected, (state, action) => {
            state.debugLoading = false;
            state.error = action.error.message || '调试评测规则失败';
        });
    },
});
export const { setKeyword, setSelectedStatus, setPage, setPageSize, setSelectedRowKeys, setCurrentAutoEval, setCreateFormName, setCreateFormStatus, setCreateFormFilterRules, setCreateFormSampleRate, setCreateFormMetricIds, setCreateFormMetricType, addFilterCondition, removeFilterCondition, updateFilterCondition, clearDebugResults, resetCreateForm, clearError, resetState, } = autoEvalSlice.actions;
export default autoEvalSlice.reducer;
