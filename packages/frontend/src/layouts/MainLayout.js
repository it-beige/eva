import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Layout, Menu, Avatar, Select, Input, Button } from 'antd';
import { LeftOutlined, RightOutlined, SearchOutlined, CheckCircleOutlined, DatabaseOutlined, BarChartOutlined, PlayCircleOutlined, FileTextOutlined, ExperimentOutlined, TrophyOutlined, AppstoreOutlined, SettingOutlined, } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { toggleSidebar, setActiveTopNav } from '../store/uiSlice';
import styles from './MainLayout.module.css';
const { Header, Sider, Content } = Layout;
const { Option } = Select;
const topNavItems = [
    { key: 'analytics', label: '应用分析', path: '/analytics' },
    { key: 'observability', label: '应用可观测', path: '/observability/traces' },
    { key: 'evaluation', label: '应用评测', path: '/eval/tasks' },
];
const menuItems = [
    {
        type: 'group',
        label: '评测',
        children: [
            { key: '/eval/tasks', icon: _jsx(CheckCircleOutlined, {}), label: '评测任务' },
            { key: '/eval/datasets', icon: _jsx(DatabaseOutlined, {}), label: '评测集' },
            { key: '/eval/metrics', icon: _jsx(BarChartOutlined, {}), label: '评估指标' },
            { key: '/eval/auto-eval', icon: _jsx(PlayCircleOutlined, {}), label: '自动化评测' },
        ],
    },
    {
        type: 'group',
        label: 'Prompt',
        children: [
            { key: '/eval/prompts', icon: _jsx(FileTextOutlined, {}), label: 'Prompt管理' },
            { key: '/eval/playground', icon: _jsx(ExperimentOutlined, {}), label: 'Playground' },
        ],
    },
    {
        type: 'item',
        key: '/eval/leaderboard',
        icon: _jsx(TrophyOutlined, {}),
        label: 'Leaderboard',
    },
    {
        type: 'item',
        key: '/eval/apps',
        icon: _jsx(AppstoreOutlined, {}),
        label: 'AI应用管理',
    },
    {
        type: 'item',
        key: '/eval/settings',
        icon: _jsx(SettingOutlined, {}),
        label: '设置',
    },
];
const MainLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { sidebarCollapsed, activeTopNav } = useAppSelector((state) => state.ui);
    const handleTopNavClick = (nav) => {
        dispatch(setActiveTopNav(nav.key));
        navigate(nav.path);
    };
    const handleMenuClick = (key) => {
        navigate(key);
    };
    const renderMenuItems = () => {
        return menuItems.map((item, index) => {
            if (item.type === 'group') {
                return (_jsxs("div", { children: [!sidebarCollapsed && (_jsx("div", { className: styles.menuGroupTitle, children: item.label })), item.children?.map((child) => (_jsx(Menu.Item, { icon: child.icon, onClick: () => handleMenuClick(child.key), children: child.label }, child.key)))] }, index));
            }
            return (_jsx(Menu.Item, { icon: item.icon, onClick: () => handleMenuClick(item.key), children: item.label }, item.key));
        });
    };
    return (_jsxs(Layout, { className: styles.layout, children: [_jsxs(Header, { className: styles.header, children: [_jsx("div", { className: styles.logoSection, children: _jsxs("div", { className: styles.logo, children: [_jsx("div", { className: styles.logoIcon, children: "E" }), _jsx("span", { children: "Eva+" })] }) }), _jsx("nav", { className: styles.navTabs, children: topNavItems.map((nav) => (_jsx("div", { className: `${styles.navTab} ${activeTopNav === nav.key ? styles.navTabActive : ''}`, onClick: () => handleTopNavClick(nav), children: nav.label }, nav.key))) }), _jsx("div", { className: styles.userSection, children: _jsx(Avatar, { size: "default", style: { backgroundColor: '#5B21B6' }, children: "U" }) })] }), _jsxs(Layout, { children: [_jsxs(Sider, { width: 220, collapsed: sidebarCollapsed, collapsedWidth: 64, className: styles.sider, trigger: null, children: [_jsxs("div", { className: styles.siderHeader, children: [!sidebarCollapsed && (_jsxs(Select, { className: styles.projectSelector, defaultValue: "project1", bordered: false, dropdownMatchSelectWidth: false, children: [_jsx(Option, { value: "project1", children: "AI\u8BC4\u6D4B-\u6218\u7565\u90E8\u5F00..." }), _jsx(Option, { value: "project2", children: "AI\u8BC4\u6D4B-\u4EA7\u54C1\u90E8\u9879\u76EE" })] })), _jsx(Button, { type: "text", size: "small", className: styles.collapseBtn, icon: sidebarCollapsed ? _jsx(RightOutlined, {}) : _jsx(LeftOutlined, {}), onClick: () => dispatch(toggleSidebar()) })] }), !sidebarCollapsed && (_jsx("div", { className: styles.searchWrapper, children: _jsx(Input, { prefix: _jsx(SearchOutlined, {}), placeholder: "\u641C\u7D22\u9879\u76EE", bordered: false }) })), _jsx(Menu, { mode: "inline", selectedKeys: [location.pathname], className: styles.menuWrapper, inlineCollapsed: sidebarCollapsed, children: renderMenuItems() })] }), _jsx(Content, { className: styles.content, children: _jsx("div", { className: styles.contentWrapper, children: _jsx(Outlet, {}) }) })] })] }));
};
export default MainLayout;
