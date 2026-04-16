import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Tabs, Card } from 'antd';
import { SettingOutlined, TeamOutlined, KeyOutlined, } from '@ant-design/icons';
import ProjectSettings from './components/ProjectSettings';
import MemberManagement from './components/MemberManagement';
import TokenManagement from './components/TokenManagement';
const SettingsPage = () => {
    const [activeKey, setActiveKey] = useState('project');
    const tabItems = [
        {
            key: 'project',
            label: (_jsxs("span", { children: [_jsx(SettingOutlined, {}), "\u9879\u76EE\u8BBE\u7F6E"] })),
            children: _jsx(ProjectSettings, {}),
        },
        {
            key: 'members',
            label: (_jsxs("span", { children: [_jsx(TeamOutlined, {}), "\u6210\u5458\u7BA1\u7406"] })),
            children: _jsx(MemberManagement, {}),
        },
        {
            key: 'tokens',
            label: (_jsxs("span", { children: [_jsx(KeyOutlined, {}), "API Token"] })),
            children: _jsx(TokenManagement, {}),
        },
    ];
    return (_jsxs("div", { className: "h-full p-6", children: [_jsx("h1", { className: "text-2xl font-bold mb-6", children: "\u8BBE\u7F6E" }), _jsx(Card, { children: _jsx(Tabs, { activeKey: activeKey, onChange: setActiveKey, items: tabItems }) })] }));
};
export default SettingsPage;
