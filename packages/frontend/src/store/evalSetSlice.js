import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { evalSetApi, evalSetItemApi, } from '../services/evalSetApi';
const initialState = {
    evalSets: [],
    total: 0,
    page: 1,
    pageSize: 20,
    loading: false,
    error: null,
    currentEvalSet: null,
    detailLoading: false,
    items: [],
    itemsTotal: 0,
    itemsPage: 1,
    itemsPageSize: 20,
    itemsLoading: false,
    creating: false,
    updating: false,
    deleting: false,
    filterType: undefined,
    keyword: '',
};
// Async Thunks
export const fetchEvalSets = createAsyncThunk('evalSet/fetchEvalSets', async (params = {}, { rejectWithValue }) => {
    try {
        const response = await evalSetApi.getEvalSets(params);
        return response;
    }
    catch (error) {
        return rejectWithValue(error instanceof Error ? error.message : '获取评测集列表失败');
    }
});
export const fetchEvalSet = createAsyncThunk('evalSet/fetchEvalSet', async (id, { rejectWithValue }) => {
    try {
        const response = await evalSetApi.getEvalSet(id);
        return response;
    }
    catch (error) {
        return rejectWithValue(error instanceof Error ? error.message : '获取评测集详情失败');
    }
});
export const createEvalSet = createAsyncThunk('evalSet/createEvalSet', async (data, { rejectWithValue }) => {
    try {
        const response = await evalSetApi.createEvalSet(data);
        return response;
    }
    catch (error) {
        return rejectWithValue(error instanceof Error ? error.message : '创建评测集失败');
    }
});
export const updateEvalSet = createAsyncThunk('evalSet/updateEvalSet', async ({ id, data }, { rejectWithValue }) => {
    try {
        const response = await evalSetApi.updateEvalSet(id, data);
        return response;
    }
    catch (error) {
        return rejectWithValue(error instanceof Error ? error.message : '更新评测集失败');
    }
});
export const deleteEvalSet = createAsyncThunk('evalSet/deleteEvalSet', async (id, { rejectWithValue }) => {
    try {
        await evalSetApi.deleteEvalSet(id);
        return id;
    }
    catch (error) {
        return rejectWithValue(error instanceof Error ? error.message : '删除评测集失败');
    }
});
export const fetchEvalSetItems = createAsyncThunk('evalSet/fetchEvalSetItems', async ({ evalSetId, params, }, { rejectWithValue }) => {
    try {
        const response = await evalSetItemApi.getItems(evalSetId, params);
        return response;
    }
    catch (error) {
        return rejectWithValue(error instanceof Error ? error.message : '获取数据项失败');
    }
});
export const createEvalSetItem = createAsyncThunk('evalSet/createEvalSetItem', async ({ evalSetId, data }, { rejectWithValue }) => {
    try {
        const response = await evalSetItemApi.createItem(evalSetId, data);
        return response;
    }
    catch (error) {
        return rejectWithValue(error instanceof Error ? error.message : '创建数据项失败');
    }
});
export const updateEvalSetItem = createAsyncThunk('evalSet/updateEvalSetItem', async ({ evalSetId, itemId, data, }, { rejectWithValue }) => {
    try {
        const response = await evalSetItemApi.updateItem(evalSetId, itemId, data);
        return response;
    }
    catch (error) {
        return rejectWithValue(error instanceof Error ? error.message : '更新数据项失败');
    }
});
export const deleteEvalSetItem = createAsyncThunk('evalSet/deleteEvalSetItem', async ({ evalSetId, itemId }, { rejectWithValue }) => {
    try {
        await evalSetItemApi.deleteItem(evalSetId, itemId);
        return itemId;
    }
    catch (error) {
        return rejectWithValue(error instanceof Error ? error.message : '删除数据项失败');
    }
});
// Slice
const evalSetSlice = createSlice({
    name: 'evalSet',
    initialState,
    reducers: {
        setFilterType: (state, action) => {
            state.filterType = action.payload;
        },
        setKeyword: (state, action) => {
            state.keyword = action.payload;
        },
        clearCurrentEvalSet: (state) => {
            state.currentEvalSet = null;
        },
        clearError: (state) => {
            state.error = null;
        },
        setPage: (state, action) => {
            state.page = action.payload;
        },
        setPageSize: (state, action) => {
            state.pageSize = action.payload;
        },
        setItemsPage: (state, action) => {
            state.itemsPage = action.payload;
        },
        setItemsPageSize: (state, action) => {
            state.itemsPageSize = action.payload;
        },
    },
    extraReducers: (builder) => {
        // Fetch EvalSets
        builder
            .addCase(fetchEvalSets.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
            .addCase(fetchEvalSets.fulfilled, (state, action) => {
            state.loading = false;
            state.evalSets = action.payload.items;
            state.total = action.payload.total;
            state.page = action.payload.page;
            state.pageSize = action.payload.pageSize;
        })
            .addCase(fetchEvalSets.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });
        // Fetch EvalSet Detail
        builder
            .addCase(fetchEvalSet.pending, (state) => {
            state.detailLoading = true;
        })
            .addCase(fetchEvalSet.fulfilled, (state, action) => {
            state.detailLoading = false;
            state.currentEvalSet = action.payload;
        })
            .addCase(fetchEvalSet.rejected, (state, action) => {
            state.detailLoading = false;
            state.error = action.payload;
        });
        // Create EvalSet
        builder
            .addCase(createEvalSet.pending, (state) => {
            state.creating = true;
        })
            .addCase(createEvalSet.fulfilled, (state, action) => {
            state.creating = false;
            state.evalSets.unshift(action.payload);
            state.total += 1;
        })
            .addCase(createEvalSet.rejected, (state, action) => {
            state.creating = false;
            state.error = action.payload;
        });
        // Update EvalSet
        builder
            .addCase(updateEvalSet.pending, (state) => {
            state.updating = true;
        })
            .addCase(updateEvalSet.fulfilled, (state, action) => {
            state.updating = false;
            const index = state.evalSets.findIndex((item) => item.id === action.payload.id);
            if (index !== -1) {
                state.evalSets[index] = action.payload;
            }
            if (state.currentEvalSet?.id === action.payload.id) {
                state.currentEvalSet = action.payload;
            }
        })
            .addCase(updateEvalSet.rejected, (state, action) => {
            state.updating = false;
            state.error = action.payload;
        });
        // Delete EvalSet
        builder
            .addCase(deleteEvalSet.pending, (state) => {
            state.deleting = true;
        })
            .addCase(deleteEvalSet.fulfilled, (state, action) => {
            state.deleting = false;
            state.evalSets = state.evalSets.filter((item) => item.id !== action.payload);
            state.total -= 1;
            if (state.currentEvalSet?.id === action.payload) {
                state.currentEvalSet = null;
            }
        })
            .addCase(deleteEvalSet.rejected, (state, action) => {
            state.deleting = false;
            state.error = action.payload;
        });
        // Fetch EvalSet Items
        builder
            .addCase(fetchEvalSetItems.pending, (state) => {
            state.itemsLoading = true;
        })
            .addCase(fetchEvalSetItems.fulfilled, (state, action) => {
            state.itemsLoading = false;
            state.items = action.payload.items;
            state.itemsTotal = action.payload.total;
            state.itemsPage = action.payload.page;
            state.itemsPageSize = action.payload.pageSize;
        })
            .addCase(fetchEvalSetItems.rejected, (state, action) => {
            state.itemsLoading = false;
            state.error = action.payload;
        });
        // Create EvalSet Item
        builder.addCase(createEvalSetItem.fulfilled, (state, action) => {
            state.items.unshift(action.payload);
            state.itemsTotal += 1;
            if (state.currentEvalSet) {
                state.currentEvalSet.dataCount += 1;
            }
        });
        // Update EvalSet Item
        builder.addCase(updateEvalSetItem.fulfilled, (state, action) => {
            const index = state.items.findIndex((item) => item.id === action.payload.id);
            if (index !== -1) {
                state.items[index] = action.payload;
            }
        });
        // Delete EvalSet Item
        builder.addCase(deleteEvalSetItem.fulfilled, (state, action) => {
            state.items = state.items.filter((item) => item.id !== action.payload);
            state.itemsTotal -= 1;
            if (state.currentEvalSet) {
                state.currentEvalSet.dataCount -= 1;
            }
        });
    },
});
export const { setFilterType, setKeyword, clearCurrentEvalSet, clearError, setPage, setPageSize, setItemsPage, setItemsPageSize, } = evalSetSlice.actions;
export default evalSetSlice.reducer;
