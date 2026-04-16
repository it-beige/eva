import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, Tag, Avatar, Popconfirm, Space, Alert, } from 'antd';
import { PlusOutlined, DeleteOutlined, UserOutlined, CrownOutlined, } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../../hooks/redux';
import { fetchMembers, addMember, removeMember, clearError, clearSuccessMessage, } from '../../../store/settingsSlice';
const { Option } = Select;
const ROLE_CONFIG = {
    owner: { label: '所有者', color: 'gold', icon: _jsx(CrownOutlined, {}) },
    admin: { label: '管理员', color: 'blue', icon: _jsx(UserOutlined, {}) },
    member: { label: '成员', color: 'default', icon: _jsx(UserOutlined, {}) },
};
const MemberManagement = () => {
    const [form] = Form.useForm();
    const [modalVisible, setModalVisible] = useState(false);
    const dispatch = useAppDispatch();
    const { members, membersLoading, memberActionLoading, successMessage, error } = useAppSelector((state) => state.settings);
    useEffect(() => {
        dispatch(fetchMembers());
    }, [dispatch]);
    const handleAddMember = (values) => {
        dispatch(addMember(values)).then((action) => {
            if (addMember.fulfilled.match(action)) {
                setModalVisible(false);
                form.resetFields();
            }
        });
    };
    const handleRemoveMember = (id) => {
        dispatch(removeMember(id));
    };
    const columns = [
        {
            title: '成员',
            key: 'member',
            render: (_, record) => (_jsxs(Space, { children: [_jsx(Avatar, { style: { backgroundColor: '#1890ff' }, icon: _jsx(UserOutlined, {}), children: record.name[0] }), _jsxs("div", { children: [_jsx("div", { className: "font-medium", children: record.name }), _jsx("div", { className: "text-xs text-gray-400", children: record.email })] })] })),
        },
        {
            title: '角色',
            dataIndex: 'role',
            key: 'role',
            render: (role) => {
                const config = ROLE_CONFIG[role] || ROLE_CONFIG.member;
                return (_jsx(Tag, { color: config.color, icon: config.icon, children: config.label }));
            },
        },
        {
            title: '加入时间',
            dataIndex: 'joinedAt',
            key: 'joinedAt',
            render: (time) => new Date(time).toLocaleDateString('zh-CN'),
        },
        {
            title: '操作',
            key: 'action',
            render: (_, record) => {
                if (record.role === 'owner')
                    return null;
                return (_jsx(Popconfirm, { title: "\u786E\u5B9A\u8981\u79FB\u9664\u8BE5\u6210\u5458\u5417\uFF1F", onConfirm: () => handleRemoveMember(record.id), okText: "\u786E\u5B9A", cancelText: "\u53D6\u6D88", children: _jsx(Button, { type: "text", danger: true, icon: _jsx(DeleteOutlined, {}), loading: memberActionLoading, children: "\u79FB\u9664" }) }));
            },
        },
    ];
    return (_jsxs("div", { children: [successMessage && (_jsx(Alert, { message: successMessage, type: "success", showIcon: true, closable: true, className: "mb-4", onClose: () => dispatch(clearSuccessMessage()) })), error && (_jsx(Alert, { message: error, type: "error", showIcon: true, closable: true, className: "mb-4", onClose: () => dispatch(clearError()) })), _jsxs("div", { className: "flex justify-between items-center mb-4", children: [_jsxs("div", { className: "text-gray-600", children: ["\u5171 ", members.length, " \u4F4D\u6210\u5458"] }), _jsx(Button, { type: "primary", icon: _jsx(PlusOutlined, {}), onClick: () => setModalVisible(true), children: "\u6DFB\u52A0\u6210\u5458" })] }), _jsx(Table, { columns: columns, dataSource: members, rowKey: "id", loading: membersLoading, pagination: false }), _jsx(Modal, { title: "\u6DFB\u52A0\u6210\u5458", open: modalVisible, onCancel: () => {
                    setModalVisible(false);
                    form.resetFields();
                }, onOk: () => form.submit(), confirmLoading: memberActionLoading, okText: "\u6DFB\u52A0", cancelText: "\u53D6\u6D88", children: _jsxs(Form, { form: form, layout: "vertical", onFinish: handleAddMember, children: [_jsx(Form.Item, { name: "email", label: "\u90AE\u7BB1\u5730\u5740", rules: [
                                { required: true, message: '请输入邮箱地址' },
                                { type: 'email', message: '请输入正确的邮箱格式' },
                            ], children: _jsx(Input, { placeholder: "\u8BF7\u8F93\u5165\u90AE\u7BB1\u5730\u5740" }) }), _jsx(Form.Item, { name: "role", label: "\u89D2\u8272", rules: [{ required: true, message: '请选择角色' }], initialValue: "member", children: _jsxs(Select, { children: [_jsx(Option, { value: "admin", children: "\u7BA1\u7406\u5458" }), _jsx(Option, { value: "member", children: "\u6210\u5458" })] }) })] }) })] }));
};
export default MemberManagement;
