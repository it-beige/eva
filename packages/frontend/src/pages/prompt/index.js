import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Table, Space, Dropdown, message, Popconfirm, Typography, Tooltip, } from 'antd';
import { PlusOutlined, SearchOutlined, FilterOutlined, DeleteOutlined, BarChartOutlined, TableOutlined, MoreOutlined, EditOutlined, } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { fetchPrompts, deletePrompt, setCurrentPrompt, } from '../../store/promptSlice';
import CreatePromptModal from './components/CreatePromptModal';
import styles from './Prompt.module.css';
const { Title, Text } = Typography;
const PromptListPage = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { prompts, total, loading } = useAppSelector((state) => state.prompt);
    const [keyword, setKeyword] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPrompt, setEditingPrompt] = useState(null);
    const [viewMode, setViewMode] = useState('table');
    useEffect(() => {
        loadPrompts();
    }, [page, pageSize]);
    const loadPrompts = () => {
        dispatch(fetchPrompts({ page, pageSize, keyword }));
    };
    const handleSearch = () => {
        setPage(1);
        loadPrompts();
    };
    const handleDelete = async (id) => {
        try {
            await dispatch(deletePrompt(id)).unwrap();
            message.success('删除成功');
        }
        catch (error) {
            message.error('删除失败');
        }
    };
    const handleEdit = (record) => {
        setEditingPrompt(record);
        setIsModalOpen(true);
    };
    const handleCreate = () => {
        setEditingPrompt(null);
        setIsModalOpen(true);
    };
    const handleModalClose = () => {
        setIsModalOpen(false);
        setEditingPrompt(null);
    };
    const handleSuccess = () => {
        handleModalClose();
        loadPrompts();
    };
    const handleNameClick = (record) => {
        dispatch(setCurrentPrompt(record));
        navigate(`/eval/prompts/${record.id}`);
    };
    const columns = [
        {
            title: '名称',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (_jsx("a", { onClick: () => handleNameClick(record), className: styles.nameLink, children: text })),
        },
        {
            title: '描述',
            dataIndex: 'description',
            key: 'description',
            ellipsis: true,
            render: (text) => text || '-',
        },
        {
            title: '版本号',
            dataIndex: 'version',
            key: 'version',
            width: 100,
            render: (version) => `v${version}`,
        },
        {
            title: '更新时间',
            dataIndex: 'updatedAt',
            key: 'updatedAt',
            width: 180,
            render: (date) => new Date(date).toLocaleString(),
        },
        {
            title: '操作',
            key: 'action',
            width: 80,
            render: (_, record) => (_jsx(Dropdown, { menu: {
                    items: [
                        {
                            key: 'edit',
                            icon: _jsx(EditOutlined, {}),
                            label: '编辑',
                            onClick: () => handleEdit(record),
                        },
                        {
                            key: 'delete',
                            icon: _jsx(DeleteOutlined, {}),
                            label: (_jsx(Popconfirm, { title: "\u786E\u8BA4\u5220\u9664", description: "\u5220\u9664\u540E\u65E0\u6CD5\u6062\u590D\uFF0C\u662F\u5426\u7EE7\u7EED\uFF1F", onConfirm: () => handleDelete(record.id), okText: "\u786E\u8BA4", cancelText: "\u53D6\u6D88", children: _jsx("span", { style: { color: '#ff4d4f' }, children: "\u5220\u9664" }) })),
                        },
                    ],
                }, trigger: ['click'], children: _jsx(Button, { type: "text", icon: _jsx(MoreOutlined, {}) }) })),
        },
    ];
    return (_jsxs("div", { className: styles.container, children: [_jsx("div", { className: styles.header, children: _jsxs("div", { children: [_jsx(Title, { level: 4, style: { marginBottom: 4 }, children: "Prompt\u7BA1\u7406" }), _jsx(Text, { type: "secondary", children: "\u652F\u6301\u7BA1\u7406\u4E0D\u540C\u7248\u672CPrompt\uFF0C\u5E76\u57FA\u4E8E\u6B64\u8FDB\u884C\u591A\u7248\u672C\u5BF9\u6BD4\u8C03\u8BD5" })] }) }), _jsxs("div", { className: styles.toolbar, children: [_jsxs(Space, { children: [_jsx(Input, { placeholder: "\u6309\u540D\u79F0\u641C\u7D22", prefix: _jsx(SearchOutlined, {}), value: keyword, onChange: (e) => setKeyword(e.target.value), onPressEnter: handleSearch, style: { width: 280 } }), _jsx(Button, { icon: _jsx(FilterOutlined, {}), children: "\u7B5B\u9009 (0)" }), _jsx(Tooltip, { title: "\u5220\u9664", children: _jsx(Button, { icon: _jsx(DeleteOutlined, {}) }) })] }), _jsxs(Space, { children: [_jsx(Button, { icon: viewMode === 'table' ? _jsx(TableOutlined, {}) : _jsx(BarChartOutlined, {}), onClick: () => setViewMode(viewMode === 'table' ? 'chart' : 'table') }), _jsx(Button, { type: "primary", icon: _jsx(PlusOutlined, {}), onClick: handleCreate, children: "\u65B0\u5EFAPrompt" })] })] }), _jsx(Table, { columns: columns, dataSource: prompts, rowKey: "id", loading: loading, pagination: {
                    current: page,
                    pageSize,
                    total,
                    showSizeChanger: true,
                    showTotal: (total) => `共 ${total} 条`,
                    onChange: (p, ps) => {
                        setPage(p);
                        if (ps)
                            setPageSize(ps);
                    },
                } }), _jsx(CreatePromptModal, { open: isModalOpen, onCancel: handleModalClose, onSuccess: handleSuccess, initialValues: editingPrompt })] }));
};
export default PromptListPage;
