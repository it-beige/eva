import { jsx as _jsx } from "react/jsx-runtime";
import { Table, Tag, Typography } from 'antd';
import { useAppSelector } from '../../../hooks/useRedux';
import dayjs from 'dayjs';
const { Text } = Typography;
const BehaviorLogTab = () => {
    const { behaviorLogs, logsLoading } = useAppSelector((state) => state.observability);
    const truncateText = (text, maxLength = 50) => {
        if (!text)
            return '-';
        if (text.length <= maxLength)
            return text;
        return text.substring(0, maxLength) + '...';
    };
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
    const columns = [
        {
            title: '调用时间',
            dataIndex: 'calledAt',
            key: 'calledAt',
            width: 170,
            render: (calledAt) => (_jsx(Text, { children: dayjs(calledAt).format('YYYY-MM-DD HH:mm:ss') })),
        },
        {
            title: 'TraceId',
            dataIndex: 'traceId',
            key: 'traceId',
            width: 220,
            render: (traceId) => (_jsx(Text, { copyable: { text: traceId }, children: truncateText(traceId, 30) })),
        },
        {
            title: '会话ID',
            dataIndex: 'sessionId',
            key: 'sessionId',
            width: 180,
            render: (sessionId) => truncateText(sessionId, 25),
        },
        {
            title: '用户ID',
            dataIndex: 'userId',
            key: 'userId',
            width: 120,
            render: (userId) => userId || '-',
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            width: 90,
            render: (status) => (_jsx(Tag, { color: getStatusColor(status), children: getStatusText(status) })),
        },
        {
            title: '输入Token数',
            dataIndex: 'inputTokens',
            key: 'inputTokens',
            width: 110,
            render: (inputTokens) => inputTokens ?? '-',
        },
        {
            title: '输出Token数',
            dataIndex: 'outputTokens',
            key: 'outputTokens',
            width: 110,
            render: (outputTokens) => outputTokens ?? '-',
        },
        {
            title: '输入内容',
            dataIndex: 'input',
            key: 'input',
            ellipsis: true,
            render: (input) => truncateText(input, 40),
        },
        {
            title: '输出内容',
            dataIndex: 'output',
            key: 'output',
            ellipsis: true,
            render: (output) => truncateText(output, 40),
        },
    ];
    return (_jsx(Table, { columns: columns, dataSource: behaviorLogs, rowKey: "id", loading: logsLoading, pagination: {
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条记录`,
            pageSizeOptions: ['10', '20', '50', '100'],
        }, scroll: { x: 1400 }, locale: {
            emptyText: (_jsx("div", { style: { padding: '40px 0', textAlign: 'center' }, children: _jsx("div", { style: { color: '#999', fontSize: 14 }, children: "\u6682\u65E0\u884C\u4E3A\u65E5\u5FD7\u6570\u636E" }) })),
        } }));
};
export default BehaviorLogTab;
