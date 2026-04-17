import React, { useEffect, useState } from 'react';
import { Card, Select, Statistic, Space } from 'antd';
import {
  TrophyOutlined,
  AppstoreOutlined,
  DatabaseOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import LeaderboardTable from './components/LeaderboardTable';
import LeaderboardChart from './components/LeaderboardChart';
import PageContainer from '../../components/page/PageContainer';
import { fetchEvalSets } from '../../store/evalSetSlice';
import { fetchEvalMetrics } from '../../store/evalMetricSlice';
import {
  useGetLeaderboardQuery,
  useGetLeaderboardSummaryQuery,
} from '../../services/leaderboardQueries';
import styles from './LeaderboardPage.module.scss';

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
    <PageContainer
      description="查看各 AI 应用在不同评测集和指标下的综合排名与得分对比。"
    >
      <div className={styles.summaryGrid}>
        <Card className="eva-statCard">
          <Statistic
            title="应用总数"
            value={summary?.totalApps || 0}
            prefix={<AppstoreOutlined />}
            loading={summaryLoading}
          />
        </Card>
        <Card className="eva-statCard">
          <Statistic
            title="评测集数量"
            value={summary?.totalEvalSets || 0}
            prefix={<DatabaseOutlined />}
            loading={summaryLoading}
          />
        </Card>
        <Card className="eva-statCard">
          <Statistic
            title="平均得分"
            value={summary?.avgScore || 0}
            precision={2}
            prefix={<BarChartOutlined />}
            suffix="分"
            loading={summaryLoading}
          />
        </Card>
        <Card className="eva-statCard">
          <Statistic
            title="最佳应用"
            value={summary?.topApp?.name || '-'}
            prefix={<TrophyOutlined />}
            loading={summaryLoading}
            styles={{ content: { fontSize: '16px' } }}
          />
          {summary?.topApp && (
            <div className={styles.topAppScore}>
              得分: {summary.topApp.score.toFixed(2)}
            </div>
          )}
        </Card>
      </div>

      <Card className={styles.filterCard}>
        <Space size="large">
          <span className={styles.filterLabel}>筛选:</span>
          <Select
            placeholder="选择评测集"
            allowClear
            className={styles.filterSelect}
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
            className={styles.metricSelect}
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

      <div className={styles.contentGrid}>
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
        <LeaderboardChart data={items} loading={loading} />
      </div>
    </PageContainer>
  );
};

export default LeaderboardPage;
