import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Modal, Form, Input, Tag, Space } from 'antd';
const suggestedTags = [
    '测试',
    '生产',
    '开发中',
    '已归档',
    '重要',
    '内部使用',
    '公开',
    '待审核',
];
export const AddTagModal = ({ open, onCancel, onSubmit, existingTags = [], loading = false, }) => {
    const [form] = Form.useForm();
    const [inputValue, setInputValue] = useState('');
    useEffect(() => {
        if (open) {
            form.resetFields();
            setInputValue('');
        }
    }, [open, form]);
    const handleSubmit = async () => {
        try {
            await form.validateFields();
            const values = form.getFieldsValue();
            if (values.tagName) {
                onSubmit(values.tagName);
            }
        }
        catch (error) {
            console.error('表单验证失败:', error);
        }
    };
    const handleSuggestedTagClick = (tag) => {
        form.setFieldsValue({ tagName: tag });
        setInputValue(tag);
    };
    const availableSuggestedTags = suggestedTags.filter((tag) => !existingTags.includes(tag));
    return (_jsx(Modal, { title: "\u6DFB\u52A0\u6807\u7B7E", open: open, onCancel: onCancel, onOk: handleSubmit, confirmLoading: loading, destroyOnClose: true, children: _jsxs(Form, { form: form, layout: "vertical", children: [_jsx(Form.Item, { label: "\u6807\u7B7E\u540D\u79F0", name: "tagName", rules: [
                        { required: true, message: '请输入标签名称' },
                        {
                            validator: (_, value) => {
                                if (existingTags.includes(value)) {
                                    return Promise.reject(new Error('该标签已存在'));
                                }
                                return Promise.resolve();
                            },
                        },
                    ], children: _jsx(Input, { placeholder: "\u8BF7\u8F93\u5165\u6807\u7B7E\u540D\u79F0", value: inputValue, onChange: (e) => setInputValue(e.target.value) }) }), availableSuggestedTags.length > 0 && (_jsx(Form.Item, { label: "\u63A8\u8350\u6807\u7B7E", children: _jsx(Space, { size: [8, 8], wrap: true, children: availableSuggestedTags.map((tag) => (_jsx(Tag, { style: { cursor: 'pointer' }, onClick: () => handleSuggestedTagClick(tag), children: tag }, tag))) }) }))] }) }));
};
export default AddTagModal;
