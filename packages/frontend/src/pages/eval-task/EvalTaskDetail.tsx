import React, { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Card,
  Descriptions,
  Button,
  Space,
  Typography,
  Progress,
  message,
  Row,
  Col,
  Badge,
} from 'antd';
import {
  ArrowLeftOutlined,
  CopyOutlined,
  PauseCircleOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { io, Socket } from 'socket.io-client';
import { AppDispatch, RootState } from '../../app/store';
import {
  fetchEvalTaskById,
  fetchEvalTaskLogs,
  copyEvalTask,
  abortEvalTask,
  clearCurrentTask,
  updateTaskProgress,
  updateTaskStatus,
  addLog,
} from '../../store/evalTaskSlice';
import TaskStatusTag from './components/TaskStatusTag';
import { EvalTaskStatus, EVAL_TYPE_LABELS, EVAL_TASK_STATUS_LABELS } from '@eva/shared';

const { Title, Text } = Typography;

const EvalTaskDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const socketRef = useRef<Socket | null>(null);

  const { currentTask, logs, loading } = useSelector((state: RootState) => state.evalTask);

  useEffect(() => {
    if (id) {
      dispatch(fetchEvalTaskById(id));
      dispatch(fetchEvalTaskLogs(id));
    }
    return () => {
      dispatch(clearCurrentTask());
    };
  }, [id, dispatch]);

  // WebSocket连接
  useEffect(() => {
    if (!id) return;

    const socket = io('/eval-tasks');
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('WebSocket connected');
      socket.emit('subscribe', id);
    });

    socket.on('task:progress', (data: { taskId: string; progress: number }) => {
      if (data.taskId === id) {
        dispatch(updateTaskProgress({ taskId: id, progress: data.progress }));
      }
    });

    socket.on('task:status', (data: { taskId: string; status: EvalTaskStatus }) => {
      if (data.taskId === id) {
        dispatch(updateTaskStatus({ taskId: id, status: data.status }));
      }
    });

    socket.on('task:log', (data: { taskId: string; log: string }) => {
      if (data.taskId === id) {
        dispatch(addLog({ taskId: id, log: data.log }));
      }
    });

    socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    return () => {
      socket.emit('unsubscribe', id);
      socket.disconnect();
    };
  }, [id, dispatch]);

  const handleCopy = async () => {
    if (!id) return;
    try {
      await dispatch(copyEvalTask(id)).unwrap();
      message.success('复制成功');
    } catch (error) {
      message.error('复制失败');
    }
  };

  const handleAbort = async () => {
    if (!id) return;
    try {
      await dispatch(abortEvalTask(id)).unwrap();
      message.success('中止成功');
    } catch (error) {
      message.error('中止失败');
    }
  };

  const handleRefresh = () => {
    if (id) {
      dispatch(fetchEvalTaskById(id));
      dispatch(fetchEvalTaskLogs(id));
    }
  };

  if (!currentTask) {
    return (
      <div style={{ padding: 24 }}>
        <Card loading={loading} />
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <Card bordered={false}>
        {/* 头部 */}
        <div style={{ marginBottom: 24 }}>
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/eval/tasks')}>
              返回
            </Button>
            <Title level={4} style={{ margin: 0 }}>
              {currentTask.name}
            </Title>
            <Badge
              count={currentTask.shortId}
              style={{
                backgroundColor: '#f0f0f0',
                color: '#666',
                fontSize: 12,
                fontFamily: 'monospace',
              }}
            />
          </Space>
        </div>

        <Row gutter={24}>
          <Col span={16}>
            {/* 基本信息 */}
            <Card title="基本信息" style={{ marginBottom: 24 }}>
              <Descriptions column={2}>
                <Descriptions.Item label="任务ID">{currentTask.shortId}</Descriptions.Item>
                <Descriptions.Item label="状态">
                  <TaskStatusTag status={currentTask.status} progress={currentTask.progress} />
                </Descriptions.Item>
                <Descriptions.Item label="评测类型">
                  {EVAL_TYPE_LABELS[currentTask.evalType] || currentTask.evalType}
                </Descriptions.Item>
                <Descriptions.Item label="评测模式">
                  {currentTask.evalMode || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="最大并发">
                  {currentTask.maxConcurrency}
                </Descriptions.Item>
                <Descriptions.Item label="评测集">
                  {(currentTask as any).evalSet?.name || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="任务组">
                  {currentTask.taskGroupId || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="评估模型">
                  {currentTask.evalModelId || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="创建时间">
                  {new Date(currentTask.createdAt).toLocaleString()}
                </Descriptions.Item>
                <Descriptions.Item label="更新时间">
                  {new Date(currentTask.updatedAt).toLocaleString()}
                </Descriptions.Item>
              </Descriptions>

              {currentTask.status === EvalTaskStatus.RUNNING && (
                <div style={{ marginTop: 16 }}>
                  <Text type="secondary">当前进度</Text>
                  <Progress
                    percent={Math.round(currentTask.progress)}
                    status="active"
                    strokeColor={{ from: '#108ee9', to: '#87d068' }}
                  />
                </div>
              )}
            </Card>

            {/* 日志 */}
            <Card
              title="执行日志"
              extra={
                <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
                  刷新
                </Button>
              }
            >
              <div
                style={{
                  backgroundColor: '#1e1e1e',
                  color: '#d4d4d4',
                  padding: 16,
                  borderRadius: 4,
                  fontFamily: 'monospace',
                  fontSize: 13,
                  maxHeight: 400,
                  overflow: 'auto',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                }}
              >
                {logs.length > 0 ? (
                  logs.map((log, index) => (
                    <div key={index} style={{ marginBottom: 4 }}>
                      {log}
                    </div>
                  ))
                ) : (
                  <Text type="secondary" style={{ color: '#666' }}>
                    暂无日志
                  </Text>
                )}
              </div>
            </Card>
          </Col>

          <Col span={8}>
            {/* 操作按钮 */}
            <Card title="操作" style={{ marginBottom: 24 }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Button
                  type="primary"
                  icon={<CopyOutlined />}
                  block
                  onClick={handleCopy}
                >
                  复制任务
                </Button>
                {currentTask.status === EvalTaskStatus.RUNNING && (
                  <Button
                    danger
                    icon={<PauseCircleOutlined />}
                    block
                    onClick={handleAbort}
                  >
                    中止任务
                  </Button>
                )}
              </Space>
            </Card>

            {/* 配置信息 */}
            <Card title="配置信息">
              <Descriptions column={1} size="small">
                <Descriptions.Item label="AI应用">
                  {currentTask.appId || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="版本">
                  {currentTask.appVersion || '-'}
                </Descriptions.Item>
                {currentTask.config && (
                  <Descriptions.Item label="扩展配置">
                    <pre
                      style={{
                        backgroundColor: '#f5f5f5',
                        padding: 8,
                        borderRadius: 4,
                        fontSize: 12,
                        maxHeight: 200,
                        overflow: 'auto',
                      }}
                    >
                      {JSON.stringify(currentTask.config, null, 2)}
                    </pre>
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default EvalTaskDetailPage;
