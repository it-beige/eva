import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { Modal, Form, Input } from 'antd';
const { TextArea } = Input;
const CreateAppModal = ({ visible, onCancel, onSubmit, editingApp, projectId, loading, }) => {
    const [form] = Form.useForm();
    const isEdit = !!editingApp;
    useEffect(() => {
        if (visible) {
            if (editingApp) {
                form.setFieldsValue({
                    name: editingApp.name,
                    description: editingApp.description || '',
                    icon: editingApp.icon || '',
                    gitRepoUrl: editingApp.gitRepoUrl || '',
                });
            }
            else {
                form.resetFields();
            }
        }
    }, [visible, editingApp, form]);
    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const submitData = {
                ...values,
                projectId,
            };
            onSubmit(submitData);
        }
        catch (error) {
            // 表单验证失败
        }
    };
    const handleCancel = () => {
        form.resetFields();
        onCancel();
    };
    return (_jsx(Modal, { title: isEdit ? '编辑AI应用' : '新增AI应用', open: visible, onOk: handleSubmit, onCancel: handleCancel, confirmLoading: loading, okText: isEdit ? '保存' : '创建', cancelText: "\u53D6\u6D88", width: 560, children: _jsxs(Form, { form: form, layout: "vertical", style: { marginTop: 16 }, children: [_jsx(Form.Item, { name: "name", label: "\u5E94\u7528\u540D\u79F0", rules: [
                        { required: true, message: '请输入应用名称' },
                        { max: 255, message: '应用名称不能超过255个字符' },
                    ], children: _jsx(Input, { placeholder: "\u8BF7\u8F93\u5165\u5E94\u7528\u540D\u79F0" }) }), _jsx(Form.Item, { name: "description", label: "\u5E94\u7528\u63CF\u8FF0", rules: [{ max: 2000, message: '应用描述不能超过2000个字符' }], children: _jsx(TextArea, { rows: 4, placeholder: "\u8BF7\u8F93\u5165\u5E94\u7528\u63CF\u8FF0", showCount: true, maxLength: 2000 }) }), _jsx(Form.Item, { name: "icon", label: "\u56FE\u6807URL", rules: [{ max: 500, message: '图标URL不能超过500个字符' }], children: _jsx(Input, { placeholder: "\u8BF7\u8F93\u5165\u56FE\u6807URL\uFF08\u53EF\u9009\uFF09" }) }), _jsx(Form.Item, { name: "gitRepoUrl", label: "Git\u4ED3\u5E93\u5730\u5740", rules: [{ max: 500, message: 'Git仓库地址不能超过500个字符' }], children: _jsx(Input, { placeholder: "\u8BF7\u8F93\u5165Git\u4ED3\u5E93\u5730\u5740\uFF08\u53EF\u9009\uFF09" }) })] }) }));
};
export default CreateAppModal;
