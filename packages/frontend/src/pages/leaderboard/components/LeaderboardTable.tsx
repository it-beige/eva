import React from 'react';
import { Table, Tag, Badge, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  TrophyOutlined,
  RiseOutlined,
  FallOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { LeaderboardItem } from '../../../services/leaderboardApi';
import styles from './LeaderboardTable.module.scss';

interface LeaderboardTableProps {
  data: LeaderboardItem[];
  loading: boolean;
  pagination: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
}

const LeaderboardTable: React.FC<LeaderboardTableProps> = ({
  data,
  loading,
  pagination,
}) => {
  const columns: ColumnsType<LeaderboardItem> = [
    {
      title: '排名',
      dataIndex: 'rank',
      key: 'rank',
      width: 80,
      align: 'center',
      render: (rank: number) => {
        if (rank <= 3) {
          const colors = ['#FFD700', '#C0C0C0', '#CD7F32'];
          return (
            <Badge
              count={<TrophyOutlined style={{ color: colors[rank - 1] }} />}
              style={{ backgroundColor: 'transparent' }}
            />
          );
        }
        return <span className={styles.rank}>{rank}</span>;
      },
    },
    {
      title: '应用名称',
      dataIndex: 'appName',
      key: 'appName',
      render: (name: string, record) => (
        <div>
          <div className={styles.appName}>{name}</div>
          <div className={styles.appVersion}>{record.appVersion}</div>
        </div>
      ),
    },
    {
      title: '评测集',
      dataIndex: 'evalSetName',
      key: 'evalSetName',
      render: (name: string) => <Tag color="blue">{name}</Tag>,
    },
    {
      title: '指标',
      dataIndex: 'metricName',
      key: 'metricName',
      render: (name: string) => <Tag color="green">{name}</Tag>,
    },
    {
      title: '得分',
      dataIndex: 'score',
      key: 'score',
      width: 120,
      align: 'center',
      sorter: true,
      render: (score: number) => {
        let color = 'red';
        let icon = <FallOutlined />;
        if (score >= 90) {
          color = 'green';
          icon = <RiseOutlined />;
        } else if (score >= 75) {
          color = 'blue';
          icon = <RiseOutlined />;
        } else if (score >= 60) {
          color = 'orange';
        }
        return (
          <Tooltip title={`得分: ${score}`}>
            <Tag color={color} icon={icon} className={styles.scoreTag}>
              {score.toFixed(2)}
            </Tag>
          </Tooltip>
        );
      },
    },
    {
      title: '最近评测时间',
      dataIndex: 'lastEvalTime',
      key: 'lastEvalTime',
      width: 180,
      render: (time: string) => (
        <span className={styles.timeCell}>
          <CalendarOutlined className={styles.timeIcon} />
          {new Date(time).toLocaleString('zh-CN')}
        </span>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={data}
      rowKey={(record) =>
        `${record.appId}-${record.evalSetId}-${record.metricId}`
      }
      loading={loading}
      pagination={{
        current: pagination.current,
        pageSize: pagination.pageSize,
        total: pagination.total,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total) => `共 ${total} 条`,
        onChange: pagination.onChange,
      }}
    />
  );
};

export default LeaderboardTable;
