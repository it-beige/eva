import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { Modal, Form, Input, Collapse, message, } from 'antd';
import { LinkOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../../hooks/useRedux';
import { createPrompt, updatePrompt } from '../../../store/promptSlice';
import styles from '../Prompt.module.css';
const { TextArea } = Input;
const { Panel } = Collapse;
const CreatePromptModal = ({ open, onCancel, onSuccess, initialValues, }) => {
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();
    const { loading } = useAppSelector((state) => state.prompt);
    const isEditing = !!initialValues;
    useEffect(() => {
        if (open) {
            if (initialValues) {
                form.setFieldsValue({
                    name: initialValues.name,
                    content: initialValues.content,
                    description: initialValues.description,
                    metadata: initialValues.metadata
                        ? JSON.stringify(initialValues.metadata, null, 2)
                        : '',
                });
            }
            else {
                form.resetFields();
            }
        }
    }, [open, initialValues, form]);
    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const data = {
                ...values,
                metadata: values.metadata
                    ? JSON.parse(values.metadata)
                    : undefined,
            };
            if (isEditing) {
                await dispatch(updatePrompt({
                    id: initialValues.id,
                    data: {
                        content: data.content,
                        metadata: data.metadata,
                        description: data.description,
                    },
                })).unwrap();
                message.success('更新成功');
            }
            else {
                await dispatch(createPrompt(data)).unwrap();
                message.success('创建成功');
            }
            onSuccess();
        }
        catch (error) {
            if (error.message) {
                message.error(error.message);
            }
            else if (error.name === 'SyntaxError') {
                message.error('元数据 JSON 格式错误');
            }
        }
    };
    return (_jsxs(Modal, { title: isEditing ? '编辑Prompt' : '新建Prompt', open: open, onCancel: onCancel, onOk: handleSubmit, confirmLoading: loading, width: 640, okText: isEditing ? '保存' : '确认', cancelText: "\u53D6\u6D88", children: [_jsxs("div", { className: styles.modalDescription, children: ["\u7F16\u5199Prompt\uFF0C\u5305\u62EC\u57FA\u672C\u5185\u5BB9\u3001\u52A8\u6001\u5360\u4F4D\u7B26\u3001\u683C\u5F0F\u7B49\u4FE1\u606F\u3002", _jsxs("a", { href: "#", className: styles.helpLink, children: [_jsx(LinkOutlined, {}), " \u5E2E\u52A9\u6587\u6863"] })] }), _jsxs(Form, { form: form, layout: "vertical", autoComplete: "off", children: [!isEditing && (_jsx(Form.Item, { name: "name", label: "\u540D\u79F0", rules: [{ required: true, message: '请输入Prompt名称' }], children: _jsx(Input, { placeholder: "Prompt\u540D\u79F0" }) })), _jsx(Form.Item, { name: "content", label: "Prompt", rules: [{ required: true, message: '请输入Prompt内容' }], children: _jsx(TextArea, { placeholder: "Prompt", rows: 8, showCount: true, maxLength: 10000 }) }), _jsxs("div", { className: styles.promptHint, children: ["\u4F7F\u7528 mustache \u8BED\u6CD5\u5728Prompt\u4E2D\u5F15\u7528\u8BC4\u6D4B\u96C6\u53D8\u91CF\u3002\u793A\u4F8B\uFF1A", '{{question}}', "\u3002"] }), _jsx(Collapse, { ghost: true, style: { marginTop: 16 }, className: styles.collapsePanel, children: _jsx(Panel, { header: "\u5143\u6570\u636E", children: _jsx(Form.Item, { name: "metadata", children: _jsx(TextArea, { placeholder: '{"key": "value"}', rows: 4 }) }) }, "metadata") }), _jsx(Collapse, { ghost: true, className: styles.collapsePanel, children: _jsx(Panel, { header: "\u63CF\u8FF0", children: _jsx(Form.Item, { name: "description", children: _jsx(TextArea, { placeholder: "\u8BF7\u8F93\u5165\u63CF\u8FF0", rows: 3 }) }) }, "description") })] })] }));
};
export default CreatePromptModal;
