import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { settingsApi, } from '../services/settingsApi';
const initialState = {
    project: null,
    projectLoading: false,
    projectSaving: false,
    members: [],
    membersLoading: false,
    memberActionLoading: false,
    tokens: [],
    tokensLoading: false,
    tokenActionLoading: false,
    newlyCreatedToken: null,
    error: null,
    successMessage: null,
};
// 异步 Thunks
// 项目设置
export const fetchProjectSettings = createAsyncThunk('settings/fetchProject', async (_, { rejectWithValue }) => {
    try {
        const response = await settingsApi.getProjectSettings();
        return response;
    }
    catch (error) {
        return rejectWithValue(error.response?.data?.message || '获取项目设置失败');
    }
});
export const updateProjectSettings = createAsyncThunk('settings/updateProject', async (data, { rejectWithValue }) => {
    try {
        const response = await settingsApi.updateProjectSettings(data);
        return response;
    }
    catch (error) {
        return rejectWithValue(error.response?.data?.message || '更新项目设置失败');
    }
});
// 成员管理
export const fetchMembers = createAsyncThunk('settings/fetchMembers', async (_, { rejectWithValue }) => {
    try {
        const response = await settingsApi.getMembers();
        return response;
    }
    catch (error) {
        return rejectWithValue(error.response?.data?.message || '获取成员列表失败');
    }
});
export const addMember = createAsyncThunk('settings/addMember', async (data, { rejectWithValue }) => {
    try {
        const response = await settingsApi.addMember(data);
        return response;
    }
    catch (error) {
        return rejectWithValue(error.response?.data?.message || '添加成员失败');
    }
});
export const updateMember = createAsyncThunk('settings/updateMember', async ({ id, data }, { rejectWithValue }) => {
    try {
        const response = await settingsApi.updateMember(id, data);
        return response;
    }
    catch (error) {
        return rejectWithValue(error.response?.data?.message || '更新成员失败');
    }
});
export const removeMember = createAsyncThunk('settings/removeMember', async (id, { rejectWithValue }) => {
    try {
        await settingsApi.removeMember(id);
        return id;
    }
    catch (error) {
        return rejectWithValue(error.response?.data?.message || '移除成员失败');
    }
});
// Token 管理
export const fetchTokens = createAsyncThunk('settings/fetchTokens', async (_, { rejectWithValue }) => {
    try {
        const response = await settingsApi.getTokens();
        return response;
    }
    catch (error) {
        return rejectWithValue(error.response?.data?.message || '获取 Token 列表失败');
    }
});
export const createToken = createAsyncThunk('settings/createToken', async (data, { rejectWithValue }) => {
    try {
        const response = await settingsApi.createToken(data);
        return response;
    }
    catch (error) {
        return rejectWithValue(error.response?.data?.message || '创建 Token 失败');
    }
});
export const deleteToken = createAsyncThunk('settings/deleteToken', async (id, { rejectWithValue }) => {
    try {
        await settingsApi.deleteToken(id);
        return id;
    }
    catch (error) {
        return rejectWithValue(error.response?.data?.message || '删除 Token 失败');
    }
});
const settingsSlice = createSlice({
    name: 'settings',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearSuccessMessage: (state) => {
            state.successMessage = null;
        },
        clearNewlyCreatedToken: (state) => {
            state.newlyCreatedToken = null;
        },
        setSuccessMessage: (state, action) => {
            state.successMessage = action.payload;
        },
    },
    extraReducers: (builder) => {
        // Fetch Project Settings
        builder.addCase(fetchProjectSettings.pending, (state) => {
            state.projectLoading = true;
            state.error = null;
        });
        builder.addCase(fetchProjectSettings.fulfilled, (state, action) => {
            state.projectLoading = false;
            state.project = action.payload;
        });
        builder.addCase(fetchProjectSettings.rejected, (state, action) => {
            state.projectLoading = false;
            state.error = action.payload;
        });
        // Update Project Settings
        builder.addCase(updateProjectSettings.pending, (state) => {
            state.projectSaving = true;
            state.error = null;
        });
        builder.addCase(updateProjectSettings.fulfilled, (state, action) => {
            state.projectSaving = false;
            state.project = action.payload;
            state.successMessage = '项目设置已保存';
        });
        builder.addCase(updateProjectSettings.rejected, (state, action) => {
            state.projectSaving = false;
            state.error = action.payload;
        });
        // Fetch Members
        builder.addCase(fetchMembers.pending, (state) => {
            state.membersLoading = true;
            state.error = null;
        });
        builder.addCase(fetchMembers.fulfilled, (state, action) => {
            state.membersLoading = false;
            state.members = action.payload;
        });
        builder.addCase(fetchMembers.rejected, (state, action) => {
            state.membersLoading = false;
            state.error = action.payload;
        });
        // Add Member
        builder.addCase(addMember.pending, (state) => {
            state.memberActionLoading = true;
            state.error = null;
        });
        builder.addCase(addMember.fulfilled, (state, action) => {
            state.memberActionLoading = false;
            state.members.push(action.payload);
            state.successMessage = '成员添加成功';
        });
        builder.addCase(addMember.rejected, (state, action) => {
            state.memberActionLoading = false;
            state.error = action.payload;
        });
        // Update Member
        builder.addCase(updateMember.pending, (state) => {
            state.memberActionLoading = true;
            state.error = null;
        });
        builder.addCase(updateMember.fulfilled, (state, action) => {
            state.memberActionLoading = false;
            const index = state.members.findIndex((m) => m.id === action.payload.id);
            if (index !== -1) {
                state.members[index] = action.payload;
            }
            state.successMessage = '成员角色已更新';
        });
        builder.addCase(updateMember.rejected, (state, action) => {
            state.memberActionLoading = false;
            state.error = action.payload;
        });
        // Remove Member
        builder.addCase(removeMember.pending, (state) => {
            state.memberActionLoading = true;
            state.error = null;
        });
        builder.addCase(removeMember.fulfilled, (state, action) => {
            state.memberActionLoading = false;
            state.members = state.members.filter((m) => m.id !== action.payload);
            state.successMessage = '成员已移除';
        });
        builder.addCase(removeMember.rejected, (state, action) => {
            state.memberActionLoading = false;
            state.error = action.payload;
        });
        // Fetch Tokens
        builder.addCase(fetchTokens.pending, (state) => {
            state.tokensLoading = true;
            state.error = null;
        });
        builder.addCase(fetchTokens.fulfilled, (state, action) => {
            state.tokensLoading = false;
            state.tokens = action.payload;
        });
        builder.addCase(fetchTokens.rejected, (state, action) => {
            state.tokensLoading = false;
            state.error = action.payload;
        });
        // Create Token
        builder.addCase(createToken.pending, (state) => {
            state.tokenActionLoading = true;
            state.error = null;
            state.newlyCreatedToken = null;
        });
        builder.addCase(createToken.fulfilled, (state, action) => {
            state.tokenActionLoading = false;
            const { token, ...tokenWithoutValue } = action.payload;
            state.tokens.push(tokenWithoutValue);
            state.newlyCreatedToken = token;
            state.successMessage = 'Token 创建成功，请立即复制保存';
        });
        builder.addCase(createToken.rejected, (state, action) => {
            state.tokenActionLoading = false;
            state.error = action.payload;
        });
        // Delete Token
        builder.addCase(deleteToken.pending, (state) => {
            state.tokenActionLoading = true;
            state.error = null;
        });
        builder.addCase(deleteToken.fulfilled, (state, action) => {
            state.tokenActionLoading = false;
            state.tokens = state.tokens.filter((t) => t.id !== action.payload);
            state.successMessage = 'Token 已删除';
        });
        builder.addCase(deleteToken.rejected, (state, action) => {
            state.tokenActionLoading = false;
            state.error = action.payload;
        });
    },
});
export const { clearError, clearSuccessMessage, clearNewlyCreatedToken, setSuccessMessage, } = settingsSlice.actions;
export default settingsSlice.reducer;
