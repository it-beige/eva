import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Input, Button, Typography, Pagination, Empty, Spin, Modal, message, } from 'antd';
import { PlusOutlined, ImportOutlined, QuestionCircleOutlined, } from '@ant-design/icons';
import { fetchApplications, createApplication, updateApplication, deleteApplication, importPublicAgent, setPage, } from '../../store/aiApplicationSlice';
import AppCard from './components/AppCard';
import CreateAppModal from './components/CreateAppModal';
import ImportPublicModal from './components/ImportPublicModal';
import { useDebounce } from '../../hooks/useDebounce';
const { Title, Text } = Typography;
const { Search } = Input;
const { confirm } = Modal;
// 默认项目ID（实际应该从项目选择器或路由参数获取）
const DEFAULT_PROJECT_ID = '00000000-0000-0000-0000-000000000001';
const AIApplicationPage = () => {
    const dispatch = useDispatch();
    const { applications, loading, total, page, pageSize, totalPages, } = useSelector((state) => state.aiApplication);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [importModalVisible, setImportModalVisible] = useState(false);
    const [editingApp, setEditingApp] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    // 防抖搜索
    const debouncedKeyword = useDebounce(searchKeyword, 300);
    // 获取应用列表
    const loadApplications = useCallback(() => {
        dispatch(fetchApplications({
            page,
            pageSize,
            keyword: debouncedKeyword || undefined,
            projectId: DEFAULT_PROJECT_ID,
        }));
    }, [dispatch, page, pageSize, debouncedKeyword]);
    useEffect(() => {
        loadApplications();
    }, [loadApplications]);
    // 处理搜索
    const handleSearch = (value) => {
        setSearchKeyword(value);
        dispatch(setPage(1));
    };
    // 处理页码变化
    const handlePageChange = (newPage) => {
        dispatch(setPage(newPage));
    };
    // 打开新增弹窗
    const handleOpenCreateModal = () => {
        setEditingApp(null);
        setCreateModalVisible(true);
    };
    // 打开编辑弹窗
    const handleEdit = (app) => {
        setEditingApp(app);
        setCreateModalVisible(true);
    };
    // 关闭新增/编辑弹窗
    const handleCloseCreateModal = () => {
        setCreateModalVisible(false);
        setEditingApp(null);
    };
    // 提交新增/编辑
    const handleSubmitCreate = async (values) => {
        setActionLoading(true);
        try {
            if (editingApp) {
                await dispatch(updateApplication({ id: editingApp.id, data: values })).unwrap();
                message.success('更新成功');
            }
            else {
                await dispatch(createApplication(values)).unwrap();
                message.success('创建成功');
            }
            setCreateModalVisible(false);
            setEditingApp(null);
            loadApplications();
        }
        catch (error) {
            message.error(error || '操作失败');
        }
        finally {
            setActionLoading(false);
        }
    };
    // 打开引用公共Agent弹窗
    const handleOpenImportModal = () => {
        setImportModalVisible(true);
    };
    // 关闭引用公共Agent弹窗
    const handleCloseImportModal = () => {
        setImportModalVisible(false);
    };
    // 提交引用公共Agent
    const handleSubmitImport = async (values) => {
        setActionLoading(true);
        try {
            await dispatch(importPublicAgent(values)).unwrap();
            message.success('引用成功');
            setImportModalVisible(false);
            loadApplications();
        }
        catch (error) {
            message.error(error || '引用失败');
        }
        finally {
            setActionLoading(false);
        }
    };
    // 处理删除
    const handleDelete = (app) => {
        confirm({
            title: '确认删除',
            content: `确定要删除应用 "${app.name}" 吗？此操作不可恢复。`,
            okText: '删除',
            okType: 'danger',
            cancelText: '取消',
            onOk: async () => {
                try {
                    await dispatch(deleteApplication(app.id)).unwrap();
                    message.success('删除成功');
                    loadApplications();
                }
                catch (error) {
                    message.error(error || '删除失败');
                }
            },
        });
    };
    // 处理评测
    const handleEvaluate = (app) => {
        // 跳转到评测任务创建页面，并携带应用ID
        window.location.href = `/eval/tasks/create?appId=${app.id}`;
    };
    return (_jsxs("div", { style: { padding: 24 }, children: [_jsxs("div", { style: { marginBottom: 24 }, children: [_jsx(Title, { level: 4, style: { marginBottom: 8 }, children: "AI\u5E94\u7528" }), _jsxs(Text, { type: "secondary", children: ["\u901A\u8FC7gitlab\u7BA1\u7406\u81EA\u5EFAAI\u5E94\u7528\u53CA\u7ADE\u54C1AI\u5E94\u7528\uFF0C\u5728\u8BC4\u6D4B\u4EFB\u52A1\u521B\u5EFA\u4E2D\u9009\u5B9AAI\u5E94\u7528\u4F5C\u4E3AAI\u5E94\u7528\u53D1\u8D77\u8BC4\u6D4B", _jsxs("a", { href: "#", style: { marginLeft: 8 }, onClick: (e) => {
                                    e.preventDefault();
                                    message.info('帮助文档功能开发中');
                                }, children: ["\u5E2E\u52A9\u6587\u6863 ", _jsx(QuestionCircleOutlined, {})] })] })] }), _jsxs("div", { style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 24,
                }, children: [_jsx(Search, { placeholder: "\u6309\u5E94\u7528\u540D\u79F0\u641C\u7D22", allowClear: true, onSearch: handleSearch, onChange: (e) => handleSearch(e.target.value), style: { width: 320 }, value: searchKeyword }), _jsxs("div", { style: { display: 'flex', gap: 12 }, children: [_jsx(Button, { icon: _jsx(ImportOutlined, {}), onClick: handleOpenImportModal, style: {
                                    backgroundColor: '#722ed1',
                                    borderColor: '#722ed1',
                                    color: '#fff',
                                }, children: "\u5F15\u7528\u516C\u5171Code Agent" }), _jsx(Button, { type: "primary", icon: _jsx(PlusOutlined, {}), onClick: handleOpenCreateModal, children: "\u65B0\u589EAI\u5E94\u7528" })] })] }), loading && applications.length === 0 ? (_jsx("div", { style: {
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: 400,
                }, children: _jsx(Spin, { size: "large" }) })) : applications.length === 0 ? (
            /* 空状态 */
            _jsx(Empty, { description: debouncedKeyword ? '未找到匹配的应用' : '暂无AI应用，请创建或引用', style: { marginTop: 80 } })) : (
            /* 应用卡片网格 */
            _jsxs(_Fragment, { children: [_jsx(Row, { gutter: [24, 24], children: applications.map((app) => (_jsx(Col, { xs: 24, sm: 12, md: 8, lg: 6, children: _jsx(AppCard, { application: app, onEdit: handleEdit, onDelete: handleDelete, onEvaluate: handleEvaluate }) }, app.id))) }), totalPages > 1 && (_jsx("div", { style: {
                            display: 'flex',
                            justifyContent: 'flex-end',
                            marginTop: 32,
                        }, children: _jsx(Pagination, { current: page, pageSize: pageSize, total: total, onChange: handlePageChange, showSizeChanger: false, showTotal: (total) => `共 ${total} 条` }) }))] })), _jsx(CreateAppModal, { visible: createModalVisible, onCancel: handleCloseCreateModal, onSubmit: handleSubmitCreate, editingApp: editingApp, projectId: DEFAULT_PROJECT_ID, loading: actionLoading }), _jsx(ImportPublicModal, { visible: importModalVisible, onCancel: handleCloseImportModal, onSubmit: handleSubmitImport, projectId: DEFAULT_PROJECT_ID, loading: actionLoading })] }));
};
export default AIApplicationPage;
