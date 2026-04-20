import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Card,
  Input,
  Dropdown,
  message,
  Popconfirm,
  Segmented,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
  DeleteOutlined,
  BarChartOutlined,
  TableOutlined,
  MoreOutlined,
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
import EnhancedTable from '../../components/EnhancedTable';
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
      render: (text: string, record: any) => (
        <a onClick={() => handleNameClick(record)} className={styles.nameLink}>
          {text}
        </a>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text: string | null) => text || '-',
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
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_: any, record: any) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'edit',
                icon: <EditOutlined />,
                label: '编辑',
                onClick: () => handleEdit(record),
              },
              {
                key: 'delete',
                icon: <DeleteOutlined />,
                label: (
                  <Popconfirm
                    title="确认删除"
                    description="删除后无法恢复，是否继续？"
                    onConfirm={() => handleDelete(record.id)}
                    okText="确认"
                    cancelText="取消"
                  >
                    <span style={{ color: '#ff4d4f' }}>删除</span>
                  </Popconfirm>
                ),
              },
            ],
          }}
          trigger={['click']}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

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
      <Card>
        <div className="eva-toolbar">
          <div className="eva-toolbarGroup">
            <Input
              placeholder="按名称搜索"
              prefix={<SearchOutlined />}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onPressEnter={handleSearch}
              className={styles.searchInput}
              allowClear
            />
            <Button icon={<FilterOutlined />}>筛选 (0)</Button>
          </div>
        </div>
      </Card>

      <EnhancedTable
        columns={columns}
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
