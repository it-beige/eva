import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { MetricScope, } from '@eva/shared';
import evalMetricApi from '../services/evalMetricApi';
const initialState = {
    items: [],
    total: 0,
    page: 1,
    pageSize: 10,
    totalPages: 0,
    currentMetric: null,
    currentScope: MetricScope.PERSONAL,
    keyword: '',
    selectedType: null,
    selectedRowKeys: [],
    loading: false,
    creating: false,
    updating: false,
    deleting: false,
    createModalVisible: false,
    editingMetric: null,
    error: null,
};
// ==================== Async Thunks ====================
// 获取评估指标列表
export const fetchEvalMetrics = createAsyncThunk('evalMetric/fetchList', async (params = {}, { getState }) => {
    const state = getState();
    const { currentScope, keyword, selectedType, page, pageSize } = state.evalMetric;
    const queryParams = {
        page,
        pageSize,
        scope: currentScope,
        ...(keyword && { keyword }),
        ...(selectedType && { type: selectedType }),
        ...params,
    };
    const response = await evalMetricApi.getList(queryParams);
    return response;
});
// 获取单个评估指标详情
export const fetchEvalMetricById = createAsyncThunk('evalMetric/fetchById', async (id) => {
    const response = await evalMetricApi.getById(id);
    return response;
});
// 创建评估指标
export const createEvalMetric = createAsyncThunk('evalMetric/create', async (data, { dispatch }) => {
    const response = await evalMetricApi.create(data);
    // 创建成功后刷新列表
    dispatch(fetchEvalMetrics());
    return response;
});
// 更新评估指标
export const updateEvalMetric = createAsyncThunk('evalMetric/update', async ({ id, data }, { dispatch }) => {
    const response = await evalMetricApi.update(id, data);
    // 更新成功后刷新列表
    dispatch(fetchEvalMetrics());
    return response;
});
// 删除评估指标
export const deleteEvalMetric = createAsyncThunk('evalMetric/delete', async (id, { dispatch }) => {
    await evalMetricApi.delete(id);
    // 删除成功后刷新列表
    dispatch(fetchEvalMetrics());
    return id;
});
// 批量删除评估指标
export const deleteEvalMetrics = createAsyncThunk('evalMetric/deleteMany', async (ids, { dispatch }) => {
    await evalMetricApi.deleteMany(ids);
    // 删除成功后刷新列表
    dispatch(fetchEvalMetrics());
    return ids;
});
// 解析仓库指标
export const parseRepoMetrics = createAsyncThunk('evalMetric/parseRepo', async (data) => {
    const response = await evalMetricApi.parseRepo(data);
    return response;
});
// ==================== Slice ====================
const evalMetricSlice = createSlice({
    name: 'evalMetric',
    initialState,
    reducers: {
        // 设置当前 scope（个人/公共）
        setCurrentScope: (state, action) => {
            state.currentScope = action.payload;
            state.page = 1; // 切换 scope 时重置到第一页
            state.selectedRowKeys = []; // 清空选中
        },
        // 设置搜索关键字
        setKeyword: (state, action) => {
            state.keyword = action.payload;
            state.page = 1;
        },
        // 设置筛选类型
        setSelectedType: (state, action) => {
            state.selectedType = action.payload;
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
        // 设置当前编辑的指标
        setEditingMetric: (state, action) => {
            state.editingMetric = action.payload;
        },
        // 控制弹窗显示
        showCreateModal: (state) => {
            state.createModalVisible = true;
            state.editingMetric = null;
        },
        showEditModal: (state, action) => {
            state.createModalVisible = true;
            state.editingMetric = action.payload;
        },
        hideCreateModal: (state) => {
            state.createModalVisible = false;
            state.editingMetric = null;
        },
        // 清空错误
        clearError: (state) => {
            state.error = null;
        },
        // 重置状态
        resetState: () => initialState,
    },
    extraReducers: (builder) => {
        // fetchEvalMetrics
        builder
            .addCase(fetchEvalMetrics.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
            .addCase(fetchEvalMetrics.fulfilled, (state, action) => {
            state.loading = false;
            state.items = action.payload.items || action.payload.list || [];
            state.total = action.payload.total;
            state.page = action.payload.page;
            state.pageSize = action.payload.pageSize;
            state.totalPages =
                action.payload.totalPages ||
                    Math.ceil(action.payload.total / action.payload.pageSize);
        })
            .addCase(fetchEvalMetrics.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message || '获取列表失败';
        });
        // fetchEvalMetricById
        builder
            .addCase(fetchEvalMetricById.pending, (state) => {
            state.loading = true;
        })
            .addCase(fetchEvalMetricById.fulfilled, (state, action) => {
            state.loading = false;
            state.currentMetric = action.payload;
        })
            .addCase(fetchEvalMetricById.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message || '获取详情失败';
        });
        // createEvalMetric
        builder
            .addCase(createEvalMetric.pending, (state) => {
            state.creating = true;
        })
            .addCase(createEvalMetric.fulfilled, (state) => {
            state.creating = false;
            state.createModalVisible = false;
            state.editingMetric = null;
        })
            .addCase(createEvalMetric.rejected, (state, action) => {
            state.creating = false;
            state.error = action.error.message || '创建失败';
        });
        // updateEvalMetric
        builder
            .addCase(updateEvalMetric.pending, (state) => {
            state.updating = true;
        })
            .addCase(updateEvalMetric.fulfilled, (state) => {
            state.updating = false;
            state.createModalVisible = false;
            state.editingMetric = null;
        })
            .addCase(updateEvalMetric.rejected, (state, action) => {
            state.updating = false;
            state.error = action.error.message || '更新失败';
        });
        // deleteEvalMetric
        builder
            .addCase(deleteEvalMetric.pending, (state) => {
            state.deleting = true;
        })
            .addCase(deleteEvalMetric.fulfilled, (state, action) => {
            state.deleting = false;
            state.selectedRowKeys = state.selectedRowKeys.filter((id) => id !== action.payload);
        })
            .addCase(deleteEvalMetric.rejected, (state, action) => {
            state.deleting = false;
            state.error = action.error.message || '删除失败';
        });
        // deleteEvalMetrics (批量删除)
        builder
            .addCase(deleteEvalMetrics.pending, (state) => {
            state.deleting = true;
        })
            .addCase(deleteEvalMetrics.fulfilled, (state, action) => {
            state.deleting = false;
            state.selectedRowKeys = state.selectedRowKeys.filter((id) => !action.payload.includes(id));
        })
            .addCase(deleteEvalMetrics.rejected, (state, action) => {
            state.deleting = false;
            state.error = action.error.message || '批量删除失败';
        });
    },
});
export const { setCurrentScope, setKeyword, setSelectedType, setPage, setPageSize, setSelectedRowKeys, setEditingMetric, showCreateModal, showEditModal, hideCreateModal, clearError, resetState, } = evalMetricSlice.actions;
export default evalMetricSlice.reducer;
