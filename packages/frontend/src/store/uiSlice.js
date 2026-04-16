import { createSlice } from '@reduxjs/toolkit';
const initialState = {
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
        setSidebarCollapsed: (state, action) => {
            state.sidebarCollapsed = action.payload;
        },
        setActiveTopNav: (state, action) => {
            state.activeTopNav = action.payload;
        },
    },
});
export const { toggleSidebar, setSidebarCollapsed, setActiveTopNav } = uiSlice.actions;
export default uiSlice.reducer;
