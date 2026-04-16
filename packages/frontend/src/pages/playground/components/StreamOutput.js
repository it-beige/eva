import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useRef, useEffect } from 'react';
import { Card, Typography, Space, Tag, Spin } from 'antd';
import { ClockCircleOutlined, FileTextOutlined } from '@ant-design/icons';
const { Text } = Typography;
const StreamOutput = ({ output, isStreaming, usage, duration, }) => {
    const outputRef = useRef(null);
    // 自动滚动到底部
    useEffect(() => {
        if (outputRef.current && isStreaming) {
            outputRef.current.scrollTop = outputRef.current.scrollHeight;
        }
    }, [output, isStreaming]);
    return (_jsx(Card, { title: "\u8F93\u51FA\u7ED3\u679C", className: "h-full", bodyStyle: { padding: 0, height: 'calc(100% - 56px)' }, children: _jsxs("div", { className: "flex flex-col h-full", children: [_jsxs("div", { ref: outputRef, className: "flex-1 p-4 overflow-auto bg-gray-50 font-mono text-sm whitespace-pre-wrap", style: { minHeight: '300px' }, children: [output ? (_jsx(Text, { children: output })) : (_jsx("div", { className: "flex items-center justify-center h-full text-gray-400", children: isStreaming ? (_jsxs(Space, { children: [_jsx(Spin, { size: "small" }), _jsx("span", { children: "\u6B63\u5728\u751F\u6210..." })] })) : (_jsx("span", { children: "\u8F93\u51FA\u5185\u5BB9\u5C06\u663E\u793A\u5728\u8FD9\u91CC" })) })), isStreaming && (_jsx("span", { className: "inline-block w-2 h-4 ml-1 bg-blue-500 animate-pulse" }))] }), (usage || duration) && (_jsx("div", { className: "p-3 border-t bg-gray-50", children: _jsxs(Space, { size: "large", children: [usage && (_jsxs(_Fragment, { children: [_jsxs(Tag, { icon: _jsx(FileTextOutlined, {}), color: "blue", children: ["\u8F93\u5165: ", usage.inputTokens, " tokens"] }), _jsxs(Tag, { icon: _jsx(FileTextOutlined, {}), color: "green", children: ["\u8F93\u51FA: ", usage.outputTokens, " tokens"] })] })), duration && (_jsxs(Tag, { icon: _jsx(ClockCircleOutlined, {}), color: "orange", children: ["\u8017\u65F6: ", duration, "ms"] }))] }) }))] }) }));
};
export default StreamOutput;
