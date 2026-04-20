import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Card,
  Button,
  Input,
  Select,
  Space,
  Dropdown,
  message,
  Typography,
  Tooltip,
  Badge,
  Statistic,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
  ReloadOutlined,
  BarChartOutlined,
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
import PageContainer from '../../components/page/PageContainer';
import EnhancedTable, { type ColumnConfig } from '../../components/EnhancedTable';
import styles from './EvalTaskListPage.module.scss';

const { Text, Link } = Typography;
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
          className={styles.shortIdBadge}
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
              className={styles.codeBadge}
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

  const columnConfigs: ColumnConfig[] = columns
    .filter((col: any) => col.key)
    .map((col: any) => ({
      key: col.key as string,
      title: typeof col.title === 'string' ? col.title : String(col.key),
    }));

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

  const runningTaskCount = tasks.filter((task) => task.status === EvalTaskStatus.RUNNING).length;
  const finishedTaskCount = tasks.filter(
    (task) =>
      task.status === EvalTaskStatus.SUCCESS ||
      task.status === EvalTaskStatus.FAILED ||
      task.status === EvalTaskStatus.ABORTED
  ).length;

  return (
    <PageContainer
      extra={
        <>
          <Tooltip title="刷新列表">
            <Button icon={<ReloadOutlined />} onClick={loadData}>
              刷新
            </Button>
          </Tooltip>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/eval/tasks/create')}
          >
            新建评测任务
          </Button>
        </>
      }
      content={
        <div className="eva-panelGrid">
          <Card className="eva-statCard">
            <Statistic title="任务总量" value={total} suffix={<Text className="eva-muted">条</Text>} />
          </Card>
          <Card className="eva-statCard">
            <Statistic title="运行中任务" value={runningTaskCount} suffix={<Text className="eva-muted">个</Text>} />
          </Card>
          <Card className="eva-statCard">
            <Statistic title="已完成任务" value={finishedTaskCount} suffix={<Text className="eva-muted">个</Text>} />
          </Card>
        </div>
      }
    >
      <Card>
        <div className={`eva-toolbar ${styles.toolbar}`}>
          <div className="eva-toolbarGroup">
            <Input
              placeholder="按名称搜索"
              prefix={<SearchOutlined />}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onPressEnter={loadData}
              className={styles.searchInput}
              allowClear
            />
            <Select
              placeholder="评测集"
              allowClear
              className={styles.evalSetSelect}
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
              className={styles.statusSelect}
              value={selectedStatus}
              onChange={setSelectedStatus}
            >
              {Object.entries(EVAL_TASK_STATUS_LABELS).map(([key, label]) => (
                <Option key={key} value={key}>
                  {label}
                </Option>
              ))}
            </Select>
            <Button icon={<FilterOutlined />}>高级筛选</Button>
          </div>

          <div className="eva-toolbarGroup">
            <Dropdown menu={{ items: batchMenuItems }}>
              <Button>
                批量操作 <DownOutlined />
              </Button>
            </Dropdown>
            <Tooltip title="图表视图">
              <Button icon={<BarChartOutlined />} />
            </Tooltip>
            <Link href="#">帮助文档</Link>
          </div>
        </div>
      </Card>

      <EnhancedTable<EvalTaskWithEvalSet>
        rowKey="id"
        rowSelection={rowSelection}
        columns={columns}
        columnConfigs={columnConfigs}
        dataSource={tasks}
        loading={loading}
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条`,
          onChange: (p, ps) => {
            dispatch(setPage(p));
            dispatch(setPageSize(ps));
          },
        }}
      />
    </PageContainer>
  );
};

export default EvalTaskListPage;
