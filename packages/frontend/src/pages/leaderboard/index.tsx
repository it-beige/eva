import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Select, Statistic, Space } from 'antd';
import {
  TrophyOutlined,
  AppstoreOutlined,
  DatabaseOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import LeaderboardTable from './components/LeaderboardTable';
import LeaderboardChart from './components/LeaderboardChart';
import { fetchEvalSets } from '../../store/evalSetSlice';
import { fetchEvalMetrics } from '../../store/evalMetricSlice';
import {
  useGetLeaderboardQuery,
  useGetLeaderboardSummaryQuery,
} from '../../services/leaderboardQueries';

const { Option } = Select;

const LeaderboardPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { evalSets } = useAppSelector((state) => state.evalSet);
  const { items: metrics } = useAppSelector((state) => state.evalMetric);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [evalSetId, setEvalSetId] = useState<string | undefined>();
  const [metricId, setMetricId] = useState<string | undefined>();
  const { data: leaderboardData, isFetching: loading } = useGetLeaderboardQuery({
    page,
    pageSize,
    evalSetId,
    metricId,
    sortBy: 'score',
    order: 'desc',
  });
  const { data: summary, isFetching: summaryLoading } =
    useGetLeaderboardSummaryQuery();
  const items = leaderboardData?.items ?? [];
  const total = leaderboardData?.total ?? 0;

  useEffect(() => {
    dispatch(fetchEvalSets({ page: 1, pageSize: 100 }));
    dispatch(fetchEvalMetrics({ page: 1, pageSize: 100 }));
  }, [dispatch]);

  const handlePageChange = (newPage: number, newPageSize: number) => {
    setPage(newPage);
    if (newPageSize !== pageSize) {
      setPageSize(newPageSize);
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
              styles={{ content: { fontSize: '16px' } }}
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
            value={evalSetId}
            onChange={(value) => {
              setEvalSetId(value);
              setPage(1);
            }}
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
            value={metricId}
            onChange={(value) => {
              setMetricId(value);
              setPage(1);
            }}
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
