import { useEffect, useState, useCallback } from 'react';
import {
  Card,
  Table,
  Button,
  Input,
  Tag,
  Space,
  Dropdown,
  Pagination,
  Typography,
  Row,
  Col,
  Tooltip,
  Empty,
  Modal,
  message,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
  DeleteOutlined,
  BarChartOutlined,
  MoreOutlined,
  EditOutlined,
  CopyOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import {
  fetchAutoEvals,
  deleteAutoEval,
  deleteAutoEvals,
  setKeyword,
  setPage,
  setPageSize,
  setSelectedRowKeys,
} from '../../store/autoEvalSlice';
import { AutoEvalStatus } from '@eva/shared';
import type { AutoEval } from '@eva/shared';
import type { ColumnsType } from 'antd/es/table';
import styles from './AutoEvalListPage.module.scss';

const { Title, Text } = Typography;

const statusMap: Record<AutoEvalStatus, { color: string; text: string }> = {
  [AutoEvalStatus.ENABLED]: { color: 'success', text: '已启用' },
  [AutoEvalStatus.DISABLED]: { color: 'default', text: '已禁用' },
};

const AutoEvalListPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const {
    items,
    total,
    page,
    pageSize,
    loading,
    deleting,
    keyword,
    selectedRowKeys,
  } = useAppSelector((state) => state.autoEval);

  const [searchValue, setSearchValue] = useState(keyword);

  // 加载数据
  useEffect(() => {
    dispatch(fetchAutoEvals({}));
  }, [dispatch, page, pageSize, keyword]);

  // 搜索防抖
  const handleSearch = useCallback(() => {
    dispatch(setKeyword(searchValue));
  }, [dispatch, searchValue]);

  // 创建新规则
  const handleCreate = () => {
    navigate('/auto-eval/create');
  };

  // 删除单个
  const handleDelete = (record: AutoEval) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除自动化评测规则 "${record.name}" 吗？`,
      onOk: () => {
        dispatch(deleteAutoEval(record.id)).then(() => {
          message.success('删除成功');
        });
      },
    });
  };

  // 批量删除
  const handleBatchDelete = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要删除的规则');
      return;
    }
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除选中的 ${selectedRowKeys.length} 个规则吗？`,
      onOk: () => {
        dispatch(deleteAutoEvals(selectedRowKeys)).then(() => {
          message.success('批量删除成功');
        });
      },
    });
  };

  // 表格列定义
  const columns: ColumnsType<AutoEval> = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: AutoEval) => (
        <a onClick={() => navigate(`/auto-eval/${record.id}`)}>{text}</a>
      ),
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (value: string) => new Date(value).toLocaleString(),
    },
    {
      title: '创建人',
      dataIndex: 'createdBy',
      key: 'createdBy',
      render: (value: string | null) => value || '-',
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (value: string) => new Date(value).toLocaleString(),
    },
    {
      title: '采样率',
      dataIndex: 'sampleRate',
      key: 'sampleRate',
      render: (value: number) => `${value}%`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: AutoEvalStatus) => (
        <Tag color={statusMap[status].color}>{statusMap[status].text}</Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'edit',
                icon: <EditOutlined />,
                label: '编辑',
                onClick: () => navigate(`/auto-eval/${record.id}/edit`),
              },
              {
                key: 'copy',
                icon: <CopyOutlined />,
                label: '复制',
                onClick: () => message.info('复制功能开发中'),
              },
              {
                key: 'delete',
                icon: <DeleteOutlined />,
                label: '删除',
                danger: true,
                onClick: () => handleDelete(record),
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

  // 行选择配置
  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      dispatch(setSelectedRowKeys(newSelectedRowKeys as string[]));
    },
  };

  return (
    <div className={styles.page}>
      {/* 标题区域 */}
      <Row justify="space-between" align="middle" className={styles.header}>
        <Col>
          <Title level={4} className={styles.title}>
            自动化评测
          </Title>
          <Text type="secondary">
            通过定义采样过滤规则及评估指标，针对线上trace数据周期性自动评测并沉淀报告。
          </Text>
        </Col>
        <Col>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            创建新规则
          </Button>
        </Col>
      </Row>

      {/* 搜索和操作栏 */}
      <Card className={styles.searchCard}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <Input
                placeholder="按名称搜索"
                prefix={<SearchOutlined />}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onPressEnter={handleSearch}
                className={styles.searchInput}
                allowClear
              />
              <Button icon={<FilterOutlined />}>筛选 (0)</Button>
            </Space>
          </Col>
          <Col>
            <Space>
              <Tooltip title="批量删除">
                <Button
                  icon={<DeleteOutlined />}
                  disabled={selectedRowKeys.length === 0}
                  onClick={handleBatchDelete}
                  loading={deleting}
                />
              </Tooltip>
              <Tooltip title="图表视图">
                <Button icon={<BarChartOutlined />} />
              </Tooltip>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 数据表格 */}
      <Card>
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={items}
          rowKey="id"
          loading={loading}
          pagination={false}
          locale={{
            emptyText: (
              <Empty
                description="暂无数据"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ),
          }}
        />

        {/* 分页 */}
        <Row justify="end" className={styles.paginationRow}>
          <Pagination
            current={page}
            pageSize={pageSize}
            total={total}
            showSizeChanger
            showQuickJumper
            showTotal={(total) => `共 ${total} 条`}
            onChange={(newPage, newPageSize) => {
              dispatch(setPage(newPage));
              if (newPageSize !== pageSize) {
                dispatch(setPageSize(newPageSize));
              }
            }}
            onShowSizeChange={(_, newSize) => {
              dispatch(setPageSize(newSize));
            }}
          />
        </Row>
      </Card>
    </div>
  );
};

export default AutoEvalListPage;
