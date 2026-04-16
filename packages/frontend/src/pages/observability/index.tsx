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
    dispatch(
      fetchTraces({
        startTime: filters.startTime,
        endTime: filters.endTime,
        idSearch: filters.idSearch || undefined,
        status: filters.status || undefined,
        userId: filters.userId || undefined,
        inputKeyword: filters.inputKeyword || undefined,
        outputKeyword: filters.outputKeyword || undefined,
        page: currentPage,
        pageSize: pageSize,
      })
    );
  }, [dispatch, filters, currentPage, pageSize]);

  const handleViewDetail = useCallback(
    (id: string) => {
      navigate(`/observability/traces/${id}`);
    },
    [navigate]
  );

  const handleTabChange = useCallback(
    (key: string) => {
      setActiveTab(key);
      if (key === 'behavior') {
        // 加载行为日志 - 需要从 store 中获取 traces
        // 实际使用时应该根据当前选中的 trace 来加载
        const state = (window as any).__REDUX_STATE__?.observability;
        if (state?.traces?.length > 0) {
          dispatch(fetchBehaviorLogs(state.traces[0].traceId));
        }
      }
    },
    [dispatch]
  );

  // 组件挂载时不自动加载数据，等待用户点击查询按钮

  return (
    <div style={{ padding: '24px' }}>
      {/* 页面标题 */}
      <div style={{ marginBottom: 24 }}>
        <Title level={4} style={{ marginBottom: 8 }}>
          调用明细
        </Title>
        <Space>
          <Text type="secondary">
            通过结构化、语义化的日志指标，可快速定位问题、分析性能并评估系统健康度。
          </Text>
          <Tooltip title="查看帮助文档">
            <Text style={{ cursor: 'pointer', color: '#5B21B6' }}>
              <FileTextOutlined /> 帮助文档
            </Text>
          </Tooltip>
        </Space>
      </div>

      {/* 筛选栏 */}
      <Card bordered={false} style={{ marginBottom: 24 }}>
        <TraceFilter onSearch={handleSearch} />
      </Card>

      {/* Tabs */}
      <Card bordered={false}>
        <Tabs activeKey={activeTab} onChange={handleTabChange}>
          <TabPane tab="Trace" key="trace">
            <TraceTable onViewDetail={handleViewDetail} />
          </TabPane>
          <TabPane tab="行为日志" key="behavior">
            <BehaviorLogTab />
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default ObservabilityPage;
