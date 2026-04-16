import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Card, Form, Select, Input, Button, Space, Radio, Tooltip, } from 'antd';
import { SendOutlined, ClearOutlined, RobotOutlined, FileTextOutlined, } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../../hooks/redux';
import { fetchApplications } from '../../../store/aiApplicationSlice';
import { fetchPrompts } from '../../../store/promptSlice';
const { TextArea } = Input;
const { Option } = Select;
const PlaygroundConfig = ({ onSubmit, onClear, loading, }) => {
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();
    const [promptType, setPromptType] = useState('select');
    const [selectedApp, setSelectedApp] = useState();
    const { applications } = useAppSelector((state) => state.aiApplication);
    const { prompts } = useAppSelector((state) => state.prompt);
    useEffect(() => {
        dispatch(fetchApplications({ page: 1, pageSize: 100 }));
        dispatch(fetchPrompts({ page: 1, pageSize: 100 }));
    }, [dispatch]);
    const handleAppChange = (value) => {
        setSelectedApp(value);
        form.setFieldValue('appVersion', undefined);
    };
    const selectedAppData = applications.find((app) => app.id === selectedApp);
    const handleSubmit = () => {
        form.validateFields().then((values) => {
            onSubmit(values);
        });
    };
    return (_jsx(Card, { title: "\u914D\u7F6E", className: "h-full", children: _jsxs(Form, { form: form, layout: "vertical", initialValues: {
                promptType: 'select',
            }, children: [_jsx(Form.Item, { name: "appId", label: "AI \u5E94\u7528", rules: [{ required: true, message: '请选择 AI 应用' }], children: _jsx(Select, { placeholder: "\u9009\u62E9 AI \u5E94\u7528", onChange: handleAppChange, showSearch: true, optionFilterProp: "children", children: applications.map((app) => (_jsx(Option, { value: app.id, children: _jsxs(Space, { children: [_jsx(RobotOutlined, {}), app.name] }) }, app.id))) }) }), _jsx(Form.Item, { name: "appVersion", label: "\u7248\u672C", rules: [{ required: true, message: '请选择版本' }], children: _jsxs(Select, { placeholder: "\u9009\u62E9\u7248\u672C", disabled: !selectedApp, children: [selectedAppData?.versions?.map((version) => (_jsx(Option, { value: version.version, children: version.version }, version.id))), !selectedAppData?.versions?.length && (_jsx(Option, { value: "latest", children: "\u6700\u65B0\u7248\u672C" }))] }) }), _jsx(Form.Item, { name: "promptType", label: "Prompt", children: _jsxs(Radio.Group, { value: promptType, onChange: (e) => setPromptType(e.target.value), children: [_jsx(Radio.Button, { value: "select", children: "\u9009\u62E9\u5DF2\u6709" }), _jsx(Radio.Button, { value: "custom", children: "\u81EA\u5B9A\u4E49" })] }) }), promptType === 'select' ? (_jsx(Form.Item, { name: "promptId", rules: [{ required: true, message: '请选择 Prompt' }], children: _jsx(Select, { placeholder: "\u9009\u62E9 Prompt", showSearch: true, optionFilterProp: "children", children: prompts.map((prompt) => (_jsx(Option, { value: prompt.id, children: _jsxs(Space, { children: [_jsx(FileTextOutlined, {}), prompt.name] }) }, prompt.id))) }) })) : (_jsx(Form.Item, { name: "promptContent", rules: [{ required: true, message: '请输入 Prompt 内容' }], children: _jsx(TextArea, { placeholder: "\u8F93\u5165\u81EA\u5B9A\u4E49 Prompt \u5185\u5BB9...", rows: 4, showCount: true, maxLength: 4000 }) })), _jsx(Form.Item, { name: "input", label: "\u8F93\u5165\u5185\u5BB9", rules: [{ required: true, message: '请输入内容' }], children: _jsx(TextArea, { placeholder: "\u8F93\u5165\u60A8\u7684\u95EE\u9898\u6216\u5185\u5BB9...", rows: 8, showCount: true, maxLength: 8000 }) }), _jsx(Form.Item, { children: _jsxs(Space, { className: "w-full justify-end", children: [_jsx(Tooltip, { title: "\u6E05\u7A7A", children: _jsx(Button, { icon: _jsx(ClearOutlined, {}), onClick: onClear, disabled: loading, children: "\u6E05\u7A7A" }) }), _jsx(Button, { type: "primary", icon: _jsx(SendOutlined, {}), onClick: handleSubmit, loading: loading, children: "\u53D1\u9001" })] }) })] }) }));
};
export default PlaygroundConfig;
