import React, { useEffect } from 'react';
import { Row, Col, Card, Select, Statistic, Space, Spin } from 'antd';
import {
  TrophyOutlined,
  AppstoreOutlined,
  DatabaseOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import LeaderboardTable from './components/LeaderboardTable';
import LeaderboardChart from './components/LeaderboardChart';
import {
  fetchLeaderboard,
  fetchLeaderboardSummary,
  setPage,
  setPageSize,
  setEvalSetFilter,
  setMetricFilter,
} from '../../store/leaderboardSlice';
import { fetchEvalSets } from '../../store/evalSetSlice';
import { fetchEvalMetrics } from '../../store/evalMetricSlice';

const { Option } = Select;

const LeaderboardPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    items,
    summary,
    loading,
    summaryLoading,
    total,
    page,
    pageSize,
    filters,
  } = useAppSelector((state) => state.leaderboard);
  const { evalSets } = useAppSelector((state) => state.evalSet);
  const metricsState = useAppSelector((state) => state.evalMetric);
  const metrics = (metricsState as any).items || (metricsState as any).metrics || [];

  useEffect(() => {
    dispatch(fetchEvalSets({ page: 1, pageSize: 100 }));
    dispatch(fetchEvalMetrics({ page: 1, pageSize: 100 }));
    dispatch(fetchLeaderboardSummary());
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      fetchLeaderboard({
        page,
        pageSize,
        evalSetId: filters.evalSetId,
        metricId: filters.metricId,
        sortBy: filters.sortBy,
        order: filters.order,
      })
    );
  }, [dispatch, page, pageSize, filters]);

  const handlePageChange = (newPage: number, newPageSize: number) => {
    dispatch(setPage(newPage));
    if (newPageSize !== pageSize) {
      dispatch(setPageSize(newPageSize));
    }
  };

  return (
    <div className="h-full p-6">
      <h1 className="text-2xl font-bold mb-6">Leaderboard</h1>

      {/* 汇总统计 */}
      <Row gutter={16} className="mb-6">
        <Col span={6}>
          <Card>
            <Statistic
              title="应用总数"
              value={summary?.totalApps || 0}
              prefix={<AppstoreOutlined />}
              loading={summaryLoading}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="评测集数量"
              value={summary?.totalEvalSets || 0}
              prefix={<DatabaseOutlined />}
              loading={summaryLoading}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="平均得分"
              value={summary?.avgScore || 0}
              precision={2}
              prefix={<BarChartOutlined />}
              suffix="分"
              loading={summaryLoading}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="最佳应用"
              value={summary?.topApp?.name || '-'}
              prefix={<TrophyOutlined />}
              loading={summaryLoading}
              valueStyle={{ fontSize: '16px' }}
            />
            {summary?.topApp && (
              <div className="text-green-500 text-sm mt-1">
                得分: {summary.topApp.score.toFixed(2)}
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* 筛选器 */}
      <Card className="mb-6">
        <Space size="large">
          <span>筛选:</span>
          <Select
            placeholder="选择评测集"
            allowClear
            style={{ width: 200 }}
            value={filters.evalSetId}
            onChange={(value) => dispatch(setEvalSetFilter(value))}
          >
            {evalSets.map((es) => (
              <Option key={es.id} value={es.id}>
                {es.name}
              </Option>
            ))}
          </Select>
          <Select
            placeholder="选择指标"
            allowClear
            style={{ width: 150 }}
            value={filters.metricId}
            onChange={(value) => dispatch(setMetricFilter(value))}
          >
            {metrics.map((m) => (
              <Option key={m.id} value={m.id}>
                {m.name}
              </Option>
            ))}
          </Select>
        </Space>
      </Card>

      {/* 排行榜内容 */}
      <Row gutter={24}>
        <Col span={16}>
          <LeaderboardTable
            data={items}
            loading={loading}
            pagination={{
              current: page,
              pageSize,
              total,
              onChange: handlePageChange,
            }}
          />
        </Col>
        <Col span={8}>
          <LeaderboardChart data={items} loading={loading} />
        </Col>
      </Row>
    </div>
  );
};

export default LeaderboardPage;
