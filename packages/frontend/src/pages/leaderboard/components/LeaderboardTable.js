import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Table, Tag, Badge, Tooltip } from 'antd';
import { TrophyOutlined, RiseOutlined, FallOutlined, CalendarOutlined, } from '@ant-design/icons';
const LeaderboardTable = ({ data, loading, pagination, }) => {
    const columns = [
        {
            title: '排名',
            dataIndex: 'rank',
            key: 'rank',
            width: 80,
            align: 'center',
            render: (rank) => {
                if (rank <= 3) {
                    const colors = ['#FFD700', '#C0C0C0', '#CD7F32'];
                    return (_jsx(Badge, { count: _jsx(TrophyOutlined, { style: { color: colors[rank - 1] } }), style: { backgroundColor: 'transparent' } }));
                }
                return _jsx("span", { className: "text-gray-500 font-medium", children: rank });
            },
        },
        {
            title: '应用名称',
            dataIndex: 'appName',
            key: 'appName',
            render: (name, record) => (_jsxs("div", { children: [_jsx("div", { className: "font-medium", children: name }), _jsx("div", { className: "text-xs text-gray-400", children: record.appVersion })] })),
        },
        {
            title: '评测集',
            dataIndex: 'evalSetName',
            key: 'evalSetName',
            render: (name) => _jsx(Tag, { color: "blue", children: name }),
        },
        {
            title: '指标',
            dataIndex: 'metricName',
            key: 'metricName',
            render: (name) => _jsx(Tag, { color: "green", children: name }),
        },
        {
            title: '得分',
            dataIndex: 'score',
            key: 'score',
            width: 120,
            align: 'center',
            sorter: true,
            render: (score) => {
                let color = 'red';
                let icon = _jsx(FallOutlined, {});
                if (score >= 90) {
                    color = 'green';
                    icon = _jsx(RiseOutlined, {});
                }
                else if (score >= 75) {
                    color = 'blue';
                    icon = _jsx(RiseOutlined, {});
                }
                else if (score >= 60) {
                    color = 'orange';
                }
                return (_jsx(Tooltip, { title: `得分: ${score}`, children: _jsx(Tag, { color: color, icon: icon, className: "text-base font-bold", children: score.toFixed(2) }) }));
            },
        },
        {
            title: '最近评测时间',
            dataIndex: 'lastEvalTime',
            key: 'lastEvalTime',
            width: 180,
            render: (time) => (_jsxs("span", { className: "text-gray-500 text-sm", children: [_jsx(CalendarOutlined, { className: "mr-1" }), new Date(time).toLocaleString('zh-CN')] })),
        },
    ];
    return (_jsx(Table, { columns: columns, dataSource: data, rowKey: (record) => `${record.appId}-${record.evalSetId}-${record.metricId}`, loading: loading, pagination: {
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
            onChange: pagination.onChange,
        } }));
};
export default LeaderboardTable;
