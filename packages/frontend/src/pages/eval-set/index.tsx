import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Button,
  Input,
  Space,
  Tag,
  Tooltip,
  Popconfirm,
  message,
  Badge,
  Segmented,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
  DeleteOutlined,
  BarChartOutlined,
  TableOutlined,
  PlayCircleOutlined,
  CodeOutlined,
} from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import {
  fetchEvalSets,
  deleteEvalSet,
  createEvalSet,
  setKeyword,
  setPage,
  setPageSize,
} from '../../store/evalSetSlice';
import { CreateEvalSetModal } from './components/CreateEvalSetModal';
import PageContainer from '../../components/page/PageContainer';
import { EvalSet, EvalSetType } from '@eva/shared';
import { ColumnsType } from 'antd/es/table';
import EnhancedTable, { type ColumnConfig } from '../../components/EnhancedTable';
import styles from './EvalSetPage.module.scss';

const EVAL_SET_TYPE_COLORS: Record<string, string> = {
  [EvalSetType.TEXT]: 'blue',
  [EvalSetType.CODE]: 'green',
};

const EVAL_SET_TYPE_LABELS: Record<string, string> = {
  [EvalSetType.TEXT]: '文本',
  [EvalSetType.CODE]: 'Code',
};

const EvalSetListPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const {
    evalSets,
    total,
    page,
    pageSize,
    loading,
    creating,
    keyword,
  } = useAppSelector((state) => state.evalSet);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'table' | 'chart'>('table');

  const loadData = useCallback(() => {
    dispatch(
      fetchEvalSets({
        page,
        pageSize,
        keyword: keyword || undefined,
      }),
    );
  }, [dispatch, page, pageSize, keyword]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSearch = (value: string) => {
    dispatch(setKeyword(value));
    dispatch(setPage(1));
  };

  const handleDelete = async (id: string) => {
    try {
      await dispatch(deleteEvalSet(id)).unwrap();
      message.success('删除成功');
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleBatchDelete = async () => {
    try {
      await Promise.all(selectedRowKeys.map((id) => dispatch(deleteEvalSet(id)).unwrap()));
      message.success('批量删除成功');
      setSelectedRowKeys([]);
    } catch (error) {
      message.error('批量删除失败');
    }
  };

  const handleCreateSubmit = async (values: {
    name: string;
    type: EvalSetType;
    description?: string;
    sourceType: string;
    gitRepoUrl?: string;
    publicEvalSetId?: string;
  }) => {
    try {
      await dispatch(createEvalSet(values)).unwrap();
      message.success('创建成功');
      setCreateModalOpen(false);
    } catch (error) {
      message.error('创建失败');
    }
  };

  const handleStartEval = (evalSet: EvalSet) => {
    navigate(`/eval/tasks/create?evalSetId=${evalSet.id}`);
  };

  const columns: ColumnsType<EvalSet> = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (name: string, record: EvalSet) => (
        <a
          className={styles.nameLink}
          onClick={() => navigate(`/eval/datasets/${record.id}`)}
        >
          {name}
        </a>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) => (
        <Tag color={EVAL_SET_TYPE_COLORS[type]}>
          {EVAL_SET_TYPE_LABELS[type]}
        </Tag>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      width: 250,
      ellipsis: true,
      render: (desc: string | null) => desc || '-',
    },
    {
      title: '数据项',
      dataIndex: 'dataCount',
      key: 'dataCount',
      width: 100,
      align: 'center',
      render: (count: number) => <Badge count={count} showZero color="#5B21B6" />,
    },
    {
      title: '上次评测时间',
      dataIndex: 'lastEvalTime',
      key: 'lastEvalTime',
      width: 160,
      render: (time: string | null) =>
        time ? new Date(time).toLocaleString() : '-',
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: '创建人',
      dataIndex: 'createdBy',
      key: 'createdBy',
      width: 120,
      render: (creator: string | null) => creator || '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_: unknown, record: EvalSet) => (
        <Space size="small">
          {record.type === 'code' && (
            <Tooltip title="查看代码">
              <Button
                type="link"
                size="small"
                icon={<CodeOutlined />}
                onClick={() => navigate(`/eval/datasets/${record.id}/code`)}
              >
                查看代码
              </Button>
            </Tooltip>
          )}
          <Tooltip title="发起评测">
            <Button
              type="link"
              size="small"
              icon={<PlayCircleOutlined />}
              onClick={() => handleStartEval(record)}
            >
              发起评测
            </Button>
          </Tooltip>
          <Popconfirm
            title="确认删除"
            description="确定要删除这个评测集吗？此操作不可恢复。"
            onConfirm={() => handleDelete(record.id)}
            okText="确认"
            cancelText="取消"
          >
            <Button type="link" danger size="small" icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
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
    selectedRowKeys,
    onChange: (keys: React.Key[]) => {
      setSelectedRowKeys(keys as string[]);
    },
  };

  return (
    <PageContainer
      description="评测集是用于评测评估对象的一组数据。它通常包含输入数据和预期的输出结果、实际输出结果，验证评估对象的效果。"
      extra={
        <>
          <Segmented
            value={viewMode}
            onChange={(value) => setViewMode(value as 'table' | 'chart')}
            options={[
              { value: 'table', icon: <TableOutlined /> },
              { value: 'chart', icon: <BarChartOutlined /> },
            ]}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateModalOpen(true)}
          >
            新建评测集
          </Button>
        </>
      }
    >
      <Card>
        <div className="eva-toolbar">
          <div className="eva-toolbarGroup">
            <Input
              placeholder="按名称搜索"
              prefix={<SearchOutlined />}
              value={keyword}
              onChange={(e) => handleSearch(e.target.value)}
              className={styles.searchInput}
              allowClear
            />
            <Button icon={<FilterOutlined />}>筛选 (0)</Button>
            {selectedRowKeys.length > 0 && (
              <Popconfirm
                title="确认批量删除"
                description={`确定要删除选中的 ${selectedRowKeys.length} 个评测集吗？`}
                onConfirm={handleBatchDelete}
                okText="确认"
                cancelText="取消"
              >
                <Button danger icon={<DeleteOutlined />}>
                  删除 ({selectedRowKeys.length})
                </Button>
              </Popconfirm>
            )}
          </div>
        </div>
      </Card>

      <EnhancedTable<EvalSet>
        rowKey="id"
        dataSource={evalSets}
        columns={columns}
        columnConfigs={columnConfigs}
        loading={loading}
        rowSelection={rowSelection}
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (t) => `共 ${t} 条`,
          onChange: (p, ps) => {
            dispatch(setPage(p));
            if (ps) dispatch(setPageSize(ps));
          },
        }}
        scroll={{ x: 'max-content' }}
      />

      <CreateEvalSetModal
        open={createModalOpen}
        onCancel={() => setCreateModalOpen(false)}
        onSubmit={handleCreateSubmit}
        loading={creating}
      />
    </PageContainer>
  );
};

export default EvalSetListPage;
