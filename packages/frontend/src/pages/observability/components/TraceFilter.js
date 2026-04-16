import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useCallback } from 'react';
import { Row, Col, Select, DatePicker, Input, Button, Space } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { TRACE_STATUS_OPTIONS, TIME_RANGE_OPTIONS } from '../../../types/observability';
import { useAppDispatch, useAppSelector } from '../../../hooks/useRedux';
import { setFilters, resetFilters } from '../../../store/observabilitySlice';
const { RangePicker } = DatePicker;
const TraceFilter = ({ onSearch }) => {
    const dispatch = useAppDispatch();
    const { filters } = useAppSelector((state) => state.observability);
    const [localFilters, setLocalFilters] = useState({
        timeRange: filters.timeRange || 'today',
        idSearch: filters.idSearch || '',
        status: filters.status || '',
        userId: filters.userId || '',
        inputKeyword: filters.inputKeyword || '',
        outputKeyword: filters.outputKeyword || '',
    });
    const [dateRange, setDateRange] = useState([
        filters.startTime ? dayjs(filters.startTime) : dayjs().startOf('day'),
        filters.endTime ? dayjs(filters.endTime) : dayjs().endOf('day'),
    ]);
    const handleTimeRangeChange = useCallback((value) => {
        setLocalFilters((prev) => ({ ...prev, timeRange: value }));
        let start;
        let end;
        switch (value) {
            case 'today':
                start = dayjs().startOf('day');
                end = dayjs().endOf('day');
                break;
            case 'yesterday':
                start = dayjs().subtract(1, 'day').startOf('day');
                end = dayjs().subtract(1, 'day').endOf('day');
                break;
            case 'last7days':
                start = dayjs().subtract(6, 'day').startOf('day');
                end = dayjs().endOf('day');
                break;
            case 'last30days':
                start = dayjs().subtract(29, 'day').startOf('day');
                end = dayjs().endOf('day');
                break;
            case 'realtime':
            default:
                start = dayjs().subtract(1, 'hour');
                end = dayjs();
                break;
        }
        setDateRange([start, end]);
    }, []);
    const handleDateRangeChange = useCallback((dates) => {
        if (dates && dates[0] && dates[1]) {
            setDateRange(dates);
            setLocalFilters((prev) => ({ ...prev, timeRange: '' }));
        }
    }, []);
    const handleSearch = useCallback(() => {
        dispatch(setFilters({
            ...localFilters,
            startTime: dateRange[0]?.toISOString(),
            endTime: dateRange[1]?.toISOString(),
        }));
        onSearch();
    }, [dispatch, localFilters, dateRange, onSearch]);
    const handleReset = useCallback(() => {
        const defaultFilters = {
            timeRange: 'today',
            idSearch: '',
            status: '',
            userId: '',
            inputKeyword: '',
            outputKeyword: '',
        };
        setLocalFilters(defaultFilters);
        setDateRange([dayjs().startOf('day'), dayjs().endOf('day')]);
        dispatch(resetFilters());
        // 重置后立即触发搜索
        setTimeout(() => onSearch(), 0);
    }, [dispatch, onSearch]);
    return (_jsxs("div", { style: { padding: '16px 0', background: '#fff' }, children: [_jsx(Row, { gutter: [16, 16], align: "middle", children: _jsx(Col, { flex: "auto", children: _jsxs(Space, { size: "middle", wrap: true, children: [_jsxs(Space, { children: [_jsx("span", { style: { color: '#666' }, children: "\u65F6\u95F4\u8303\u56F4:" }), _jsx(Select, { value: localFilters.timeRange, onChange: handleTimeRangeChange, options: TIME_RANGE_OPTIONS, style: { width: 100 }, placeholder: "\u9009\u62E9\u65F6\u95F4" }), _jsx(RangePicker, { value: dateRange, onChange: handleDateRangeChange, showTime: { format: 'HH:mm' }, format: "YYYY-MM-DD HH:mm", style: { width: 320 } })] }), _jsxs(Space, { children: [_jsx("span", { style: { color: '#666' }, children: "ID\u641C\u7D22:" }), _jsx(Input, { value: localFilters.idSearch, onChange: (e) => setLocalFilters((prev) => ({ ...prev, idSearch: e.target.value })), placeholder: "\u652F\u6301TraceId\u3001\u4F1A\u8BDDID\u3001\u8282\u70B9ID\u3001messageId\u7684\u641C\u7D22", style: { width: 280 }, allowClear: true })] }), _jsxs(Space, { children: [_jsx("span", { style: { color: '#666' }, children: "\u72B6\u6001:" }), _jsx(Select, { value: localFilters.status, onChange: (value) => setLocalFilters((prev) => ({ ...prev, status: value })), options: TRACE_STATUS_OPTIONS, style: { width: 120 } })] }), _jsxs(Space, { children: [_jsx("span", { style: { color: '#666' }, children: "\u8F93\u5165/\u8F93\u51FA:" }), _jsx(Input, { value: localFilters.inputKeyword || localFilters.outputKeyword, onChange: (e) => {
                                            const value = e.target.value;
                                            setLocalFilters((prev) => ({
                                                ...prev,
                                                inputKeyword: value,
                                                outputKeyword: value
                                            }));
                                        }, placeholder: "\u8BF7\u8F93\u5165\u8F93\u5165/\u8F93\u51FA\u5173\u952E\u8BCD", style: { width: 200 }, allowClear: true })] })] }) }) }), _jsx(Row, { gutter: [16, 16], align: "middle", style: { marginTop: 12 }, children: _jsx(Col, { flex: "auto", children: _jsxs(Space, { size: "middle", children: [_jsxs(Space, { children: [_jsx("span", { style: { color: '#666' }, children: "\u7528\u6237ID:" }), _jsx(Input, { value: localFilters.userId, onChange: (e) => setLocalFilters((prev) => ({ ...prev, userId: e.target.value })), placeholder: "\u8BF7\u8F93\u5165\u7528\u6237ID", style: { width: 200 }, allowClear: true })] }), _jsx(Button, { type: "primary", icon: _jsx(SearchOutlined, {}), onClick: handleSearch, children: "\u67E5\u8BE2" }), _jsx(Button, { icon: _jsx(ReloadOutlined, {}), onClick: handleReset, children: "\u91CD\u7F6E" })] }) }) })] }));
};
export default TraceFilter;
