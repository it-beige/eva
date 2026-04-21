import { Tag, Tooltip, Typography } from 'antd';
import EnhancedTable from '../../../components/EnhancedTable';
import { useAppSelector } from '../../../hooks/useRedux';
import { formatDateTime } from '../../../utils/format';
import styles from './BehaviorLogTab.module.scss';

const { Text } = Typography;

const BehaviorLogTab = () => {
  const { behaviorLogs, logsLoading } = useAppSelector((state) => state.observability);

  const getStatusClassName = (status: string | null): string | undefined => {
    switch (status) {
      case 'success':
        return 'eva-pillTagGreen';
      case 'error':
        return 'eva-pillTagRed';
      case 'pending':
        return 'eva-pillTagBlue';
      case 'timeout':
        return 'eva-pillTagOrange';
      default:
        return undefined;
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
        <Text>{formatDateTime(calledAt)}</Text>
      ),
    },
    {
      title: 'TraceId',
      dataIndex: 'traceId',
      key: 'traceId',
      width: 220,
      ellipsis: { showTitle: false },
      render: (traceId: string) => (
        <Tooltip placement="topLeft" title={traceId}>
          <Text copyable={{ text: traceId }} className={styles.traceIdText}>
            {traceId}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: '会话ID',
      dataIndex: 'sessionId',
      key: 'sessionId',
      width: 180,
      ellipsis: { showTitle: false },
      render: (sessionId: string | null) => (
        <Tooltip placement="topLeft" title={sessionId || '-'}>
          <span>{sessionId || '-'}</span>
        </Tooltip>
      ),
    },
    {
      title: '用户ID',
      dataIndex: 'userId',
      key: 'userId',
      width: 120,
      ellipsis: { showTitle: false },
      render: (userId: string | null) => (
        <Tooltip placement="topLeft" title={userId || '-'}>
          <span>{userId || '-'}</span>
        </Tooltip>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 90,
      render: (status: string | null) => (
        <Tag className={getStatusClassName(status)}>{getStatusText(status)}</Tag>
      ),
    },
    {
      title: '输入Token数',
      dataIndex: 'inputTokens',
      key: 'inputTokens',
      width: 110,
      align: 'center' as const,
      render: (inputTokens: number | null) => inputTokens ?? '-',
    },
    {
      title: '输出Token数',
      dataIndex: 'outputTokens',
      key: 'outputTokens',
      width: 110,
      align: 'center' as const,
      render: (outputTokens: number | null) => outputTokens ?? '-',
    },
    {
      title: '输入内容',
      dataIndex: 'input',
      key: 'input',
      width: 200,
      ellipsis: { showTitle: false },
      render: (input: string | null) => (
        <Tooltip placement="topLeft" title={input || '-'}>
          <span>{input || '-'}</span>
        </Tooltip>
      ),
    },
    {
      title: '输出内容',
      dataIndex: 'output',
      key: 'output',
      width: 200,
      ellipsis: { showTitle: false },
      render: (output: string | null) => (
        <Tooltip placement="topLeft" title={output || '-'}>
          <span>{output || '-'}</span>
        </Tooltip>
      ),
    },
  ];

  return (
    <EnhancedTable
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
