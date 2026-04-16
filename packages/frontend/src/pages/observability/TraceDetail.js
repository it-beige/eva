import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Tag, Typography, Button, Row, Col, Spin, Empty, } from 'antd';
import { ArrowLeftOutlined, CopyOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { fetchTraceDetail, clearSelectedTrace } from '../../store/observabilitySlice';
import dayjs from 'dayjs';
const { Title, Text, Paragraph } = Typography;
const getStatusColor = (status) => {
    switch (status) {
        case 'success':
            return 'success';
        case 'error':
            return 'error';
        case 'pending':
            return 'processing';
        case 'timeout':
            return 'warning';
        default:
            return 'default';
    }
};
const getStatusText = (status) => {
    switch (status) {
        case 'success':
            return '成功';
        case 'error':
            return '错误';
        case 'pending':
            return '进行中';
        case 'timeout':
            return '超时';
        default:
            return status || '未知';
    }
};
const TraceDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { selectedTrace, detailLoading } = useAppSelector((state) => state.observability);
    useEffect(() => {
        if (id) {
            dispatch(fetchTraceDetail(id));
        }
        return () => {
            dispatch(clearSelectedTrace());
        };
    }, [id, dispatch]);
    const handleBack = () => {
        navigate('/observability/traces');
    };
    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
    };
    if (detailLoading) {
        return (_jsx("div", { style: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }, children: _jsx(Spin, { size: "large", tip: "\u52A0\u8F7D\u4E2D..." }) }));
    }
    if (!selectedTrace) {
        return (_jsx("div", { style: { padding: '24px' }, children: _jsxs(Card, { children: [_jsx(Empty, { description: "\u672A\u627E\u5230Trace\u8BB0\u5F55" }), _jsx("div", { style: { textAlign: 'center', marginTop: 16 }, children: _jsx(Button, { type: "primary", onClick: handleBack, children: "\u8FD4\u56DE\u5217\u8868" }) })] }) }));
    }
    return (_jsxs("div", { style: { padding: '24px' }, children: [_jsxs("div", { style: { marginBottom: 24 }, children: [_jsx(Button, { type: "link", icon: _jsx(ArrowLeftOutlined, {}), onClick: handleBack, style: { paddingLeft: 0 }, children: "\u8C03\u7528\u660E\u7EC6" }), _jsx(Text, { type: "secondary", children: " > " }), _jsx(Text, { children: selectedTrace.traceId })] }), _jsx(Title, { level: 4, style: { marginBottom: 24 }, children: "Trace \u8BE6\u60C5" }), _jsx(Card, { title: "\u57FA\u672C\u4FE1\u606F", bordered: false, style: { marginBottom: 24 }, children: _jsxs(Descriptions, { bordered: true, column: 2, children: [_jsx(Descriptions.Item, { label: "Trace ID", children: _jsx(Text, { copyable: { text: selectedTrace.traceId }, children: selectedTrace.traceId }) }), _jsx(Descriptions.Item, { label: "\u8C03\u7528\u65F6\u95F4", children: dayjs(selectedTrace.calledAt).format('YYYY-MM-DD HH:mm:ss') }), _jsx(Descriptions.Item, { label: "\u4F1A\u8BDDID", children: selectedTrace.sessionId || '-' }), _jsx(Descriptions.Item, { label: "\u7528\u6237ID", children: selectedTrace.userId || '-' }), _jsx(Descriptions.Item, { label: "\u8282\u70B9ID", children: selectedTrace.nodeId || '-' }), _jsx(Descriptions.Item, { label: "Message ID", children: selectedTrace.messageId || '-' }), _jsx(Descriptions.Item, { label: "\u6765\u6E90\u9879\u76EE", children: selectedTrace.sourceProject || '-' }), _jsx(Descriptions.Item, { label: "\u72B6\u6001", children: _jsx(Tag, { color: getStatusColor(selectedTrace.status), children: getStatusText(selectedTrace.status) }) })] }) }), _jsx(Card, { title: "\u6027\u80FD\u6307\u6807", bordered: false, style: { marginBottom: 24 }, children: _jsxs(Row, { gutter: 24, children: [_jsx(Col, { span: 8, children: _jsx(Card, { size: "small", children: _jsx(Statistic, { title: "\u9996\u6B21Token\u54CD\u5E94\u65F6\u95F4", value: selectedTrace.ttft !== null ? `${selectedTrace.ttft}ms` : '-' }) }) }), _jsx(Col, { span: 8, children: _jsx(Card, { size: "small", children: _jsx(Statistic, { title: "\u8F93\u5165Token\u6570", value: selectedTrace.inputTokens ?? '-' }) }) }), _jsx(Col, { span: 8, children: _jsx(Card, { size: "small", children: _jsx(Statistic, { title: "\u8F93\u51FAToken\u6570", value: selectedTrace.outputTokens ?? '-' }) }) })] }) }), _jsx(Card, { title: "\u8F93\u5165\u5185\u5BB9", bordered: false, style: { marginBottom: 24 }, extra: selectedTrace.input && (_jsx(Button, { type: "text", icon: _jsx(CopyOutlined, {}), onClick: () => handleCopy(selectedTrace.input || ''), children: "\u590D\u5236" })), children: selectedTrace.input ? (_jsx(Paragraph, { style: {
                        background: '#f5f5f5',
                        padding: 16,
                        borderRadius: 4,
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                    }, children: selectedTrace.input })) : (_jsx(Text, { type: "secondary", children: "\u65E0\u8F93\u5165\u5185\u5BB9" })) }), _jsx(Card, { title: "\u8F93\u51FA\u5185\u5BB9", bordered: false, extra: selectedTrace.output && (_jsx(Button, { type: "text", icon: _jsx(CopyOutlined, {}), onClick: () => handleCopy(selectedTrace.output || ''), children: "\u590D\u5236" })), children: selectedTrace.output ? (_jsx(Paragraph, { style: {
                        background: '#f5f5f5',
                        padding: 16,
                        borderRadius: 4,
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                    }, children: selectedTrace.output })) : (_jsx(Text, { type: "secondary", children: "\u65E0\u8F93\u51FA\u5185\u5BB9" })) }), _jsx("div", { style: { marginTop: 24, textAlign: 'center' }, children: _jsx(Button, { type: "primary", onClick: handleBack, icon: _jsx(ArrowLeftOutlined, {}), children: "\u8FD4\u56DE\u5217\u8868" }) })] }));
};
// 简单的统计组件
const Statistic = ({ title, value }) => (_jsxs("div", { style: { textAlign: 'center' }, children: [_jsx("div", { style: { color: '#666', fontSize: 14, marginBottom: 8 }, children: title }), _jsx("div", { style: { color: '#333', fontSize: 24, fontWeight: 'bold' }, children: value })] }));
export default TraceDetailPage;
