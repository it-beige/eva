import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Tabs, Typography, Space, Tooltip, Statistic, Button } from 'antd';
import { FileTextOutlined, ReloadOutlined } from '@ant-design/icons';
import TraceFilter from './components/TraceFilter';
import TraceTable from './components/TraceTable';
import BehaviorLogTab from './components/BehaviorLogTab';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { fetchTraces, fetchBehaviorLogs } from '../../store/observabilitySlice';
import PageContainer from '../../components/page/PageContainer';
import styles from './ObservabilityPage.module.scss';

const { Text } = Typography;

const ObservabilityPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { filters, pageSize, traces, total } = useAppSelector(
    (state) => state.observability
  );
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
        page: 1,
        pageSize: pageSize,
      })
    );
  }, [dispatch, filters, pageSize]);

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

  const successTraceCount = traces.filter((trace) => trace.status === 'success').length;
  const abnormalTraceCount = traces.filter(
    (trace) => trace.status === 'error' || trace.status === 'timeout'
  ).length;
  const ttftSamples = traces.filter((trace) => trace.ttft !== null);
  const avgTtft = ttftSamples.length
    ? Math.round(
        ttftSamples.reduce((sum, trace) => sum + (trace.ttft ?? 0), 0) / ttftSamples.length
      )
    : 0;

  return (
    <PageContainer
      extra={
        <>
          <Button icon={<ReloadOutlined />} onClick={handleSearch}>
            立即查询
          </Button>
          <Tooltip title="查看帮助文档">
            <Button icon={<FileTextOutlined />}>帮助文档</Button>
          </Tooltip>
        </>
      }
      content={
        <div className="eva-panelGrid">
          <Card className="eva-statCard">
            <Statistic title="Trace 总量" value={total} suffix={<Text className="eva-muted">条</Text>} />
          </Card>
          <Card className="eva-statCard">
            <Statistic title="成功调用" value={successTraceCount} suffix={<Text className="eva-muted">条</Text>} />
          </Card>
          <Card className="eva-statCard">
            <Statistic title="异常调用" value={abnormalTraceCount} suffix={<Text className="eva-muted">条</Text>} />
          </Card>
        </div>
      }
    >
      <Card>
        <TraceFilter onSearch={handleSearch} />
      </Card>

      <Card>
        <div className={`eva-toolbar ${styles.toolbar}`}>
          <div className="eva-toolbarGroup">
            <Space>
              <Text type="secondary">平均 TTFT</Text>
              <Text>{avgTtft} ms</Text>
            </Space>
          </div>
          <div className="eva-toolbarGroup">
            <Text type="secondary">当前页大小 {pageSize}</Text>
          </div>
        </div>

        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          items={[
            {
              key: 'trace',
              label: 'Trace',
              children: <TraceTable onViewDetail={handleViewDetail} />,
            },
            {
              key: 'behavior',
              label: '行为日志',
              children: <BehaviorLogTab />,
            },
          ]}
        />
      </Card>
    </PageContainer>
  );
};

export default ObservabilityPage;
