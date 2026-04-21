import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Input,
  message,
  Popconfirm,
  Segmented,
  Space,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
  DeleteOutlined,
  BarChartOutlined,
  TableOutlined,
  EditOutlined,
} from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import {
  fetchPrompts,
  deletePrompt,
  setCurrentPrompt,
} from '../../store/promptSlice';
import CreatePromptModal from './components/CreatePromptModal';
import PageContainer from '../../components/page/PageContainer';
import EnhancedTable, { type ColumnConfig } from '../../components/EnhancedTable';
import { formatDateTime } from '../../utils/format';
import styles from './Prompt.module.scss';

const PromptListPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { prompts, total, loading } = useAppSelector((state) => state.prompt);

  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'table' | 'chart'>('table');

  useEffect(() => {
    loadPrompts();
  }, [page, pageSize]);

  const loadPrompts = () => {
    dispatch(fetchPrompts({ page, pageSize, keyword }));
  };

  const handleSearch = () => {
    setPage(1);
    loadPrompts();
  };

  const handleDelete = async (id: string) => {
    try {
      await dispatch(deletePrompt(id)).unwrap();
      message.success('删除成功');
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleEdit = (record: any) => {
    setEditingPrompt(record);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingPrompt(null);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingPrompt(null);
  };

  const handleSuccess = () => {
    handleModalClose();
    loadPrompts();
  };

  const handleNameClick = (record: any) => {
    dispatch(setCurrentPrompt(record));
    navigate(`/eval/prompts/${record.id}`);
  };

  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      ellipsis: { showTitle: false },
      render: (text: string, record: any) => (
        <Tooltip title={text} placement="topLeft">
          <a onClick={() => handleNameClick(record)} className={styles.nameLink}>
            {text}
          </a>
        </Tooltip>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      width: 300,
      ellipsis: { showTitle: false },
      render: (text: string | null) => (
        <Tooltip title={text || '-'} placement="topLeft">
          <span>{text || '-'}</span>
        </Tooltip>
      ),
    },
    {
      title: '版本号',
      dataIndex: 'version',
      key: 'version',
      width: 100,
      render: (version: number) => `v${version}`,
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 180,
      render: (date: string) => formatDateTime(date),
    },
    {
      title: '操作',
      key: 'action',
      width: 160,
      render: (_: any, record: any) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确认删除"
            description="删除后无法恢复，是否继续？"
            onConfirm={() => handleDelete(record.id)}
            okText="确认"
            cancelText="取消"
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
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

  return (
    <PageContainer
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
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            新建 Prompt
          </Button>
        </>
      }
    >
      <div className="eva-filterBar">
        <div className="eva-filterBarMain">
          <div className="eva-filterField">
            <span className="eva-filterFieldLabel">搜索</span>
            <Input
              placeholder="按名称搜索 Prompt"
              prefix={<SearchOutlined />}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onPressEnter={handleSearch}
              className={styles.searchInput}
              allowClear
            />
          </div>
        </div>
        <div className="eva-filterBarActions">
          <Button icon={<FilterOutlined />}>筛选 (0)</Button>
        </div>
      </div>

      <div className="eva-contentCard">
        <div className="eva-contentCardBody">
          <EnhancedTable
        columns={columns}
        columnConfigs={columnConfigs}
        dataSource={prompts}
        rowKey="id"
        loading={loading}
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条`,
          onChange: (p, ps) => {
            setPage(p);
            if (ps) setPageSize(ps);
          },
        }}
      />
        </div>
      </div>

      <CreatePromptModal
        open={isModalOpen}
        onCancel={handleModalClose}
        onSuccess={handleSuccess}
        initialValues={editingPrompt}
      />
    </PageContainer>
  );
};

export default PromptListPage;
