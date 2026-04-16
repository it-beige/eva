import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useCallback } from 'react';
import { Table, Button, Input, Tabs, Space, Typography, Dropdown, message, Popconfirm, Tooltip, } from 'antd';
import { PlusOutlined, SearchOutlined, DeleteOutlined, BarChartOutlined, MoreOutlined, ExportOutlined, } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { fetchEvalMetrics, deleteEvalMetric, deleteEvalMetrics, setCurrentScope, setKeyword, setSelectedRowKeys, setPage, setPageSize, showCreateModal, showEditModal, } from '../../store/evalMetricSlice';
import CreateMetricModal from './components/CreateMetricModal';
import { MetricScope, METRIC_TYPE_LABELS } from '@eva/shared';
const { Title, Paragraph } = Typography;
const { TabPane } = Tabs;
const EvalMetricListPage = () => {
    const dispatch = useAppDispatch();
    const { items, total, page, pageSize, loading, deleting, currentScope, keyword, selectedRowKeys, createModalVisible, editingMetric, } = useAppSelector((state) => state.evalMetric);
    // 获取列表数据
    const loadData = useCallback(() => {
        dispatch(fetchEvalMetrics({}));
    }, [dispatch]);
    // 初始加载和依赖变化时重新加载
    useEffect(() => {
        loadData();
    }, [loadData, currentScope, page, pageSize, keyword]);
    // 处理 Tab 切换
    const handleTabChange = (activeKey) => {
        dispatch(setCurrentScope(activeKey));
    };
    // 处理搜索
    const handleSearch = (value) => {
        dispatch(setKeyword(value));
    };
    // 处理分页
    const handlePageChange = (newPage, newPageSize) => {
        dispatch(setPage(newPage));
        if (newPageSize && newPageSize !== pageSize) {
            dispatch(setPageSize(newPageSize));
        }
    };
    // 处理选择行
    const handleRowSelection = (selectedKeys) => {
        dispatch(setSelectedRowKeys(selectedKeys));
    };
    // 处理新建
    const handleCreate = () => {
        dispatch(showCreateModal());
    };
    // 处理编辑
    const handleEdit = (record) => {
        dispatch(showEditModal(record));
    };
    // 处理删除
    const handleDelete = async (id) => {
        try {
            await dispatch(deleteEvalMetric(id)).unwrap();
            message.success('删除成功');
        }
        catch (error) {
            message.error(error.message || '删除失败');
        }
    };
    // 处理批量删除
    const handleBatchDelete = async () => {
        if (selectedRowKeys.length === 0) {
            message.warning('请先选择要删除的指标');
            return;
        }
        try {
            await dispatch(deleteEvalMetrics(selectedRowKeys)).unwrap();
            message.success(`成功删除 ${selectedRowKeys.length} 个指标`);
        }
        catch (error) {
            message.error(error.message || '批量删除失败');
        }
    };
    // 格式化日期
    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleString('zh-CN', {
            year: '2-digit',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };
    // 表格列定义
    const columns = [
        {
            title: '名称',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (_jsx("a", { onClick: () => handleEdit(record), style: { color: '#1890ff', cursor: 'pointer' }, children: text })),
        },
        {
            title: '描述',
            dataIndex: 'description',
            key: 'description',
            ellipsis: true,
            render: (text) => text || '-',
        },
        {
            title: '类型',
            dataIndex: 'type',
            key: 'type',
            width: 100,
            render: (type) => METRIC_TYPE_LABELS[type] || type,
        },
        {
            title: '更新人',
            dataIndex: 'updatedBy',
            key: 'updatedBy',
            width: 120,
            render: (text) => text || '-',
        },
        {
            title: '更新时间',
            dataIndex: 'updatedAt',
            key: 'updatedAt',
            width: 150,
            render: (date) => formatDate(date),
        },
        {
            title: '创建人',
            dataIndex: 'createdBy',
            key: 'createdBy',
            width: 120,
            render: (text) => text || '-',
        },
        {
            title: '创建时间',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 150,
            render: (date) => formatDate(date),
        },
        {
            title: '操作',
            key: 'action',
            width: 80,
            fixed: 'right',
            render: (_, record) => {
                const items = [
                    {
                        key: 'edit',
                        label: '编辑',
                        onClick: () => handleEdit(record),
                    },
                    {
                        key: 'delete',
                        label: (_jsx(Popconfirm, { title: "\u786E\u5B9A\u5220\u9664\u6B64\u6307\u6807?", onConfirm: () => handleDelete(record.id), okText: "\u786E\u5B9A", cancelText: "\u53D6\u6D88", children: _jsx("span", { style: { color: '#ff4d4f' }, children: "\u5220\u9664" }) })),
                    },
                ];
                return (_jsx(Dropdown, { menu: { items }, placement: "bottomRight", children: _jsx(Button, { type: "text", icon: _jsx(MoreOutlined, {}) }) }));
            },
        },
    ];
    // 行选择配置
    const rowSelection = {
        selectedRowKeys,
        onChange: handleRowSelection,
    };
    return (_jsxs("div", { style: { padding: 24 }, children: [_jsxs("div", { style: { marginBottom: 24 }, children: [_jsx(Title, { level: 4, style: { marginBottom: 8 }, children: "\u8BC4\u4F30\u6307\u6807" }), _jsxs(Paragraph, { type: "secondary", style: { marginBottom: 0 }, children: ["\u8BC4\u4F30\u6307\u6807\u5145\u5F53\u88C1\u5224\u7684\u89D2\u8272\uFF0C\u7528\u4E8E\u81EA\u52A8\u5316\u6216\u534A\u81EA\u52A8\u5316\u8BC4\u4F30 AI Agent \u6548\u679C\u3002\u8BC4\u4F30\u6307\u6807\u901A\u8FC7\u9884\u5B9A\u4E49\u7684\u89C4\u5219\uFF0C\u5BF9\u8BC4\u4F30\u5BF9\u8C61\u7684\u8F93\u51FA\u8FDB\u884C\u591A\u7EF4\u5EA6\u5206\u6790\uFF0C\u751F\u6210\u53EF\u91CF\u5316\u7684\u6307\u6807\u548C\u5F52\u56E0\u7ED3\u8BBA\u3002", _jsxs("a", { href: "#", onClick: (e) => {
                                    e.preventDefault();
                                    // TODO: 打开帮助文档
                                }, style: { marginLeft: 8 }, children: ["\u5E2E\u52A9\u6587\u6863 ", _jsx(ExportOutlined, { style: { fontSize: 12 } })] })] })] }), _jsxs(Tabs, { activeKey: currentScope, onChange: handleTabChange, style: { marginBottom: 16 }, children: [_jsx(TabPane, { tab: "\u4E2A\u4EBA\u6307\u6807" }, MetricScope.PERSONAL), _jsx(TabPane, { tab: "\u516C\u5171\u6307\u6807" }, MetricScope.PUBLIC)] }), _jsxs("div", { style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 16,
                }, children: [_jsxs(Space, { children: [_jsx(Input.Search, { placeholder: "\u6309\u540D\u79F0\u641C\u7D22", allowClear: true, onSearch: handleSearch, style: { width: 280 }, prefix: _jsx(SearchOutlined, {}) }), selectedRowKeys.length > 0 && (_jsx(Popconfirm, { title: `确定删除选中的 ${selectedRowKeys.length} 个指标?`, onConfirm: handleBatchDelete, okText: "\u786E\u5B9A", cancelText: "\u53D6\u6D88", children: _jsxs(Button, { danger: true, icon: _jsx(DeleteOutlined, {}), loading: deleting, children: ["\u5220\u9664 (", selectedRowKeys.length, ")"] }) }))] }), _jsxs(Space, { children: [_jsx(Tooltip, { title: "\u56FE\u8868\u89C6\u56FE", children: _jsx(Button, { icon: _jsx(BarChartOutlined, {}) }) }), _jsx(Button, { type: "primary", icon: _jsx(PlusOutlined, {}), onClick: handleCreate, children: "\u65B0\u5EFA\u8BC4\u4F30\u6307\u6807" })] })] }), _jsx(Table, { rowKey: "id", columns: columns, dataSource: items, loading: loading, rowSelection: rowSelection, pagination: {
                    current: page,
                    pageSize,
                    total,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total) => `共 ${total} 条`,
                    onChange: handlePageChange,
                }, scroll: { x: 1200 } }), _jsx(CreateMetricModal, { visible: createModalVisible, editingMetric: editingMetric })] }));
};
export default EvalMetricListPage;
