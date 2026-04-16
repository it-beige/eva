import { jsx as _jsx } from "react/jsx-runtime";
import { Table, Tag, Tooltip, Button, Typography } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { useAppSelector, useAppDispatch } from '../../../hooks/useRedux';
import { setPage, setPageSize } from '../../../store/observabilitySlice';
import dayjs from 'dayjs';
const { Text } = Typography;
const truncateText = (text, maxLength = 30) => {
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
const TraceTable = ({ onViewDetail }) => {
    const dispatch = useAppDispatch();
    const { traces, total, currentPage, pageSize, loading } = useAppSelector((state) => state.observability);
    const handlePageChange = (page, _size) => {
        dispatch(setPage(page));
    };
    const handlePageSizeChange = (_current, size) => {
        dispatch(setPageSize(size));
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
            title: '来源项目',
            dataIndex: 'sourceProject',
            key: 'sourceProject',
            width: 140,
            render: (sourceProject) => (_jsx(Text, { children: sourceProject || '-' })),
        },
        {
            title: 'TraceId',
            dataIndex: 'traceId',
            key: 'traceId',
            width: 220,
            ellipsis: {
                showTitle: false,
            },
            render: (traceId) => (_jsx(Tooltip, { placement: "topLeft", title: traceId, children: _jsx(Text, { copyable: { text: traceId }, style: { maxWidth: 200 }, children: truncateText(traceId, 25) }) })),
        },
        {
            title: '会话ID',
            dataIndex: 'sessionId',
            key: 'sessionId',
            width: 180,
            render: (sessionId) => (_jsx(Tooltip, { title: sessionId || '', children: _jsx(Text, { children: truncateText(sessionId, 20) }) })),
        },
        {
            title: '用户ID',
            dataIndex: 'userId',
            key: 'userId',
            width: 120,
            render: (userId) => (_jsx(Text, { children: userId || '-' })),
        },
        {
            title: '首次token响应时间',
            dataIndex: 'ttft',
            key: 'ttft',
            width: 150,
            render: (ttft) => (_jsx(Text, { children: ttft !== null ? `${ttft}ms` : '-' })),
        },
        {
            title: '输入Token数',
            dataIndex: 'inputTokens',
            key: 'inputTokens',
            width: 110,
            render: (inputTokens) => (_jsx(Text, { children: inputTokens ?? '-' })),
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            width: 90,
            render: (status) => (_jsx(Tag, { color: getStatusColor(status), children: getStatusText(status) })),
        },
        {
            title: '输入',
            dataIndex: 'input',
            key: 'input',
            width: 200,
            ellipsis: {
                showTitle: false,
            },
            render: (input) => (_jsx(Tooltip, { placement: "topLeft", title: input || '', children: _jsx(Text, { children: truncateText(input, 25) }) })),
        },
        {
            title: '输出',
            dataIndex: 'output',
            key: 'output',
            width: 200,
            ellipsis: {
                showTitle: false,
            },
            render: (output) => (_jsx(Tooltip, { placement: "topLeft", title: output || '', children: _jsx(Text, { children: truncateText(output, 25) }) })),
        },
        {
            title: '操作',
            key: 'action',
            width: 100,
            fixed: 'right',
            render: (_, record) => (_jsx(Button, { type: "link", size: "small", icon: _jsx(EyeOutlined, {}), onClick: () => onViewDetail(record.id), children: "\u67E5\u770B\u8BE6\u60C5" })),
        },
    ];
    return (_jsx(Table, { columns: columns, dataSource: traces, rowKey: "id", loading: loading, pagination: {
            current: currentPage,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
            pageSizeOptions: ['10', '20', '50', '100'],
            onChange: handlePageChange,
            onShowSizeChange: handlePageSizeChange,
        }, scroll: { x: 1600 }, locale: {
            emptyText: (_jsx("div", { style: { padding: '40px 0', textAlign: 'center' }, children: _jsx("div", { style: { color: '#999', fontSize: 14 }, children: "\u6682\u65E0\u6570\u636E" }) })),
        } }));
};
export default TraceTable;
