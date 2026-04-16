import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { Row, Col, Card, Select, Statistic, Space } from 'antd';
import { TrophyOutlined, AppstoreOutlined, DatabaseOutlined, BarChartOutlined, } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import LeaderboardTable from './components/LeaderboardTable';
import LeaderboardChart from './components/LeaderboardChart';
import { fetchLeaderboard, fetchLeaderboardSummary, setPage, setPageSize, setEvalSetFilter, setMetricFilter, } from '../../store/leaderboardSlice';
import { fetchEvalSets } from '../../store/evalSetSlice';
import { fetchEvalMetrics } from '../../store/evalMetricSlice';
const { Option } = Select;
const LeaderboardPage = () => {
    const dispatch = useAppDispatch();
    const { items, summary, loading, summaryLoading, total, page, pageSize, filters, } = useAppSelector((state) => state.leaderboard);
    const { evalSets } = useAppSelector((state) => state.evalSet);
    const { metrics } = useAppSelector((state) => state.evalMetric);
    useEffect(() => {
        dispatch(fetchEvalSets({ page: 1, pageSize: 100 }));
        dispatch(fetchEvalMetrics({ page: 1, pageSize: 100 }));
        dispatch(fetchLeaderboardSummary());
    }, [dispatch]);
    useEffect(() => {
        dispatch(fetchLeaderboard({
            page,
            pageSize,
            evalSetId: filters.evalSetId,
            metricId: filters.metricId,
            sortBy: filters.sortBy,
            order: filters.order,
        }));
    }, [dispatch, page, pageSize, filters]);
    const handlePageChange = (newPage, newPageSize) => {
        dispatch(setPage(newPage));
        if (newPageSize !== pageSize) {
            dispatch(setPageSize(newPageSize));
        }
    };
    return (_jsxs("div", { className: "h-full p-6", children: [_jsx("h1", { className: "text-2xl font-bold mb-6", children: "Leaderboard" }), _jsxs(Row, { gutter: 16, className: "mb-6", children: [_jsx(Col, { span: 6, children: _jsx(Card, { children: _jsx(Statistic, { title: "\u5E94\u7528\u603B\u6570", value: summary?.totalApps || 0, prefix: _jsx(AppstoreOutlined, {}), loading: summaryLoading }) }) }), _jsx(Col, { span: 6, children: _jsx(Card, { children: _jsx(Statistic, { title: "\u8BC4\u6D4B\u96C6\u6570\u91CF", value: summary?.totalEvalSets || 0, prefix: _jsx(DatabaseOutlined, {}), loading: summaryLoading }) }) }), _jsx(Col, { span: 6, children: _jsx(Card, { children: _jsx(Statistic, { title: "\u5E73\u5747\u5F97\u5206", value: summary?.avgScore || 0, precision: 2, prefix: _jsx(BarChartOutlined, {}), suffix: "\u5206", loading: summaryLoading }) }) }), _jsx(Col, { span: 6, children: _jsxs(Card, { children: [_jsx(Statistic, { title: "\u6700\u4F73\u5E94\u7528", value: summary?.topApp?.name || '-', prefix: _jsx(TrophyOutlined, {}), loading: summaryLoading, valueStyle: { fontSize: '16px' } }), summary?.topApp && (_jsxs("div", { className: "text-green-500 text-sm mt-1", children: ["\u5F97\u5206: ", summary.topApp.score.toFixed(2)] }))] }) })] }), _jsx(Card, { className: "mb-6", children: _jsxs(Space, { size: "large", children: [_jsx("span", { children: "\u7B5B\u9009:" }), _jsx(Select, { placeholder: "\u9009\u62E9\u8BC4\u6D4B\u96C6", allowClear: true, style: { width: 200 }, value: filters.evalSetId, onChange: (value) => dispatch(setEvalSetFilter(value)), children: evalSets.map((es) => (_jsx(Option, { value: es.id, children: es.name }, es.id))) }), _jsx(Select, { placeholder: "\u9009\u62E9\u6307\u6807", allowClear: true, style: { width: 150 }, value: filters.metricId, onChange: (value) => dispatch(setMetricFilter(value)), children: metrics.map((m) => (_jsx(Option, { value: m.id, children: m.name }, m.id))) })] }) }), _jsxs(Row, { gutter: 24, children: [_jsx(Col, { span: 16, children: _jsx(LeaderboardTable, { data: items, loading: loading, pagination: {
                                current: page,
                                pageSize,
                                total,
                                onChange: handlePageChange,
                            } }) }), _jsx(Col, { span: 8, children: _jsx(LeaderboardChart, { data: items, loading: loading }) })] })] }));
};
export default LeaderboardPage;
