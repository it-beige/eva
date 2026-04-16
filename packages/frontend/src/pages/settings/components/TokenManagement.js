import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Tag, Popconfirm, Space, Alert, message, Tooltip, } from 'antd';
import { PlusOutlined, DeleteOutlined, CopyOutlined, KeyOutlined, WarningOutlined, } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../../hooks/redux';
import { fetchTokens, createToken, deleteToken, clearError, clearSuccessMessage, clearNewlyCreatedToken, } from '../../../store/settingsSlice';
const TokenManagement = () => {
    const [form] = Form.useForm();
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [tokenDisplayModal, setTokenDisplayModal] = useState(false);
    const dispatch = useAppDispatch();
    const { tokens, tokensLoading, tokenActionLoading, newlyCreatedToken, successMessage, error, } = useAppSelector((state) => state.settings);
    useEffect(() => {
        dispatch(fetchTokens());
    }, [dispatch]);
    useEffect(() => {
        if (newlyCreatedToken) {
            setCreateModalVisible(false);
            setTokenDisplayModal(true);
            form.resetFields();
        }
    }, [newlyCreatedToken, form]);
    const handleCreateToken = (values) => {
        dispatch(createToken(values));
    };
    const handleDeleteToken = (id) => {
        dispatch(deleteToken(id));
    };
    const handleCopyToken = (token) => {
        navigator.clipboard.writeText(token).then(() => {
            message.success('Token 已复制到剪贴板');
        });
    };
    const columns = [
        {
            title: 'Token 名称',
            dataIndex: 'name',
            key: 'name',
            render: (name) => (_jsxs(Space, { children: [_jsx(KeyOutlined, { className: "text-gray-400" }), _jsx("span", { className: "font-medium", children: name })] })),
        },
        {
            title: 'Token 值',
            dataIndex: 'maskedToken',
            key: 'maskedToken',
            render: (maskedToken) => (_jsx("code", { className: "text-sm bg-gray-100 px-2 py-1 rounded", children: maskedToken })),
        },
        {
            title: '过期时间',
            dataIndex: 'expiresAt',
            key: 'expiresAt',
            render: (expiresAt) => {
                if (!expiresAt) {
                    return _jsx(Tag, { color: "green", children: "\u6C38\u4E0D\u8FC7\u671F" });
                }
                const expDate = new Date(expiresAt);
                const isExpired = expDate < new Date();
                const isExpiringSoon = !isExpired &&
                    expDate.getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000;
                if (isExpired) {
                    return _jsx(Tag, { color: "red", children: "\u5DF2\u8FC7\u671F" });
                }
                if (isExpiringSoon) {
                    return (_jsx(Tooltip, { title: expDate.toLocaleString('zh-CN'), children: _jsx(Tag, { color: "orange", icon: _jsx(WarningOutlined, {}), children: "\u5373\u5C06\u8FC7\u671F" }) }));
                }
                return (_jsx("span", { className: "text-gray-500 text-sm", children: expDate.toLocaleDateString('zh-CN') }));
            },
        },
        {
            title: '最后使用',
            dataIndex: 'lastUsedAt',
            key: 'lastUsedAt',
            render: (lastUsedAt) => lastUsedAt ? (_jsx("span", { className: "text-gray-500 text-sm", children: new Date(lastUsedAt).toLocaleString('zh-CN') })) : (_jsx("span", { className: "text-gray-400", children: "\u4ECE\u672A\u4F7F\u7528" })),
        },
        {
            title: '创建时间',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (createdAt) => (_jsx("span", { className: "text-gray-500 text-sm", children: new Date(createdAt).toLocaleDateString('zh-CN') })),
        },
        {
            title: '操作',
            key: 'action',
            render: (_, record) => (_jsx(Popconfirm, { title: "\u786E\u5B9A\u8981\u5220\u9664\u8BE5 Token \u5417\uFF1F", description: "\u5220\u9664\u540E\u5C06\u65E0\u6CD5\u6062\u590D\uFF0C\u8BF7\u786E\u8BA4", onConfirm: () => handleDeleteToken(record.id), okText: "\u5220\u9664", cancelText: "\u53D6\u6D88", okType: "danger", children: _jsx(Button, { type: "text", danger: true, icon: _jsx(DeleteOutlined, {}), loading: tokenActionLoading, children: "\u5220\u9664" }) })),
        },
    ];
    return (_jsxs("div", { children: [successMessage && (_jsx(Alert, { message: successMessage, type: "success", showIcon: true, closable: true, className: "mb-4", onClose: () => dispatch(clearSuccessMessage()) })), error && (_jsx(Alert, { message: error, type: "error", showIcon: true, closable: true, className: "mb-4", onClose: () => dispatch(clearError()) })), _jsxs("div", { className: "flex justify-between items-center mb-4", children: [_jsxs("div", { className: "text-gray-600", children: ["\u5171 ", tokens.length, " \u4E2A Token"] }), _jsx(Button, { type: "primary", icon: _jsx(PlusOutlined, {}), onClick: () => setCreateModalVisible(true), children: "\u521B\u5EFA Token" })] }), _jsx(Table, { columns: columns, dataSource: tokens, rowKey: "id", loading: tokensLoading, pagination: false }), _jsx(Modal, { title: "\u521B\u5EFA API Token", open: createModalVisible, onCancel: () => {
                    setCreateModalVisible(false);
                    form.resetFields();
                }, onOk: () => form.submit(), confirmLoading: tokenActionLoading, okText: "\u521B\u5EFA", cancelText: "\u53D6\u6D88", children: _jsxs(Form, { form: form, layout: "vertical", onFinish: handleCreateToken, children: [_jsx(Form.Item, { name: "name", label: "Token \u540D\u79F0", rules: [{ required: true, message: '请输入 Token 名称' }], children: _jsx(Input, { placeholder: "\u4F8B\u5982\uFF1A\u751F\u4EA7\u73AF\u5883 Token", maxLength: 50 }) }), _jsx(Form.Item, { name: "expiresIn", label: "\u8FC7\u671F\u65F6\u95F4\uFF08\u5929\uFF09", children: _jsx(InputNumber, { placeholder: "\u7559\u7A7A\u8868\u793A\u6C38\u4E0D\u8FC7\u671F", min: 1, max: 365, style: { width: '100%' } }) })] }) }), _jsxs(Modal, { title: _jsxs(Space, { children: [_jsx(KeyOutlined, {}), _jsx("span", { children: "Token \u521B\u5EFA\u6210\u529F" })] }), open: tokenDisplayModal, onCancel: () => {
                    setTokenDisplayModal(false);
                    dispatch(clearNewlyCreatedToken());
                }, footer: [
                    _jsx(Button, { type: "primary", icon: _jsx(CopyOutlined, {}), onClick: () => newlyCreatedToken && handleCopyToken(newlyCreatedToken), children: "\u590D\u5236 Token" }, "copy"),
                    _jsx(Button, { onClick: () => {
                            setTokenDisplayModal(false);
                            dispatch(clearNewlyCreatedToken());
                        }, children: "\u5173\u95ED" }, "close"),
                ], children: [_jsx(Alert, { message: "\u8BF7\u7ACB\u5373\u590D\u5236\u4FDD\u5B58\uFF01\u6B64 Token \u4EC5\u5C55\u793A\u4E00\u6B21\uFF0C\u5173\u95ED\u540E\u5C06\u65E0\u6CD5\u518D\u6B21\u67E5\u770B", type: "warning", showIcon: true, className: "mb-4" }), newlyCreatedToken && (_jsx("div", { className: "bg-gray-50 border rounded p-4 font-mono text-sm break-all", children: newlyCreatedToken }))] })] }));
};
export default TokenManagement;
