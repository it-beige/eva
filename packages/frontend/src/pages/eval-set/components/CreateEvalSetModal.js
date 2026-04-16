import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Upload, Radio, Card, Button, Space, Typography, message, InputNumber, Row, Col, } from 'antd';
import { UploadOutlined, DatabaseOutlined, CloudUploadOutlined, CodeOutlined, RobotOutlined, FileOutlined, ApiOutlined, GlobalOutlined, } from '@ant-design/icons';
import { EvalSetType, EvalSetSourceType } from '@eva/shared';
const { TextArea } = Input;
const { Text } = Typography;
const { Option } = Select;
const sourceTypeOptions = [
    {
        key: EvalSetSourceType.LOCAL_UPLOAD,
        label: '本地上传',
        icon: _jsx(UploadOutlined, {}),
        description: '上传CSV文件',
    },
    {
        key: EvalSetSourceType.ODPS,
        label: 'ODPS上传',
        icon: _jsx(DatabaseOutlined, {}),
        description: '从ODPS表导入',
    },
    {
        key: EvalSetSourceType.SDK,
        label: 'SDK动态接入',
        icon: _jsx(ApiOutlined, {}),
        description: '通过SDK接入',
    },
    {
        key: EvalSetSourceType.AI_GENERATE,
        label: 'AI智能生成',
        icon: _jsx(RobotOutlined, {}),
        description: 'AI自动生成数据',
    },
    {
        key: EvalSetSourceType.BLANK,
        label: '空白评测集',
        icon: _jsx(FileOutlined, {}),
        description: '创建空白评测集',
    },
    {
        key: EvalSetSourceType.ONLINE_EXTRACT,
        label: '线上数据提取',
        icon: _jsx(CloudUploadOutlined, {}),
        description: '从线上提取',
    },
];
const codeSourceOptions = [
    {
        key: 'public_reference',
        label: '引用公共评测集',
        icon: _jsx(GlobalOutlined, {}),
    },
    {
        key: 'custom',
        label: '自定义评测集',
        icon: _jsx(CodeOutlined, {}),
    },
];
const mockPublicEvalSets = [
    { id: '1', name: 'HumanEval' },
    { id: '2', name: 'MBPP' },
    { id: '3', name: 'CodeContests' },
];
const mockModels = [
    { id: 'gpt-4', name: 'GPT-4' },
    { id: 'gpt-3.5', name: 'GPT-3.5' },
    { id: 'claude-3', name: 'Claude 3' },
];
export const CreateEvalSetModal = ({ open, onCancel, onSubmit, loading = false, }) => {
    const [form] = Form.useForm();
    const [evalSetType, setEvalSetType] = useState(EvalSetType.TEXT);
    const [sourceType, setSourceType] = useState(EvalSetSourceType.LOCAL_UPLOAD);
    const [codeSourceType, setCodeSourceType] = useState('public_reference');
    // 当类型切换时重置表单
    useEffect(() => {
        if (open) {
            form.resetFields();
            setEvalSetType(EvalSetType.TEXT);
            setSourceType(EvalSetSourceType.LOCAL_UPLOAD);
            setCodeSourceType('public_reference');
        }
    }, [open, form]);
    const handleTypeChange = (type) => {
        setEvalSetType(type);
        form.setFieldsValue({ type });
        if (type === EvalSetType.CODE) {
            setSourceType('public_reference');
            form.setFieldsValue({ sourceType: 'public_reference' });
        }
        else {
            setSourceType(EvalSetSourceType.LOCAL_UPLOAD);
            form.setFieldsValue({ sourceType: EvalSetSourceType.LOCAL_UPLOAD });
        }
    };
    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            onSubmit(values);
        }
        catch (error) {
            console.error('表单验证失败:', error);
        }
    };
    const renderTextTypeForm = () => {
        if (evalSetType !== EvalSetType.TEXT)
            return null;
        return (_jsxs(_Fragment, { children: [_jsx(Form.Item, { label: "\u6570\u636E\u96C6\u521B\u5EFA\u65B9\u5F0F", required: true, style: { marginBottom: 16 }, children: _jsx("div", { style: { display: 'flex', gap: 12, flexWrap: 'wrap' }, children: sourceTypeOptions.map((option) => (_jsx(Card, { size: "small", style: {
                                width: 140,
                                cursor: 'pointer',
                                border: sourceType === option.key
                                    ? '2px solid #5B21B6'
                                    : '1px solid #d9d9d9',
                            }, onClick: () => {
                                setSourceType(option.key);
                                form.setFieldsValue({ sourceType: option.key });
                            }, children: _jsxs("div", { style: { textAlign: 'center' }, children: [_jsx("div", { style: { fontSize: 24, marginBottom: 8, color: '#5B21B6' }, children: option.icon }), _jsx("div", { style: { fontWeight: 500 }, children: option.label }), _jsx("div", { style: { fontSize: 12, color: '#999' }, children: option.description })] }) }, option.key))) }) }), sourceType === EvalSetSourceType.LOCAL_UPLOAD && (_jsxs(_Fragment, { children: [_jsx(Form.Item, { label: "\u8BC4\u6D4B\u96C6\u540D\u79F0", name: "name", rules: [{ required: true, message: '请输入评测集名称' }], children: _jsx(Input, { placeholder: "\u8BF7\u8F93\u5165\u8BC4\u6D4B\u96C6\u540D\u79F0" }) }), _jsx(Form.Item, { label: "\u8BC4\u6D4B\u96C6\u63CF\u8FF0", name: "description", children: _jsx(TextArea, { rows: 3, placeholder: "\u8BF7\u8F93\u5165\u8BC4\u6D4B\u96C6\u63CF\u8FF0" }) }), _jsx(Form.Item, { label: "\u4E0A\u4F20CSV\u6587\u4EF6", name: "fileUrl", rules: [{ required: true, message: '请上传CSV文件' }], children: _jsxs(Upload.Dragger, { name: "file", multiple: false, beforeUpload: () => false, onChange: (info) => {
                                    if (info.file.status === 'done') {
                                        message.success(`${info.file.name} 上传成功`);
                                        form.setFieldsValue({ fileUrl: info.file.name });
                                    }
                                }, children: [_jsx("p", { className: "ant-upload-drag-icon", children: _jsx(UploadOutlined, {}) }), _jsx("p", { className: "ant-upload-text", children: "\u70B9\u51FB\u6216\u62D6\u62FD\u6587\u4EF6\u5230\u6B64\u533A\u57DF\u4E0A\u4F20" }), _jsx("p", { className: "ant-upload-hint", children: "\u652F\u6301 CSV \u683C\u5F0F\u6587\u4EF6" })] }) })] })), sourceType === EvalSetSourceType.ODPS && (_jsxs(_Fragment, { children: [_jsx(Form.Item, { label: "\u8BC4\u6D4B\u96C6\u540D\u79F0", name: "name", rules: [{ required: true, message: '请输入评测集名称' }], children: _jsx(Input, { placeholder: "\u8BF7\u8F93\u5165\u8BC4\u6D4B\u96C6\u540D\u79F0" }) }), _jsx(Form.Item, { label: "ODPS\u8868\u540D", name: "odpsTableName", rules: [{ required: true, message: '请输入ODPS表名' }], children: _jsx(Input, { placeholder: "\u683C\u5F0F: project.table_name" }) }), _jsx(Form.Item, { label: "\u5206\u533A\u6761\u4EF6", name: "odpsPartition", children: _jsx(Input, { placeholder: "\u53EF\u9009\uFF0C\u5982: dt=20240101" }) }), _jsx(Text, { type: "secondary", style: { display: 'block', marginBottom: 16 }, children: "\u63D0\u793A\uFF1A\u5355\u6B21\u5BFC\u5165\u6570\u636E\u91CF\u5EFA\u8BAE\u4E0D\u8D85\u8FC72\u4E07\u6761" })] })), sourceType === EvalSetSourceType.AI_GENERATE && (_jsxs(_Fragment, { children: [_jsx(Form.Item, { label: "\u8BC4\u6D4B\u96C6\u540D\u79F0", name: "name", rules: [{ required: true, message: '请输入评测集名称' }], children: _jsx(Input, { placeholder: "\u8BF7\u8F93\u5165\u8BC4\u6D4B\u96C6\u540D\u79F0" }) }), _jsx(Form.Item, { label: "\u4E0A\u4F20\u793A\u4F8BCSV", name: "exampleFileUrl", rules: [{ required: true, message: '请上传示例CSV文件' }], children: _jsx(Upload, { beforeUpload: () => false, children: _jsx(Button, { icon: _jsx(UploadOutlined, {}), children: "\u9009\u62E9\u6587\u4EF6" }) }) }), _jsx(Form.Item, { label: "\u9009\u62E9\u6A21\u578B", name: "aiModelId", rules: [{ required: true, message: '请选择模型' }], children: _jsx(Select, { placeholder: "\u8BF7\u9009\u62E9\u6A21\u578B", children: mockModels.map((model) => (_jsx(Option, { value: model.id, children: model.name }, model.id))) }) }), _jsx(Form.Item, { label: "\u751F\u6210\u6570\u91CF", name: "aiGenerateCount", rules: [{ required: true, message: '请输入生成数量' }], initialValue: 10, children: _jsx(InputNumber, { min: 1, max: 100, style: { width: '100%' } }) })] })), sourceType === EvalSetSourceType.BLANK && (_jsxs(_Fragment, { children: [_jsx(Form.Item, { label: "\u8BC4\u6D4B\u96C6\u540D\u79F0", name: "name", rules: [{ required: true, message: '请输入评测集名称' }], children: _jsx(Input, { placeholder: "\u8BF7\u8F93\u5165\u8BC4\u6D4B\u96C6\u540D\u79F0" }) }), _jsx(Form.Item, { label: "\u8BC4\u6D4B\u96C6\u63CF\u8FF0", name: "description", children: _jsx(TextArea, { rows: 3, placeholder: "\u8BF7\u8F93\u5165\u8BC4\u6D4B\u96C6\u63CF\u8FF0" }) }), _jsx(Form.Item, { label: "\u5217\u7BA1\u7406", children: _jsx(Text, { type: "secondary", children: "\u9ED8\u8BA4\u5305\u542B Input \u548C Output \u5217\uFF0C\u53EF\u5728\u521B\u5EFA\u540E\u7BA1\u7406\u5217" }) })] })), (sourceType === EvalSetSourceType.SDK ||
                    sourceType === EvalSetSourceType.ONLINE_EXTRACT) && (_jsxs(_Fragment, { children: [_jsx(Form.Item, { label: "\u8BC4\u6D4B\u96C6\u540D\u79F0", name: "name", rules: [{ required: true, message: '请输入评测集名称' }], children: _jsx(Input, { placeholder: "\u8BF7\u8F93\u5165\u8BC4\u6D4B\u96C6\u540D\u79F0" }) }), _jsx(Form.Item, { label: "\u8BC4\u6D4B\u96C6\u63CF\u8FF0", name: "description", children: _jsx(TextArea, { rows: 3, placeholder: "\u8BF7\u8F93\u5165\u8BC4\u6D4B\u96C6\u63CF\u8FF0" }) }), _jsx(Text, { type: "secondary", children: "\u8BE5\u521B\u5EFA\u65B9\u5F0F\u9700\u8981\u989D\u5916\u914D\u7F6E\uFF0C\u8BF7\u8054\u7CFB\u7BA1\u7406\u5458" })] }))] }));
    };
    const renderCodeTypeForm = () => {
        if (evalSetType !== EvalSetType.CODE)
            return null;
        return (_jsxs(_Fragment, { children: [_jsx(Form.Item, { label: "\u521B\u5EFA\u65B9\u5F0F", required: true, style: { marginBottom: 16 }, children: _jsx(Radio.Group, { value: codeSourceType, onChange: (e) => {
                            setCodeSourceType(e.target.value);
                            form.setFieldsValue({ sourceType: e.target.value });
                        }, children: _jsx(Space, { direction: "vertical", children: codeSourceOptions.map((option) => (_jsx(Radio.Button, { value: option.key, style: {
                                    width: 400,
                                    height: 60,
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '0 16px',
                                }, children: _jsxs(Space, { children: [_jsx("span", { style: { fontSize: 20, color: '#5B21B6' }, children: option.icon }), _jsx("span", { children: option.label })] }) }, option.key))) }) }) }), codeSourceType === 'public_reference' && (_jsxs(_Fragment, { children: [_jsx(Form.Item, { label: "\u516C\u5171\u8BC4\u6D4B\u96C6", name: "publicEvalSetId", rules: [{ required: true, message: '请选择公共评测集' }], children: _jsx(Select, { placeholder: "\u8BF7\u9009\u62E9\u516C\u5171\u8BC4\u6D4B\u96C6", children: mockPublicEvalSets.map((set) => (_jsx(Option, { value: set.id, children: set.name }, set.id))) }) }), _jsx(Form.Item, { label: "\u8BC4\u6D4B\u96C6\u540D\u79F0", name: "name", rules: [
                                { required: true, message: '请输入评测集名称' },
                                {
                                    pattern: /^[a-zA-Z0-9_-]+$/,
                                    message: '只能包含字母、数字、下划线和连字符',
                                },
                            ], children: _jsx(Input, { placeholder: "\u53EA\u80FD\u5305\u542B\u5B57\u6BCD\u3001\u6570\u5B57\u3001\u4E0B\u5212\u7EBF\u548C\u8FDE\u5B57\u7B26" }) }), _jsx(Form.Item, { label: "\u8BC4\u6D4B\u96C6\u63CF\u8FF0", name: "description", children: _jsx(TextArea, { rows: 3, placeholder: "\u8BF7\u8F93\u5165\u8BC4\u6D4B\u96C6\u63CF\u8FF0" }) }), _jsx(Form.Item, { label: "\u4EE3\u7801\u4ED3\u5E93", name: "gitRepoUrl", rules: [{ required: true, message: '请输入代码仓库地址' }], children: _jsx(Input, { placeholder: "git@gitlab.alibaba-inc.com:xxx.git" }) })] })), codeSourceType === 'custom' && (_jsxs(_Fragment, { children: [_jsx(Form.Item, { label: "\u8BC4\u6D4B\u96C6\u540D\u79F0", name: "name", rules: [
                                { required: true, message: '请输入评测集名称' },
                                {
                                    pattern: /^[a-zA-Z0-9_-]+$/,
                                    message: '只能包含字母、数字、下划线和连字符',
                                },
                            ], children: _jsx(Input, { placeholder: "\u53EA\u80FD\u5305\u542B\u5B57\u6BCD\u3001\u6570\u5B57\u3001\u4E0B\u5212\u7EBF\u548C\u8FDE\u5B57\u7B26" }) }), _jsx(Form.Item, { label: "\u8BC4\u6D4B\u96C6\u63CF\u8FF0", name: "description", children: _jsx(TextArea, { rows: 3, placeholder: "\u8BF7\u8F93\u5165\u8BC4\u6D4B\u96C6\u63CF\u8FF0" }) }), _jsx(Form.Item, { label: "\u4EE3\u7801\u4ED3\u5E93", name: "gitRepoUrl", rules: [{ required: true, message: '请输入代码仓库地址' }], children: _jsx(Input, { placeholder: "git@gitlab.alibaba-inc.com:xxx.git" }) })] }))] }));
    };
    return (_jsx(Modal, { title: "\u65B0\u5EFA\u8BC4\u6D4B\u96C6", open: open, onCancel: onCancel, onOk: handleSubmit, confirmLoading: loading, width: 720, destroyOnClose: true, children: _jsxs(Form, { form: form, layout: "vertical", initialValues: {
                type: EvalSetType.TEXT,
                sourceType: EvalSetSourceType.LOCAL_UPLOAD,
            }, children: [_jsx(Form.Item, { label: "\u8BC4\u6D4B\u96C6\u7C7B\u578B", required: true, style: { marginBottom: 16 }, children: _jsxs(Row, { gutter: 16, children: [_jsx(Col, { span: 12, children: _jsx(Card, { size: "small", style: {
                                        cursor: 'pointer',
                                        border: evalSetType === EvalSetType.TEXT
                                            ? '2px solid #5B21B6'
                                            : '1px solid #d9d9d9',
                                        textAlign: 'center',
                                    }, onClick: () => handleTypeChange(EvalSetType.TEXT), children: _jsx("div", { style: { fontWeight: 500 }, children: "\u6587\u672C/\u591A\u6A21\u6001" }) }) }), _jsx(Col, { span: 12, children: _jsx(Card, { size: "small", style: {
                                        cursor: 'pointer',
                                        border: evalSetType === EvalSetType.CODE
                                            ? '2px solid #5B21B6'
                                            : '1px solid #d9d9d9',
                                        textAlign: 'center',
                                    }, onClick: () => handleTypeChange(EvalSetType.CODE), children: _jsx("div", { style: { fontWeight: 500 }, children: "Code" }) }) })] }) }), _jsx(Form.Item, { name: "type", hidden: true, children: _jsx(Input, {}) }), _jsx(Form.Item, { name: "sourceType", hidden: true, children: _jsx(Input, {}) }), renderTextTypeForm(), renderCodeTypeForm()] }) }));
};
export default CreateEvalSetModal;
