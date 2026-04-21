import { createSlice, PayloadAction } from '@reduxjs/toolkit';

/** 单个标签页数据 */
export interface TabItem {
  /** 路由路径，作为唯一标识 */
  key: string;
  /** 标签页标题 */
  title: string;
  /** 是否可关闭（首页等固定标签不可关闭） */
  closable: boolean;
}

interface TabsState {
  /** 已打开的标签页列表（有序） */
  tabs: TabItem[];
  /** 当前激活的标签页 key */
  activeKey: string;
}

/** 默认首页标签 */
const HOME_TAB: TabItem = {
  key: '/eval/tasks',
  title: '评测任务',
  closable: false,
};

const initialState: TabsState = {
  tabs: [HOME_TAB],
  activeKey: HOME_TAB.key,
};

const tabsSlice = createSlice({
  name: 'tabs',
  initialState,
  reducers: {
    /**
     * 添加标签页（或激活已存在的标签页）
     *
     * - 如果标签页已存在，仅切换激活状态
     * - 如果标签页不存在，追加到列表末尾并激活
     */
    addTab(state, action: PayloadAction<TabItem>) {
      const { key, title, closable } = action.payload;
      const existing = state.tabs.find((t) => t.key === key);

      if (existing) {
        // 标题可能因动态路由而变化，同步更新
        existing.title = title;
      } else {
        state.tabs.push({ key, title, closable });
      }

      state.activeKey = key;
    },

    /** 切换到指定标签页 */
    setActiveTab(state, action: PayloadAction<string>) {
      const target = state.tabs.find((t) => t.key === action.payload);
      if (target) {
        state.activeKey = action.payload;
      }
    },

    /**
     * 关闭指定标签页
     *
     * 关闭后的激活策略：
     *  1. 如果关闭的不是当前激活标签，保持不变
     *  2. 如果关闭的是当前激活标签，激活右侧相邻标签
     *  3. 如果右侧没有标签，激活左侧相邻标签
     */
    removeTab(state, action: PayloadAction<string>) {
      const key = action.payload;
      const index = state.tabs.findIndex((t) => t.key === key);
      if (index === -1) return;

      // 不可关闭的标签不允许移除
      if (!state.tabs[index].closable) return;

      // 如果关闭的是当前激活标签，需要重新选择激活标签
      if (state.activeKey === key) {
        const nextTab = state.tabs[index + 1] ?? state.tabs[index - 1];
        state.activeKey = nextTab?.key ?? HOME_TAB.key;
      }

      state.tabs.splice(index, 1);

      // 保证至少有一个标签
      if (state.tabs.length === 0) {
        state.tabs.push(HOME_TAB);
        state.activeKey = HOME_TAB.key;
      }
    },

    /**
     * 关闭其他标签页（保留当前激活标签和不可关闭标签）
     */
    removeOtherTabs(state, action: PayloadAction<string>) {
      const keepKey = action.payload;
      state.tabs = state.tabs.filter((t) => !t.closable || t.key === keepKey);
      state.activeKey = keepKey;
    },

    /**
     * 关闭所有可关闭的标签页
     */
    removeAllTabs(state) {
      state.tabs = state.tabs.filter((t) => !t.closable);
      if (state.tabs.length === 0) {
        state.tabs.push(HOME_TAB);
      }
      state.activeKey = state.tabs[0].key;
    },
  },
});

export const {
  addTab,
  setActiveTab,
  removeTab,
  removeOtherTabs,
  removeAllTabs,
} = tabsSlice.actions;

export default tabsSlice.reducer;
