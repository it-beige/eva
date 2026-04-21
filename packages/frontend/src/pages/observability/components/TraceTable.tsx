import { Tag, Tooltip, Button, Typography } from 'antd';
import EnhancedTable from '../../../components/EnhancedTable';
import { EyeOutlined } from '@ant-design/icons';
import { useAppSelector, useAppDispatch } from '../../../hooks/useRedux';
import { setPage, setPageSize } from '../../../store/observabilitySlice';
import type { TraceLog } from '../../../types/observability';
import { formatDateTime } from '../../../utils/format';
import styles from './TraceTable.module.scss';

const { Text } = Typography;

interface TraceTableProps {
  onViewDetail: (id: string) => void;
}

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

const TraceTable = ({ onViewDetail }: TraceTableProps) => {
  const dispatch = useAppDispatch();
  const { traces, total, currentPage, pageSize, loading } = useAppSelector(
    (state) => state.observability
  );

  const handlePageChange = (page: number, _size?: number) => {
    dispatch(setPage(page));
  };

  const handlePageSizeChange = (_current: number, size: number) => {
    dispatch(setPageSize(size));
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
      title: '来源项目',
      dataIndex: 'sourceProject',
      key: 'sourceProject',
      width: 140,
      ellipsis: { showTitle: false },
      render: (sourceProject: string | null) => (
        <Tooltip placement="topLeft" title={sourceProject || '-'}>
          <Text>{sourceProject || '-'}</Text>
        </Tooltip>
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
          <Text>{sessionId || '-'}</Text>
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
          <Text>{userId || '-'}</Text>
        </Tooltip>
      ),
    },
    {
      title: '首次token响应时间',
      dataIndex: 'ttft',
      key: 'ttft',
      width: 150,
      render: (ttft: number | null) => (
        <Text>{ttft !== null ? `${ttft}ms` : '-'}</Text>
      ),
    },
    {
      title: '输入Token数',
      dataIndex: 'inputTokens',
      key: 'inputTokens',
      width: 110,
      render: (inputTokens: number | null) => (
        <Text>{inputTokens ?? '-'}</Text>
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
      title: '输入',
      dataIndex: 'input',
      key: 'input',
      width: 200,
      ellipsis: { showTitle: false },
      render: (input: string | null) => (
        <Tooltip placement="topLeft" title={input || '-'}>
          <Text>{input || '-'}</Text>
        </Tooltip>
      ),
    },
    {
      title: '输出',
      dataIndex: 'output',
      key: 'output',
      width: 200,
      ellipsis: { showTitle: false },
      render: (output: string | null) => (
        <Tooltip placement="topLeft" title={output || '-'}>
          <Text>{output || '-'}</Text>
        </Tooltip>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      fixed: 'right' as const,
      render: (_: any, record: TraceLog) => (
        <Button
          type="link"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => onViewDetail(record.id)}
        >
          查看详情
        </Button>
      ),
    },
  ];

  return (
    <EnhancedTable
      columns={columns}
      dataSource={traces}
      rowKey="id"
      loading={loading}
      pagination={{
        current: currentPage,
        pageSize: pageSize,
        total: total,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total) => `共 ${total} 条记录`,
        pageSizeOptions: ['10', '20', '50', '100'],
        onChange: handlePageChange,
        onShowSizeChange: handlePageSizeChange,
      }}
      scroll={{ x: 1600 }}
      locale={{
        emptyText: (
          <div className={styles.emptyState}>
            <div className={styles.emptyText}>暂无数据</div>
          </div>
        ),
      }}
    />
  );
};

export default TraceTable;
