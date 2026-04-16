import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Tabs, Typography, Space, Tooltip } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import TraceFilter from './components/TraceFilter';
import TraceTable from './components/TraceTable';
import BehaviorLogTab from './components/BehaviorLogTab';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { fetchTraces, fetchBehaviorLogs } from '../../store/observabilitySlice';
const { Title, Text } = Typography;
const { TabPane } = Tabs;
const ObservabilityPage = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { filters, currentPage, pageSize } = useAppSelector((state) => state.observability);
    const [activeTab, setActiveTab] = useState('trace');
    const handleSearch = useCallback(() => {
        dispatch(fetchTraces({
            startTime: filters.startTime,
            endTime: filters.endTime,
            idSearch: filters.idSearch || undefined,
            status: filters.status || undefined,
            userId: filters.userId || undefined,
            inputKeyword: filters.inputKeyword || undefined,
            outputKeyword: filters.outputKeyword || undefined,
            page: currentPage,
            pageSize: pageSize,
        }));
    }, [dispatch, filters, currentPage, pageSize]);
    const handleViewDetail = useCallback((id) => {
        navigate(`/observability/traces/${id}`);
    }, [navigate]);
    const handleTabChange = useCallback((key) => {
        setActiveTab(key);
        if (key === 'behavior') {
            // 加载行为日志 - 需要从 store 中获取 traces
            // 实际使用时应该根据当前选中的 trace 来加载
            const state = window.__REDUX_STATE__?.observability;
            if (state?.traces?.length > 0) {
                dispatch(fetchBehaviorLogs(state.traces[0].traceId));
            }
        }
    }, [dispatch]);
    // 组件挂载时不自动加载数据，等待用户点击查询按钮
    return (_jsxs("div", { style: { padding: '24px' }, children: [_jsxs("div", { style: { marginBottom: 24 }, children: [_jsx(Title, { level: 4, style: { marginBottom: 8 }, children: "\u8C03\u7528\u660E\u7EC6" }), _jsxs(Space, { children: [_jsx(Text, { type: "secondary", children: "\u901A\u8FC7\u7ED3\u6784\u5316\u3001\u8BED\u4E49\u5316\u7684\u65E5\u5FD7\u6307\u6807\uFF0C\u53EF\u5FEB\u901F\u5B9A\u4F4D\u95EE\u9898\u3001\u5206\u6790\u6027\u80FD\u5E76\u8BC4\u4F30\u7CFB\u7EDF\u5065\u5EB7\u5EA6\u3002" }), _jsx(Tooltip, { title: "\u67E5\u770B\u5E2E\u52A9\u6587\u6863", children: _jsxs(Text, { style: { cursor: 'pointer', color: '#5B21B6' }, children: [_jsx(FileTextOutlined, {}), " \u5E2E\u52A9\u6587\u6863"] }) })] })] }), _jsx(Card, { bordered: false, style: { marginBottom: 24 }, children: _jsx(TraceFilter, { onSearch: handleSearch }) }), _jsx(Card, { bordered: false, children: _jsxs(Tabs, { activeKey: activeTab, onChange: handleTabChange, children: [_jsx(TabPane, { tab: "Trace", children: _jsx(TraceTable, { onViewDetail: handleViewDetail }) }, "trace"), _jsx(TabPane, { tab: "\u884C\u4E3A\u65E5\u5FD7", children: _jsx(BehaviorLogTab, {}) }, "behavior")] }) })] }));
};
export default ObservabilityPage;
