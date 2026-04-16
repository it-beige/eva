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

const { Title, Text, Paragraph } = Typography;

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
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  if (!selectedTrace) {
    return (
      <div style={{ padding: '24px' }}>
        <Card>
          <Empty description="未找到Trace记录" />
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <Button type="primary" onClick={handleBack}>
              返回列表
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* 面包屑 */}
      <div style={{ marginBottom: 24 }}>
        <Button
          type="link"
          icon={<ArrowLeftOutlined />}
          onClick={handleBack}
          style={{ paddingLeft: 0 }}
        >
          调用明细
        </Button>
        <Text type="secondary"> &gt; </Text>
        <Text>{selectedTrace.traceId}</Text>
      </div>

      {/* 标题 */}
      <Title level={4} style={{ marginBottom: 24 }}>
        Trace 详情
      </Title>

      {/* 基本信息卡片 */}
      <Card title="基本信息" bordered={false} style={{ marginBottom: 24 }}>
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
            <Tag color={getStatusColor(selectedTrace.status)}>
              {getStatusText(selectedTrace.status)}
            </Tag>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* 性能指标卡片 */}
      <Card title="性能指标" bordered={false} style={{ marginBottom: 24 }}>
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

      {/* 输入内容 */}
      <Card
        title="输入内容"
        bordered={false}
        style={{ marginBottom: 24 }}
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
          <Paragraph
            style={{
              background: '#f5f5f5',
              padding: 16,
              borderRadius: 4,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {selectedTrace.input}
          </Paragraph>
        ) : (
          <Text type="secondary">无输入内容</Text>
        )}
      </Card>

      {/* 输出内容 */}
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
          <Paragraph
            style={{
              background: '#f5f5f5',
              padding: 16,
              borderRadius: 4,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {selectedTrace.output}
          </Paragraph>
        ) : (
          <Text type="secondary">无输出内容</Text>
        )}
      </Card>

      {/* 返回按钮 */}
      <div style={{ marginTop: 24, textAlign: 'center' }}>
        <Button type="primary" onClick={handleBack} icon={<ArrowLeftOutlined />}>
          返回列表
        </Button>
      </div>
    </div>
  );
};

// 简单的统计组件
const Statistic = ({ title, value }: { title: string; value: string | number }) => (
  <div style={{ textAlign: 'center' }}>
    <div style={{ color: '#666', fontSize: 14, marginBottom: 8 }}>{title}</div>
    <div style={{ color: '#333', fontSize: 24, fontWeight: 'bold' }}>{value}</div>
  </div>
);

export default TraceDetailPage;
