import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, Breadcrumb, Button, Space, Tag, Typography, Divider, Row, Col, message, Modal, Form, Input, Pagination, } from 'antd';
import { ArrowLeftOutlined, FilterOutlined, DownloadOutlined, CopyOutlined, BarChartOutlined, TableOutlined, RobotOutlined, ThunderboltOutlined, PlusOutlined, ClockCircleOutlined, LinkOutlined, TagOutlined, } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { fetchEvalSet, fetchEvalSetItems, deleteEvalSetItem, createEvalSetItem, updateEvalSetItem, setItemsPage, setItemsPageSize, clearCurrentEvalSet, } from '../../store/evalSetSlice';
import { EvalSetItemTable } from './components/EvalSetItemTable';
import { ColumnManager } from './components/ColumnManager';
import { TagManager } from './components/TagManager';
const { Title, Text } = Typography;
const { TextArea } = Input;
const EVAL_SET_TYPE_COLORS = {
    text: 'blue',
    code: 'green',
};
const EVAL_SET_TYPE_LABELS = {
    text: '文本',
    code: 'Code',
};
const EvalSetDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { currentEvalSet, detailLoading, items, itemsTotal, itemsPage, itemsPageSize, itemsLoading, } = useAppSelector((state) => state.evalSet);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [visibleColumns, setVisibleColumns] = useState(['input', 'output']);
    const [allColumns, setAllColumns] = useState(['input', 'output']);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [form] = Form.useForm();
    const [tags, setTags] = useState([]);
    const loadData = useCallback(() => {
        if (id) {
            dispatch(fetchEvalSet(id));
            dispatch(fetchEvalSetItems({
                evalSetId: id,
                params: { page: itemsPage, pageSize: itemsPageSize },
            }));
        }
    }, [dispatch, id, itemsPage, itemsPageSize]);
    useEffect(() => {
        loadData();
        return () => {
            dispatch(clearCurrentEvalSet());
        };
    }, [loadData, dispatch]);
    // 从数据项中提取所有列
    useEffect(() => {
        if (items.length > 0) {
            const columnsSet = new Set();
            items.forEach((item) => {
                if (item.input && typeof item.input === 'object') {
                    Object.keys(item.input).forEach((key) => columnsSet.add(key));
                }
            });
            const columns = Array.from(columnsSet);
            setAllColumns(columns);
            if (visibleColumns.length === 0) {
                setVisibleColumns(columns.slice(0, 5));
            }
        }
    }, [items]);
    const handleDeleteItem = async (itemId) => {
        if (!id)
            return;
        try {
            await dispatch(deleteEvalSetItem({ evalSetId: id, itemId })).unwrap();
            message.success('删除成功');
        }
        catch (error) {
            message.error('删除失败');
        }
    };
    const handleEditItem = (item) => {
        setCurrentItem(item);
        form.setFieldsValue({
            input: JSON.stringify(item.input, null, 2),
            output: JSON.stringify(item.output, null, 2),
        });
        setEditModalOpen(true);
    };
    const handleSaveItem = async () => {
        if (!id || !currentItem)
            return;
        try {
            const values = await form.validateFields();
            await dispatch(updateEvalSetItem({
                evalSetId: id,
                itemId: currentItem.id,
                data: {
                    input: JSON.parse(values.input),
                    output: values.output ? JSON.parse(values.output) : undefined,
                },
            })).unwrap();
            message.success('保存成功');
            setEditModalOpen(false);
            setCurrentItem(null);
        }
        catch (error) {
            message.error('保存失败，请检查JSON格式');
        }
    };
    const handleAddItem = async () => {
        if (!id)
            return;
        try {
            await dispatch(createEvalSetItem({
                evalSetId: id,
                data: {
                    input: { question: '新问题' },
                    output: { answer: '新答案' },
                },
            })).unwrap();
            message.success('添加成功');
        }
        catch (error) {
            message.error('添加失败');
        }
    };
    const handleAddTag = (tag) => {
        setTags([...tags, tag]);
        message.success(`添加标签: ${tag}`);
    };
    const handleRemoveTag = (tag) => {
        setTags(tags.filter((t) => t !== tag));
        message.success(`移除标签: ${tag}`);
    };
    const handleExport = () => {
        message.success('导出功能开发中');
    };
    const handleCopy = () => {
        message.success('复制功能开发中');
    };
    const handleAIGenerate = () => {
        message.success('AI扩写功能开发中');
    };
    const handleAIPreprocess = () => {
        message.success('AI数据加工功能开发中');
    };
    if (!currentEvalSet && !detailLoading) {
        return (_jsx("div", { style: { padding: 24 }, children: _jsx(Card, { children: _jsx(Text, { type: "secondary", children: "\u8BC4\u6D4B\u96C6\u4E0D\u5B58\u5728" }) }) }));
    }
    return (_jsxs("div", { style: { padding: 24 }, children: [_jsxs(Breadcrumb, { style: { marginBottom: 16 }, children: [_jsx(Breadcrumb.Item, { children: _jsx(Link, { to: "/eval/datasets", children: "\u8BC4\u6D4B\u96C6" }) }), _jsx(Breadcrumb.Item, { children: currentEvalSet?.name || '加载中...' }), _jsx(Breadcrumb.Item, { children: "Items" })] }), _jsxs(Card, { loading: detailLoading, bordered: false, children: [_jsxs("div", { style: { marginBottom: 24 }, children: [_jsxs(Space, { align: "center", style: { marginBottom: 16 }, children: [_jsx(Button, { icon: _jsx(ArrowLeftOutlined, {}), onClick: () => navigate('/eval/datasets'), children: "\u8FD4\u56DE" }), _jsx(Title, { level: 4, style: { margin: 0 }, children: currentEvalSet?.name }), currentEvalSet && (_jsx(Tag, { color: EVAL_SET_TYPE_COLORS[currentEvalSet.type], children: EVAL_SET_TYPE_LABELS[currentEvalSet.type] }))] }), _jsxs(Row, { gutter: 24, style: { marginBottom: 16 }, children: [_jsx(Col, { children: _jsxs(Space, { children: [_jsx(ClockCircleOutlined, {}), _jsxs(Text, { type: "secondary", children: ["\u521B\u5EFA\u65F6\u95F4:", ' ', currentEvalSet?.createdAt
                                                            ? new Date(currentEvalSet.createdAt).toLocaleString()
                                                            : '-'] })] }) }), currentEvalSet?.gitRepoUrl && (_jsx(Col, { children: _jsxs(Space, { children: [_jsx(LinkOutlined, {}), _jsx("a", { href: currentEvalSet.gitRepoUrl, target: "_blank", rel: "noopener noreferrer", children: "GitLab\u4ED3\u5E93\u5730\u5740" })] }) }))] }), _jsx("div", { style: { marginBottom: 16 }, children: _jsxs(Space, { align: "center", children: [_jsx(TagOutlined, {}), _jsx(TagManager, { tags: tags, onAddTag: handleAddTag, onRemoveTag: handleRemoveTag })] }) })] }), _jsx(Divider, {}), _jsxs("div", { style: {
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 16,
                            flexWrap: 'wrap',
                            gap: 16,
                        }, children: [_jsxs(Space, { children: [_jsx(Button, { icon: _jsx(FilterOutlined, {}), children: "\u7B5B\u9009 (0)" }), _jsx(Button, { icon: _jsx(DownloadOutlined, {}), onClick: handleExport, children: "\u4E0B\u8F7D" }), _jsx(Button, { icon: _jsx(CopyOutlined, {}), onClick: handleCopy, children: "\u590D\u5236" })] }), _jsxs(Space, { children: [_jsx(Button, { icon: _jsx(BarChartOutlined, {}) }), _jsx(Button, { icon: _jsx(TableOutlined, {}) }), _jsx(ColumnManager, { allColumns: allColumns, visibleColumns: visibleColumns, onChange: setVisibleColumns }), _jsx(Button, { icon: _jsx(RobotOutlined, {}), onClick: handleAIGenerate, children: "AI\u6269\u5199" }), _jsx(Button, { icon: _jsx(ThunderboltOutlined, {}), onClick: handleAIPreprocess, children: "AI\u6570\u636E\u52A0\u5DE5" }), _jsx(Button, { type: "primary", icon: _jsx(PlusOutlined, {}), onClick: handleAddItem, children: "\u65B0\u589E\u6570\u636E\u9879" })] })] }), _jsx(EvalSetItemTable, { items: items, loading: itemsLoading, columns: allColumns, visibleColumns: visibleColumns, selectedRowKeys: selectedRowKeys, onSelectChange: setSelectedRowKeys, onEdit: handleEditItem, onDelete: handleDeleteItem, isCodeType: currentEvalSet?.type === 'code' }), _jsx("div", { style: { marginTop: 16, display: 'flex', justifyContent: 'flex-end' }, children: _jsx(Pagination, { current: itemsPage, pageSize: itemsPageSize, total: itemsTotal, showSizeChanger: true, showQuickJumper: true, showTotal: (total) => `共 ${total} 条`, onChange: (page, pageSize) => {
                                dispatch(setItemsPage(page));
                                if (pageSize)
                                    dispatch(setItemsPageSize(pageSize));
                            } }) })] }), _jsx(Modal, { title: "\u7F16\u8F91\u6570\u636E\u9879", open: editModalOpen, onCancel: () => {
                    setEditModalOpen(false);
                    setCurrentItem(null);
                }, onOk: handleSaveItem, width: 800, children: _jsxs(Form, { form: form, layout: "vertical", children: [_jsx(Form.Item, { label: "Input (JSON)", name: "input", rules: [{ required: true, message: '请输入Input数据' }], children: _jsx(TextArea, { rows: 10, style: { fontFamily: 'monospace' } }) }), _jsx(Form.Item, { label: "Output (JSON)", name: "output", children: _jsx(TextArea, { rows: 10, style: { fontFamily: 'monospace' } }) })] }) })] }));
};
export default EvalSetDetailPage;
