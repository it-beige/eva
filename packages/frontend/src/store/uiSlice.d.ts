export type TopNavType = 'analytics' | 'observability' | 'evaluation';
interface UIState {
    sidebarCollapsed: boolean;
    activeTopNav: TopNavType;
}
export declare const toggleSidebar: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"ui/toggleSidebar">, setSidebarCollapsed: import("@reduxjs/toolkit").ActionCreatorWithPayload<boolean, "ui/setSidebarCollapsed">, setActiveTopNav: import("@reduxjs/toolkit").ActionCreatorWithPayload<TopNavType, "ui/setActiveTopNav">;
declare const _default: import("@reduxjs/toolkit").Reducer<UIState>;
export default _default;
