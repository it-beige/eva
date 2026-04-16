import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Card,
  Table,
  Button,
  Input,
  Select,
  Space,
  Dropdown,
  message,
  Typography,
  Tooltip,
  Badge,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
  ReloadOutlined,
  BarChartOutlined,
  MoreOutlined,
  CopyOutlined,
  PauseCircleOutlined,
  FileTextOutlined,
  DownOutlined,
} from '@ant-design/icons';
import { AppDispatch, RootState } from '../../app/store';
import {
  fetchEvalTasks,
  copyEvalTask,
  abortEvalTask,
  batchAbortEvalTasks,
  batchDeleteEvalTasks,
  setPage,
  setPageSize,
  setSelectedTaskIds,
} from '../../store/evalTaskSlice';
import { fetchEvalSets } from '../../store/evalSetSlice';
import TaskStatusTag from './components/TaskStatusTag';
import { EvalTaskStatus, EVAL_TASK_STATUS_LABELS } from '@eva/shared';
import type { ColumnsType } from 'antd/es/table';
import type { EvalTaskWithEvalSet } from '../../services/evalTaskApi';

const { Title, Text, Link } = Typography;
const { Option } = Select;

const EvalTaskListPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { tasks, loading, total, page, pageSize, selectedTaskIds } = useSelector(
    (state: RootState) => state.evalTask
  );
  const { evalSets } = useSelector((state: RootState) => state.evalSet);

  const [keyword, setKeyword] = useState('');
  const [selectedEvalSetId, setSelectedEvalSetId] = useState<string | undefined>();
  const [selectedStatus, setSelectedStatus] = useState<EvalTaskStatus | undefined>();

  const loadData = useCallback(() => {
    dispatch(
      fetchEvalTasks({
        page,
        pageSize,
        keyword: keyword || undefined,
        evalSetId: selectedEvalSetId,
        status: selectedStatus,
      })
    );
  }, [dispatch, page, pageSize, keyword, selectedEvalSetId, selectedStatus]);

  useEffect(() => {
    loadData();
    dispatch(fetchEvalSets({ pageSize: 100 }));
  }, [loadData, dispatch]);

  const handleCopy = async (id: string) => {
    try {
      await dispatch(copyEvalTask(id)).unwrap();
      message.success('复制成功');
      loadData();
    } catch (error) {
      message.error('复制失败');
    }
  };

  const handleAbort = async (id: string) => {
    try {
      await dispatch(abortEvalTask(id)).unwrap();
      message.success('中止成功');
      loadData();
    } catch (error) {
      message.error('中止失败');
    }
  };

  const handleBatchAbort = async () => {
    if (selectedTaskIds.length === 0) {
      message.warning('请先选择任务');
      return;
    }
    try {
      await dispatch(batchAbortEvalTasks(selectedTaskIds)).unwrap();
      message.success('批量中止成功');
      loadData();
    } catch (error) {
      message.error('批量中止失败');
    }
  };

  const handleBatchDelete = async () => {
    if (selectedTaskIds.length === 0) {
      message.warning('请先选择任务');
      return;
    }
    try {
      await dispatch(batchDeleteEvalTasks(selectedTaskIds)).unwrap();
      message.success('批量删除成功');
      loadData();
    } catch (error) {
      message.error('批量删除失败');
    }
  };

  const columns: ColumnsType<EvalTaskWithEvalSet> = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record) => (
        <Link onClick={() => navigate(`/eval/tasks/${record.id}`)}>{text}</Link>
      ),
    },
    {
      title: 'ID',
      dataIndex: 'shortId',
      key: 'shortId',
      width: 100,
      render: (text: string) => (
        <Badge
          count={text}
          style={{
            backgroundColor: '#f0f0f0',
            color: '#666',
            fontSize: 12,
            fontFamily: 'monospace',
          }}
        />
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (status: EvalTaskStatus, record) => (
        <TaskStatusTag status={status} progress={record.progress} />
      ),
    },
    {
      title: '评测集',
      dataIndex: 'evalSet',
      key: 'evalSet',
      render: (evalSet: { name: string; type: string } | null | undefined) => (
        <Space>
          <span>{evalSet?.name || '-'}</span>
          {evalSet?.type === 'code' && (
            <Badge
              count="Code"
              style={{
                backgroundColor: '#e6f7ff',
                color: '#1890ff',
                fontSize: 11,
              }}
            />
          )}
        </Space>
      ),
    },
    {
      title: '任务组',
      dataIndex: 'taskGroupId',
      key: 'taskGroupId',
      render: (text: string | null) => text || '-',
    },
    {
      title: '评估模型',
      dataIndex: 'evalModelId',
      key: 'evalModelId',
      render: (text: string | null) => text || '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="复制">
            <Button
              type="link"
              size="small"
              icon={<CopyOutlined />}
              onClick={() => handleCopy(record.id)}
            >
              复制
            </Button>
          </Tooltip>
          {record.status === EvalTaskStatus.RUNNING && (
            <Tooltip title="中止">
              <Button
                type="link"
                size="small"
                danger
                icon={<PauseCircleOutlined />}
                onClick={() => handleAbort(record.id)}
              >
                中止
              </Button>
            </Tooltip>
          )}
          <Tooltip title="日志">
            <Button
              type="link"
              size="small"
              icon={<FileTextOutlined />}
              onClick={() => navigate(`/eval/tasks/${record.id}`)}
            >
              日志
            </Button>
          </Tooltip>
          <Dropdown
            menu={{
              items: [
                {
                  key: 'detail',
                  label: '查看详情',
                  onClick: () => navigate(`/eval/tasks/${record.id}`),
                },
              ],
            }}
          >
            <Button type="link" size="small">
              更多 <DownOutlined />
            </Button>
          </Dropdown>
        </Space>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys: selectedTaskIds,
    onChange: (selectedRowKeys: React.Key[]) => {
      dispatch(setSelectedTaskIds(selectedRowKeys as string[]));
    },
  };

  const batchMenuItems = [
    { key: 'abort', label: '批量中止', onClick: handleBatchAbort },
    { key: 'delete', label: '批量删除', onClick: handleBatchDelete },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card bordered={false}>
        <div style={{ marginBottom: 24 }}>
          <Title level={4} style={{ margin: 0 }}>
            评测任务
          </Title>
          <Text type="secondary">
            评测任务帮助您测试Prompt和模型，对比不同版本，并跟踪问题改进。
            <Link href="#" style={{ marginLeft: 8 }}>
              帮助文档
            </Link>
          </Text>
        </div>

        <Space wrap style={{ marginBottom: 16 }}>
          <Input
            placeholder="按名称搜索"
            prefix={<SearchOutlined />}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onPressEnter={loadData}
            style={{ width: 200 }}
            allowClear
          />
          <Select
            placeholder="评测集"
            allowClear
            style={{ width: 160 }}
            value={selectedEvalSetId}
            onChange={setSelectedEvalSetId}
          >
            {evalSets.map((es) => (
              <Option key={es.id} value={es.id}>
                {es.name}
              </Option>
            ))}
          </Select>
          <Select
            placeholder="任务状态"
            allowClear
            style={{ width: 140 }}
            value={selectedStatus}
            onChange={setSelectedStatus}
          >
            {Object.entries(EVAL_TASK_STATUS_LABELS).map(([key, label]) => (
              <Option key={key} value={key}>
                {label}
              </Option>
            ))}
          </Select>
          <Button icon={<FilterOutlined />}>
            筛选 (0)
          </Button>
          <Dropdown menu={{ items: batchMenuItems }}>
            <Button>
              批量操作 <DownOutlined />
            </Button>
          </Dropdown>
          <Tooltip title="刷新">
            <Button icon={<ReloadOutlined />} onClick={loadData} />
          </Tooltip>
          <Tooltip title="图表">
            <Button icon={<BarChartOutlined />} />
          </Tooltip>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/eval/tasks/create')}
          >
            新建评测任务
          </Button>
        </Space>

        <Table
          rowKey="id"
          rowSelection={rowSelection}
          columns={columns}
          dataSource={tasks}
          loading={loading}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
            onChange: (page, pageSize) => {
              dispatch(setPage(page));
              dispatch(setPageSize(pageSize));
            },
          }}
        />
      </Card>
    </div>
  );
};

export default EvalTaskListPage;
