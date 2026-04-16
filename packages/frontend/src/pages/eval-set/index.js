import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Button, Input, Space, Tag, Typography, Tooltip, Popconfirm, message, Badge, Segmented, } from 'antd';
import { PlusOutlined, SearchOutlined, FilterOutlined, DeleteOutlined, BarChartOutlined, TableOutlined, PlayCircleOutlined, CodeOutlined, } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { fetchEvalSets, deleteEvalSet, setKeyword, setPage, setPageSize, } from '../../store/evalSetSlice';
import { CreateEvalSetModal } from './components/CreateEvalSetModal';
import { createEvalSet } from '../../store/evalSetSlice';
import { EvalSetType } from '@eva/shared';
const { Title, Text } = Typography;
const EVAL_SET_TYPE_COLORS = {
    [EvalSetType.TEXT]: 'blue',
    [EvalSetType.CODE]: 'green',
};
const EVAL_SET_TYPE_LABELS = {
    [EvalSetType.TEXT]: '文本',
    [EvalSetType.CODE]: 'Code',
};
const EvalSetListPage = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { evalSets, total, page, pageSize, loading, creating, keyword, } = useAppSelector((state) => state.evalSet);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [viewMode, setViewMode] = useState('table');
    const loadData = useCallback(() => {
        dispatch(fetchEvalSets({
            page,
            pageSize,
            keyword: keyword || undefined,
        }));
    }, [dispatch, page, pageSize, keyword]);
    useEffect(() => {
        loadData();
    }, [loadData]);
    const handleSearch = (value) => {
        dispatch(setKeyword(value));
        dispatch(setPage(1));
    };
    const handleDelete = async (id) => {
        try {
            await dispatch(deleteEvalSet(id)).unwrap();
            message.success('删除成功');
        }
        catch (error) {
            message.error('删除失败');
        }
    };
    const handleBatchDelete = async () => {
        try {
            await Promise.all(selectedRowKeys.map((id) => dispatch(deleteEvalSet(id)).unwrap()));
            message.success('批量删除成功');
            setSelectedRowKeys([]);
        }
        catch (error) {
            message.error('批量删除失败');
        }
    };
    const handleCreateSubmit = async (values) => {
        try {
            await dispatch(createEvalSet(values)).unwrap();
            message.success('创建成功');
            setCreateModalOpen(false);
        }
        catch (error) {
            message.error('创建失败');
        }
    };
    const handleStartEval = (evalSet) => {
        navigate(`/eval/tasks/create?evalSetId=${evalSet.id}`);
    };
    const columns = [
        {
            title: '名称',
            dataIndex: 'name',
            key: 'name',
            width: 200,
            render: (name, record) => (_jsx("a", { onClick: () => navigate(`/eval/datasets/${record.id}`), style: { fontWeight: 500 }, children: name })),
        },
        {
            title: '类型',
            dataIndex: 'type',
            key: 'type',
            width: 100,
            render: (type) => (_jsx(Tag, { color: EVAL_SET_TYPE_COLORS[type], children: EVAL_SET_TYPE_LABELS[type] })),
        },
        {
            title: '描述',
            dataIndex: 'description',
            key: 'description',
            width: 250,
            ellipsis: true,
            render: (desc) => desc || '-',
        },
        {
            title: '数据项',
            dataIndex: 'dataCount',
            key: 'dataCount',
            width: 100,
            align: 'center',
            render: (count) => _jsx(Badge, { count: count, showZero: true, color: "#5B21B6" }),
        },
        {
            title: '上次评测时间',
            dataIndex: 'lastEvalTime',
            key: 'lastEvalTime',
            width: 160,
            render: (time) => time ? new Date(time).toLocaleString() : '-',
        },
        {
            title: '创建时间',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 160,
            render: (date) => new Date(date).toLocaleString(),
        },
        {
            title: '创建人',
            dataIndex: 'createdBy',
            key: 'createdBy',
            width: 120,
            render: (creator) => creator || '-',
        },
        {
            title: '操作',
            key: 'action',
            width: 200,
            fixed: 'right',
            render: (_, record) => (_jsxs(Space, { size: "small", children: [record.type === 'code' && (_jsx(Tooltip, { title: "\u67E5\u770B\u4EE3\u7801", children: _jsx(Button, { type: "link", size: "small", icon: _jsx(CodeOutlined, {}), onClick: () => navigate(`/eval/datasets/${record.id}/code`), children: "\u67E5\u770B\u4EE3\u7801" }) })), _jsx(Tooltip, { title: "\u53D1\u8D77\u8BC4\u6D4B", children: _jsx(Button, { type: "link", size: "small", icon: _jsx(PlayCircleOutlined, {}), onClick: () => handleStartEval(record), children: "\u53D1\u8D77\u8BC4\u6D4B" }) }), _jsx(Popconfirm, { title: "\u786E\u8BA4\u5220\u9664", description: "\u786E\u5B9A\u8981\u5220\u9664\u8FD9\u4E2A\u8BC4\u6D4B\u96C6\u5417\uFF1F\u6B64\u64CD\u4F5C\u4E0D\u53EF\u6062\u590D\u3002", onConfirm: () => handleDelete(record.id), okText: "\u786E\u8BA4", cancelText: "\u53D6\u6D88", children: _jsx(Button, { type: "link", danger: true, size: "small", icon: _jsx(DeleteOutlined, {}), children: "\u5220\u9664" }) })] })),
        },
    ];
    const rowSelection = {
        selectedRowKeys,
        onChange: (keys) => {
            setSelectedRowKeys(keys);
        },
    };
    return (_jsxs("div", { style: { padding: 24 }, children: [_jsxs(Card, { bordered: false, children: [_jsxs("div", { style: { marginBottom: 24 }, children: [_jsx(Title, { level: 4, style: { marginBottom: 8 }, children: "\u8BC4\u6D4B\u96C6" }), _jsx(Text, { type: "secondary", children: "\u8BC4\u6D4B\u96C6\u662F\u7528\u4E8E\u8BC4\u6D4B\u8BC4\u4F30\u5BF9\u8C61\u7684\u4E00\u7EC4\u6570\u636E\u3002\u5B83\u901A\u5E38\u5305\u542B\u8F93\u5165\u6570\u636E\u548C\u9884\u671F\u7684\u8F93\u51FA\u7ED3\u679C\u3001\u5B9E\u9645\u8F93\u51FA\u7ED3\u679C\uFF0C\u9A8C\u8BC1\u8BC4\u4F30\u5BF9\u8C61\u7684\u6548\u679C\u3002" })] }), _jsxs("div", { style: {
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 16,
                        }, children: [_jsxs(Space, { children: [_jsx(Input, { placeholder: "\u6309\u540D\u79F0\u641C\u7D22", prefix: _jsx(SearchOutlined, {}), value: keyword, onChange: (e) => handleSearch(e.target.value), style: { width: 240 }, allowClear: true }), _jsx(Button, { icon: _jsx(FilterOutlined, {}), children: "\u7B5B\u9009 (0)" }), selectedRowKeys.length > 0 && (_jsx(Popconfirm, { title: "\u786E\u8BA4\u6279\u91CF\u5220\u9664", description: `确定要删除选中的 ${selectedRowKeys.length} 个评测集吗？`, onConfirm: handleBatchDelete, okText: "\u786E\u8BA4", cancelText: "\u53D6\u6D88", children: _jsxs(Button, { danger: true, icon: _jsx(DeleteOutlined, {}), children: ["\u5220\u9664 (", selectedRowKeys.length, ")"] }) }))] }), _jsxs(Space, { children: [_jsx(Segmented, { value: viewMode, onChange: (value) => setViewMode(value), options: [
                                            { value: 'table', icon: _jsx(TableOutlined, {}) },
                                            { value: 'chart', icon: _jsx(BarChartOutlined, {}) },
                                        ] }), _jsx(Button, { type: "primary", icon: _jsx(PlusOutlined, {}), onClick: () => setCreateModalOpen(true), children: "\u65B0\u5EFA\u8BC4\u6D4B\u96C6" })] })] }), _jsx(Table, { rowKey: "id", dataSource: evalSets, columns: columns, loading: loading, rowSelection: rowSelection, pagination: {
                            current: page,
                            pageSize,
                            total,
                            showSizeChanger: true,
                            showQuickJumper: true,
                            showTotal: (total) => `共 ${total} 条`,
                            onChange: (page, pageSize) => {
                                dispatch(setPage(page));
                                if (pageSize)
                                    dispatch(setPageSize(pageSize));
                            },
                        }, scroll: { x: 'max-content' } })] }), _jsx(CreateEvalSetModal, { open: createModalOpen, onCancel: () => setCreateModalOpen(false), onSubmit: handleCreateSubmit, loading: creating })] }));
};
export default EvalSetListPage;
