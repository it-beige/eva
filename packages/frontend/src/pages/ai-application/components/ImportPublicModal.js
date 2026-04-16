import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Modal, Form, Input, Select } from 'antd';
const { Option } = Select;
// 预定义的公共 Code Agent 列表
const PUBLIC_AGENTS = [
    {
        name: 'SWE-Agent',
        gitRepoUrl: 'https://github.com/princeton-nlp/SWE-agent',
        description: 'SWE-agent 接入',
    },
    {
        name: 'OpenHands',
        gitRepoUrl: 'https://github.com/All-Hands-AI/OpenHands',
        description: 'All Hands AI 开源 Agent',
    },
    {
        name: 'Devin',
        gitRepoUrl: 'https://github.com/AI-Engineer-Foundation/devin',
        description: 'AI 软件工程师 Agent',
    },
    {
        name: 'AutoCodeRover',
        gitRepoUrl: 'https://github.com/nus-apr/auto-code-rover',
        description: '自动代码修复 Agent',
    },
    {
        name: 'CodeAct',
        gitRepoUrl: 'https://github.com/xingyaoww/code-act',
        description: 'CodeAct Agent',
    },
    {
        name: 'AgentCoder',
        gitRepoUrl: 'https://github.com/huangd1999/AgentCoder',
        description: '代码生成 Agent',
    },
];
const ImportPublicModal = ({ visible, onCancel, onSubmit, projectId, loading, }) => {
    const [form] = Form.useForm();
    const handleAgentChange = (value) => {
        const agent = PUBLIC_AGENTS.find((a) => a.name === value);
        if (agent) {
            form.setFieldsValue({
                name: agent.name,
                gitRepoUrl: agent.gitRepoUrl,
            });
        }
    };
    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const submitData = {
                name: values.name,
                gitRepoUrl: values.gitRepoUrl,
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
    return (_jsx(Modal, { title: "\u5F15\u7528\u516C\u5171Code Agent", open: visible, onOk: handleSubmit, onCancel: handleCancel, confirmLoading: loading, okText: "\u5F15\u7528", cancelText: "\u53D6\u6D88", width: 560, children: _jsxs(Form, { form: form, layout: "vertical", style: { marginTop: 16 }, children: [_jsx(Form.Item, { label: "\u9009\u62E9\u516C\u5171Agent", children: _jsx(Select, { placeholder: "\u8BF7\u9009\u62E9\u8981\u5F15\u7528\u7684\u516C\u5171Agent", onChange: handleAgentChange, allowClear: true, children: PUBLIC_AGENTS.map((agent) => (_jsx(Option, { value: agent.name, children: _jsxs("div", { children: [_jsx("div", { style: { fontWeight: 500 }, children: agent.name }), _jsx("div", { style: { fontSize: 12, color: '#999' }, children: agent.description })] }) }, agent.name))) }) }), _jsx(Form.Item, { name: "name", label: "\u5E94\u7528\u540D\u79F0", rules: [
                        { required: true, message: '请输入应用名称' },
                        { max: 255, message: '应用名称不能超过255个字符' },
                    ], children: _jsx(Input, { placeholder: "\u8BF7\u8F93\u5165\u5E94\u7528\u540D\u79F0" }) }), _jsx(Form.Item, { name: "gitRepoUrl", label: "Git\u4ED3\u5E93\u5730\u5740", rules: [
                        { required: true, message: '请输入Git仓库地址' },
                        { max: 500, message: 'Git仓库地址不能超过500个字符' },
                    ], children: _jsx(Input, { placeholder: "\u8BF7\u8F93\u5165Git\u4ED3\u5E93\u5730\u5740" }) })] }) }));
};
export default ImportPublicModal;
