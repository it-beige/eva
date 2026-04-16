import { useState, useCallback } from 'react';
import { Row, Col, Select, DatePicker, Input, Button, Space } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { TRACE_STATUS_OPTIONS, TIME_RANGE_OPTIONS } from '../../../types/observability';
import { useAppDispatch, useAppSelector } from '../../../hooks/useRedux';
import { setFilters, resetFilters } from '../../../store/observabilitySlice';

const { RangePicker } = DatePicker;

interface TraceFilterProps {
  onSearch: () => void;
}

const TraceFilter = ({ onSearch }: TraceFilterProps) => {
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

  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([
    filters.startTime ? dayjs(filters.startTime) : dayjs().startOf('day'),
    filters.endTime ? dayjs(filters.endTime) : dayjs().endOf('day'),
  ]);

  const handleTimeRangeChange = useCallback((value: string) => {
    setLocalFilters((prev) => ({ ...prev, timeRange: value }));
    
    let start: dayjs.Dayjs;
    let end: dayjs.Dayjs;
    
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

  const handleDateRangeChange = useCallback((dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null) => {
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

  return (
    <div style={{ padding: '16px 0', background: '#fff' }}>
      <Row gutter={[16, 16]} align="middle">
        {/* 第一行 */}
        <Col flex="auto">
          <Space size="middle" wrap>
            <Space>
              <span style={{ color: '#666' }}>时间范围:</span>
              <Select
                value={localFilters.timeRange}
                onChange={handleTimeRangeChange}
                options={TIME_RANGE_OPTIONS}
                style={{ width: 100 }}
                placeholder="选择时间"
              />
              <RangePicker
                value={dateRange}
                onChange={handleDateRangeChange}
                showTime={{ format: 'HH:mm' }}
                format="YYYY-MM-DD HH:mm"
                style={{ width: 320 }}
              />
            </Space>
            
            <Space>
              <span style={{ color: '#666' }}>ID搜索:</span>
              <Input
                value={localFilters.idSearch}
                onChange={(e) => setLocalFilters((prev) => ({ ...prev, idSearch: e.target.value }))}
                placeholder="支持TraceId、会话ID、节点ID、messageId的搜索"
                style={{ width: 280 }}
                allowClear
              />
            </Space>

            <Space>
              <span style={{ color: '#666' }}>状态:</span>
              <Select
                value={localFilters.status}
                onChange={(value) => setLocalFilters((prev) => ({ ...prev, status: value }))}
                options={TRACE_STATUS_OPTIONS}
                style={{ width: 120 }}
              />
            </Space>

            <Space>
              <span style={{ color: '#666' }}>输入/输出:</span>
              <Input
                value={localFilters.inputKeyword || localFilters.outputKeyword}
                onChange={(e) => {
                  const value = e.target.value;
                  setLocalFilters((prev) => ({ 
                    ...prev, 
                    inputKeyword: value,
                    outputKeyword: value 
                  }));
                }}
                placeholder="请输入输入/输出关键词"
                style={{ width: 200 }}
                allowClear
              />
            </Space>
          </Space>
        </Col>
      </Row>

      <Row gutter={[16, 16]} align="middle" style={{ marginTop: 12 }}>
        {/* 第二行 */}
        <Col flex="auto">
          <Space size="middle">
            <Space>
              <span style={{ color: '#666' }}>用户ID:</span>
              <Input
                value={localFilters.userId}
                onChange={(e) => setLocalFilters((prev) => ({ ...prev, userId: e.target.value }))}
                placeholder="请输入用户ID"
                style={{ width: 200 }}
                allowClear
              />
            </Space>

            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={handleSearch}
            >
              查询
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={handleReset}
            >
              重置
            </Button>
          </Space>
        </Col>
      </Row>
    </div>
  );
};

export default TraceFilter;
