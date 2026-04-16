import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Form, Input, Typography } from 'antd';
const { TextArea } = Input;
const { Text } = Typography;
const LlmMetricForm = ({ form, initialValues, }) => {
    return (_jsxs(Form, { form: form, layout: "vertical", initialValues: initialValues, autoComplete: "off", children: [_jsx(Form.Item, { label: "\u6307\u6807\u540D\u79F0", name: "name", rules: [{ required: true, message: '请输入指标名称' }], children: _jsx(Input, { placeholder: "\u6307\u6807\u540D\u79F0" }) }), _jsx(Form.Item, { label: "\u6307\u6807\u63CF\u8FF0", name: "description", children: _jsx(TextArea, { rows: 3, placeholder: "\u63CF\u8FF0", showCount: true, maxLength: 500 }) }), _jsx(Form.Item, { label: "Prompt", name: "prompt", rules: [{ required: true, message: '请输入 Prompt' }], style: { marginBottom: 0 }, children: _jsxs("div", { style: { border: '1px solid #d9d9d9', borderRadius: 6 }, children: [_jsxs("div", { style: {
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '8px 12px',
                                borderBottom: '1px solid #f0f0f0',
                                backgroundColor: '#fafafa',
                                borderRadius: '6px 6px 0 0',
                            }, children: [_jsx(Text, { strong: true, style: { fontSize: 14 }, children: "System" }), _jsx("a", { href: "#", onClick: (e) => {
                                        e.preventDefault();
                                        // TODO: 打开模板选择弹窗
                                        console.log('选择模板');
                                    }, style: { fontSize: 14 }, children: "\u9009\u62E9\u6A21\u7248" })] }), _jsx(TextArea, { rows: 12, placeholder: "\u8F93\u5165\u8BC4\u4F30\u88C1\u5224\u7684\u5B9A\u4E49\u5185\u5BB9\u3002\u5EFA\u8BAE\u5305\u62EC\u89D2\u8272\u3001\u8BC4\u4F30\u7EF4\u5EA6\u3001\u8BC4\u5206\u6807\u51C6\u3001\u8BC4\u5206\u6E05\u5355\u3001\u8F93\u51FA\u683C\u5F0F\u3001\u53D8\u91CF\uFF08\u6309{{name}}\u7684\u5F62\u5F0F\u8F93\u5165\u53D8\u91CF\uFF09\u7B49\u4FE1\u606F", style: {
                                border: 'none',
                                borderRadius: '0 0 6px 6px',
                                resize: 'none',
                            }, value: form.getFieldValue('prompt'), onChange: (e) => form.setFieldsValue({ prompt: e.target.value }) })] }) })] }));
};
export default LlmMetricForm;
