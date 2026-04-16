import { Table, Tag, Typography } from 'antd';
import { useAppSelector } from '../../../hooks/useRedux';
import dayjs from 'dayjs';
import styles from './BehaviorLogTab.module.scss';

const { Text } = Typography;

const BehaviorLogTab = () => {
  const { behaviorLogs, logsLoading } = useAppSelector((state) => state.observability);

  const truncateText = (text: string | null, maxLength: number = 50): string => {
    if (!text) return '-';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const getStatusColor = (status: string | null): string => {
    switch (status) {
      case 'success':
        return 'success';
      case 'error':
        return 'error';
      case 'pending':
        return 'processing';
      case 'timeout':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string | null): string => {
    switch (status) {
      case 'success':
        return '成功';
      case 'error':
        return '错误';
      case 'pending':
        return '进行中';
      case 'timeout':
        return '超时';
      default:
        return status || '未知';
    }
  };

  const columns = [
    {
      title: '调用时间',
      dataIndex: 'calledAt',
      key: 'calledAt',
      width: 170,
      render: (calledAt: string) => (
        <Text>{dayjs(calledAt).format('YYYY-MM-DD HH:mm:ss')}</Text>
      ),
    },
    {
      title: 'TraceId',
      dataIndex: 'traceId',
      key: 'traceId',
      width: 220,
      render: (traceId: string) => (
        <Text copyable={{ text: traceId }}>{truncateText(traceId, 30)}</Text>
      ),
    },
    {
      title: '会话ID',
      dataIndex: 'sessionId',
      key: 'sessionId',
      width: 180,
      render: (sessionId: string | null) => truncateText(sessionId, 25),
    },
    {
      title: '用户ID',
      dataIndex: 'userId',
      key: 'userId',
      width: 120,
      render: (userId: string | null) => userId || '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 90,
      render: (status: string | null) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
    },
    {
      title: '输入Token数',
      dataIndex: 'inputTokens',
      key: 'inputTokens',
      width: 110,
      render: (inputTokens: number | null) => inputTokens ?? '-',
    },
    {
      title: '输出Token数',
      dataIndex: 'outputTokens',
      key: 'outputTokens',
      width: 110,
      render: (outputTokens: number | null) => outputTokens ?? '-',
    },
    {
      title: '输入内容',
      dataIndex: 'input',
      key: 'input',
      ellipsis: true,
      render: (input: string | null) => truncateText(input, 40),
    },
    {
      title: '输出内容',
      dataIndex: 'output',
      key: 'output',
      ellipsis: true,
      render: (output: string | null) => truncateText(output, 40),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={behaviorLogs}
      rowKey="id"
      loading={logsLoading}
      pagination={{
        pageSize: 20,
        showSizeChanger: true,
        showTotal: (total) => `共 ${total} 条记录`,
        pageSizeOptions: ['10', '20', '50', '100'],
      }}
      scroll={{ x: 1400 }}
      locale={{
        emptyText: (
          <div className={styles.emptyState}>
            <div className={styles.emptyText}>暂无行为日志数据</div>
          </div>
        ),
      }}
    />
  );
};

export default BehaviorLogTab;
