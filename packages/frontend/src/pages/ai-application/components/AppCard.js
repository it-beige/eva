import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, Avatar, Dropdown, Button, Typography, Space } from 'antd';
import { MoreOutlined, LinkOutlined, ExperimentOutlined, EditOutlined, DeleteOutlined, } from '@ant-design/icons';
const { Text } = Typography;
const AppCard = ({ application, onEdit, onDelete, onEvaluate, }) => {
    // 获取首字母作为头像
    const getInitial = (name) => {
        return name.charAt(0).toUpperCase();
    };
    // 获取头像颜色
    const getAvatarColor = (name) => {
        const colors = [
            '#1677ff',
            '#52c41a',
            '#faad14',
            '#f5222d',
            '#722ed1',
            '#13c2c2',
            '#eb2f96',
            '#fa541c',
        ];
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    };
    const handleMenuClick = (key) => {
        switch (key) {
            case 'edit':
                onEdit(application);
                break;
            case 'delete':
                onDelete(application);
                break;
        }
    };
    const items = [
        {
            key: 'edit',
            icon: _jsx(EditOutlined, {}),
            label: '编辑',
        },
        {
            key: 'delete',
            icon: _jsx(DeleteOutlined, {}),
            label: '删除',
            danger: true,
        },
    ];
    const handleOpenRepo = () => {
        if (application.gitRepoUrl) {
            window.open(application.gitRepoUrl, '_blank');
        }
    };
    return (_jsxs(Card, { hoverable: true, style: {
            borderRadius: 8,
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.06)',
            transition: 'all 0.3s ease',
        }, bodyStyle: { padding: 16 }, children: [_jsxs("div", { style: {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 12,
                }, children: [_jsxs(Space, { children: [_jsx(Avatar, { style: {
                                    backgroundColor: getAvatarColor(application.name),
                                    fontSize: 16,
                                    fontWeight: 500,
                                }, size: 40, children: getInitial(application.name) }), _jsx(Text, { strong: true, style: {
                                    fontSize: 16,
                                    maxWidth: 140,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                }, title: application.name, children: application.name })] }), _jsx(Dropdown, { menu: { items, onClick: ({ key }) => handleMenuClick(key) }, placement: "bottomRight", trigger: ['click'], children: _jsx(Button, { type: "text", icon: _jsx(MoreOutlined, {}), size: "small" }) })] }), _jsxs("div", { style: { marginBottom: 16, minHeight: 60 }, children: [_jsxs("div", { style: { marginBottom: 8 }, children: [_jsxs(Text, { type: "secondary", style: { fontSize: 13 }, children: ["\u5E94\u7528\u63CF\u8FF0:", ' '] }), _jsx(Text, { style: { fontSize: 13 }, ellipsis: { tooltip: application.description || '暂无描述' }, children: application.description || '暂无描述' })] }), _jsxs("div", { children: [_jsxs(Text, { type: "secondary", style: { fontSize: 13 }, children: ["\u6700\u65B0\u7248\u672C:", ' '] }), _jsx(Text, { style: { fontSize: 13 }, children: application.latestVersion || '无' })] })] }), _jsxs("div", { style: { display: 'flex', gap: 8 }, children: [_jsx(Button, { type: "default", icon: _jsx(ExperimentOutlined, {}), onClick: () => onEvaluate(application), style: { flex: 1 }, children: "\u8BC4\u6D4B" }), _jsx(Button, { type: "default", icon: _jsx(LinkOutlined, {}), onClick: handleOpenRepo, disabled: !application.gitRepoUrl, style: { flex: 1 }, children: "\u4EE3\u7801\u4ED3\u5E93" })] })] }));
};
export default AppCard;
