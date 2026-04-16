import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Form, Input, Button, Typography, Space, message } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { useAppDispatch } from '../../../hooks/useRedux';
import { parseRepoMetrics } from '../../../store/evalMetricSlice';
const { Text } = Typography;
const CodeMetricForm = ({ form, initialValues, }) => {
    const dispatch = useAppDispatch();
    const [parsing, setParsing] = useState(false);
    const handleParseRepo = async () => {
        const codeRepoUrl = form.getFieldValue('codeRepoUrl');
        const codeBranch = form.getFieldValue('codeBranch') || 'master';
        if (!codeRepoUrl) {
            message.error('请先输入代码仓库地址');
            return;
        }
        setParsing(true);
        try {
            const result = await dispatch(parseRepoMetrics({ codeRepoUrl, codeBranch })).unwrap();
            message.success(result.message);
            // TODO: 处理解析出的指标列表
            console.log('解析出的指标:', result.metrics);
        }
        catch (error) {
            message.error(error.message || '解析仓库失败');
        }
        finally {
            setParsing(false);
        }
    };
    return (_jsxs(Form, { form: form, layout: "vertical", initialValues: {
            codeBranch: 'master',
            ...initialValues,
        }, autoComplete: "off", children: [_jsx(Form.Item, { label: _jsxs(Space, { children: [_jsx("span", { children: "\u4EE3\u7801\u4ED3\u5E93" }), _jsx(Text, { type: "secondary", style: { fontSize: 12 }, children: "\u9700\u6388\u6743\u7ED9Eva+\u516C\u5171\u8D26\u53F7\uFF1Aevaplus" })] }), name: "codeRepoUrl", rules: [{ required: true, message: '请输入代码仓库地址' }], children: _jsx(Input, { placeholder: "\u8BF7\u9009\u62E9\u6216\u8F93\u5165\u4EE3\u7801\u4ED3\u5E93" }) }), _jsx("div", { style: { marginBottom: 16 }, children: _jsxs(Space, { children: [_jsx("a", { href: "#", onClick: (e) => {
                                e.preventDefault();
                                // TODO: 打开创建仓库指引
                                console.log('帮我创建仓库');
                            }, children: "\u6CA1\u6709\u4EE3\u7801\u4ED3\u5E93? \u5E2E\u6211\u521B\u5EFA >" }), _jsx("a", { href: "#", onClick: (e) => {
                                e.preventDefault();
                                // TODO: 打开 EVA+ 规范文档
                                console.log('EVA+ 规范');
                            }, children: "EVA+ \u89C4\u8303" })] }) }), _jsx(Form.Item, { label: "\u4EE3\u7801\u5206\u652F", name: "codeBranch", rules: [{ required: true, message: '请输入代码分支' }], children: _jsx(Input, { placeholder: "master", addonAfter: _jsx(Button, { type: "link", size: "small", icon: _jsx(ReloadOutlined, {}), loading: parsing, onClick: handleParseRepo, style: { padding: 0, height: 'auto' }, children: "\u89E3\u6790\u4ED3\u5E93\u6307\u6807" }) }) })] }));
};
export default CodeMetricForm;
