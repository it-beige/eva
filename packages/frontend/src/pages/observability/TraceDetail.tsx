import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Descriptions,
  Tag,
  Typography,
  Button,
  Row,
  Col,
  Spin,
  Empty,
} from 'antd';
import { ArrowLeftOutlined, CopyOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { fetchTraceDetail, clearSelectedTrace } from '../../store/observabilitySlice';
import dayjs from 'dayjs';
import styles from './TraceDetail.module.scss';

const { Title, Text, Paragraph } = Typography;

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

const TraceDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { selectedTrace, detailLoading } = useAppSelector((state) => state.observability);

  useEffect(() => {
    if (id) {
      dispatch(fetchTraceDetail(id));
    }
    return () => {
      dispatch(clearSelectedTrace());
    };
  }, [id, dispatch]);

  const handleBack = () => {
    navigate('/observability/traces');
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (detailLoading) {
    return (
      <div className={styles.loadingState}>
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  if (!selectedTrace) {
    return (
      <div className={styles.emptyState}>
        <Card>
          <Empty description="未找到Trace记录" />
          <div className={styles.emptyActions}>
            <Button type="primary" onClick={handleBack}>
              返回列表
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.breadcrumb}>
        <Button
          type="link"
          icon={<ArrowLeftOutlined />}
          onClick={handleBack}
          className={styles.backButton}
        >
          调用明细
        </Button>
        <Text type="secondary"> &gt; </Text>
        <Text>{selectedTrace.traceId}</Text>
      </div>

      <Title level={4} className={styles.pageTitle}>
        Trace 详情
      </Title>

      <Card title="基本信息" bordered={false} className={styles.sectionCard}>
        <Descriptions bordered column={2}>
          <Descriptions.Item label="Trace ID">
            <Text copyable={{ text: selectedTrace.traceId }}>
              {selectedTrace.traceId}
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="调用时间">
            {dayjs(selectedTrace.calledAt).format('YYYY-MM-DD HH:mm:ss')}
          </Descriptions.Item>
          <Descriptions.Item label="会话ID">
            {selectedTrace.sessionId || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="用户ID">
            {selectedTrace.userId || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="节点ID">
            {selectedTrace.nodeId || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Message ID">
            {selectedTrace.messageId || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="来源项目">
            {selectedTrace.sourceProject || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="状态">
            <Tag
              className={
                selectedTrace.status === 'success'
                  ? 'eva-pillTagGreen'
                  : selectedTrace.status === 'error'
                    ? 'eva-pillTagRed'
                    : selectedTrace.status === 'timeout'
                      ? 'eva-pillTagOrange'
                      : selectedTrace.status === 'pending'
                        ? 'eva-pillTagBlue'
                        : undefined
              }
            >
              {getStatusText(selectedTrace.status)}
            </Tag>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="性能指标" bordered={false} className={styles.sectionCard}>
        <Row gutter={24}>
          <Col span={8}>
            <Card size="small">
              <Statistic
                title="首次Token响应时间"
                value={selectedTrace.ttft !== null ? `${selectedTrace.ttft}ms` : '-'}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small">
              <Statistic
                title="输入Token数"
                value={selectedTrace.inputTokens ?? '-'}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small">
              <Statistic
                title="输出Token数"
                value={selectedTrace.outputTokens ?? '-'}
              />
            </Card>
          </Col>
        </Row>
      </Card>

      <Card
        title="输入内容"
        bordered={false}
        className={styles.sectionCard}
        extra={
          selectedTrace.input && (
            <Button
              type="text"
              icon={<CopyOutlined />}
              onClick={() => handleCopy(selectedTrace.input || '')}
            >
              复制
            </Button>
          )
        }
      >
        {selectedTrace.input ? (
          <Paragraph className={styles.contentBlock}>
            {selectedTrace.input}
          </Paragraph>
        ) : (
          <Text type="secondary">无输入内容</Text>
        )}
      </Card>

      <Card
        title="输出内容"
        bordered={false}
        extra={
          selectedTrace.output && (
            <Button
              type="text"
              icon={<CopyOutlined />}
              onClick={() => handleCopy(selectedTrace.output || '')}
            >
              复制
            </Button>
          )
        }
      >
        {selectedTrace.output ? (
          <Paragraph className={styles.contentBlock}>
            {selectedTrace.output}
          </Paragraph>
        ) : (
          <Text type="secondary">无输出内容</Text>
        )}
      </Card>

      <div className={styles.footerAction}>
        <Button type="primary" onClick={handleBack} icon={<ArrowLeftOutlined />}>
          返回列表
        </Button>
      </div>
    </div>
  );
};

// 简单的统计组件
const Statistic = ({ title, value }: { title: string; value: string | number }) => (
  <div className={styles.statistic}>
    <div className={styles.statLabel}>{title}</div>
    <div className={styles.statValue}>{value}</div>
  </div>
);

export default TraceDetailPage;
