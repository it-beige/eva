import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type TopNavType = 'analytics' | 'observability' | 'evaluation';

interface UIState {
  sidebarCollapsed: boolean;
  activeTopNav: TopNavType;
}

const initialState: UIState = {
  sidebarCollapsed: false,
  activeTopNav: 'evaluation',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload;
    },
    setActiveTopNav: (state, action: PayloadAction<TopNavType>) => {
      state.activeTopNav = action.payload;
    },
  },
});

export const { toggleSidebar, setSidebarCollapsed, setActiveTopNav } = uiSlice.actions;
export default uiSlice.reducer;
