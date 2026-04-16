import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { Form, Input, Button, Card, Alert } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../../hooks/redux';
import { fetchProjectSettings, updateProjectSettings, clearSuccessMessage, clearError, } from '../../../store/settingsSlice';
const { TextArea } = Input;
const ProjectSettings = () => {
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();
    const { project, projectLoading, projectSaving, successMessage, error } = useAppSelector((state) => state.settings);
    useEffect(() => {
        dispatch(fetchProjectSettings());
    }, [dispatch]);
    useEffect(() => {
        if (project) {
            form.setFieldsValue({
                name: project.name,
                description: project.description,
            });
        }
    }, [project, form]);
    const handleSubmit = (values) => {
        dispatch(updateProjectSettings(values));
    };
    return (_jsxs(Card, { title: "\u9879\u76EE\u8BBE\u7F6E", loading: projectLoading, children: [successMessage && (_jsx(Alert, { message: successMessage, type: "success", showIcon: true, closable: true, className: "mb-4", onClose: () => dispatch(clearSuccessMessage()) })), error && (_jsx(Alert, { message: error, type: "error", showIcon: true, closable: true, className: "mb-4", onClose: () => dispatch(clearError()) })), _jsxs(Form, { form: form, layout: "vertical", onFinish: handleSubmit, style: { maxWidth: 600 }, children: [_jsx(Form.Item, { name: "name", label: "\u9879\u76EE\u540D\u79F0", rules: [{ required: true, message: '请输入项目名称' }], children: _jsx(Input, { placeholder: "\u8BF7\u8F93\u5165\u9879\u76EE\u540D\u79F0", maxLength: 100, showCount: true }) }), _jsx(Form.Item, { name: "description", label: "\u9879\u76EE\u63CF\u8FF0", children: _jsx(TextArea, { placeholder: "\u8BF7\u8F93\u5165\u9879\u76EE\u63CF\u8FF0", rows: 4, maxLength: 500, showCount: true }) }), project && (_jsxs("div", { className: "mb-4 text-gray-400 text-sm", children: [_jsxs("p", { children: ["\u521B\u5EFA\u65F6\u95F4: ", new Date(project.createdAt).toLocaleString('zh-CN')] }), _jsxs("p", { children: ["\u6700\u540E\u66F4\u65B0: ", new Date(project.updatedAt).toLocaleString('zh-CN')] })] })), _jsx(Form.Item, { children: _jsx(Button, { type: "primary", htmlType: "submit", icon: _jsx(SaveOutlined, {}), loading: projectSaving, children: "\u4FDD\u5B58\u8BBE\u7F6E" }) })] })] }));
};
export default ProjectSettings;
