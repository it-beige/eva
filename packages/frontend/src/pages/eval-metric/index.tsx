import React, { useEffect, useCallback } from 'react';
import {
  Table,
  Button,
  Input,
  Tabs,
  Space,
  Typography,
  Dropdown,
  message,
  Popconfirm,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  DeleteOutlined,
  BarChartOutlined,
  MoreOutlined,
  ExportOutlined,
} from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import {
  fetchEvalMetrics,
  deleteEvalMetric,
  deleteEvalMetrics,
  setCurrentScope,
  setKeyword,
  setSelectedRowKeys,
  setPage,
  setPageSize,
  showCreateModal,
  showEditModal,
} from '../../store/evalMetricSlice';
import CreateMetricModal from './components/CreateMetricModal';
import { MetricScope, MetricType, EvalMetric, METRIC_TYPE_LABELS } from '@eva/shared';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';

const { Title, Paragraph } = Typography;

const EvalMetricListPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    items,
    total,
    page,
    pageSize,
    loading,
    deleting,
    currentScope,
    keyword,
    selectedRowKeys,
    createModalVisible,
    editingMetric,
  } = useAppSelector((state) => state.evalMetric);

  // 获取列表数据
  const loadData = useCallback(() => {
    dispatch(fetchEvalMetrics({}));
  }, [dispatch]);

  // 初始加载和依赖变化时重新加载
  useEffect(() => {
    loadData();
  }, [loadData, currentScope, page, pageSize, keyword]);

  // 处理 Tab 切换
  const handleTabChange = (activeKey: string) => {
    dispatch(setCurrentScope(activeKey as MetricScope));
  };

  // 处理搜索
  const handleSearch = (value: string) => {
    dispatch(setKeyword(value));
  };

  // 处理分页
  const handlePageChange = (newPage: number, newPageSize?: number) => {
    dispatch(setPage(newPage));
    if (newPageSize && newPageSize !== pageSize) {
      dispatch(setPageSize(newPageSize));
    }
  };

  // 处理选择行
  const handleRowSelection = (selectedKeys: React.Key[]) => {
    dispatch(setSelectedRowKeys(selectedKeys as string[]));
  };

  // 处理新建
  const handleCreate = () => {
    dispatch(showCreateModal());
  };

  // 处理编辑
  const handleEdit = (record: EvalMetric) => {
    dispatch(showEditModal(record));
  };

  // 处理删除
  const handleDelete = async (id: string) => {
    try {
      await dispatch(deleteEvalMetric(id)).unwrap();
      message.success('删除成功');
    } catch (error: any) {
      message.error(error.message || '删除失败');
    }
  };

  // 处理批量删除
  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要删除的指标');
      return;
    }
    try {
      await dispatch(deleteEvalMetrics(selectedRowKeys)).unwrap();
      message.success(`成功删除 ${selectedRowKeys.length} 个指标`);
    } catch (error: any) {
      message.error(error.message || '批量删除失败');
    }
  };

  // 格式化日期
  const formatDate = (dateStr: string | Date) => {
    const date = new Date(dateStr);
    return date.toLocaleString('zh-CN', {
      year: '2-digit',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 表格列定义
  const columns: ColumnsType<EvalMetric> = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: EvalMetric) => (
        <a
          onClick={() => handleEdit(record)}
          style={{ color: '#1890ff', cursor: 'pointer' }}
        >
          {text}
        </a>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text: string) => text || '-',
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: MetricType) => METRIC_TYPE_LABELS[type] || type,
    },
    {
      title: '更新人',
      dataIndex: 'updatedBy',
      key: 'updatedBy',
      width: 120,
      render: (text: string) => text || '-',
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 150,
      render: (date: string) => formatDate(date),
    },
    {
      title: '创建人',
      dataIndex: 'createdBy',
      key: 'createdBy',
      width: 120,
      render: (text: string) => text || '-',
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date: string) => formatDate(date),
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      fixed: 'right',
      render: (_, record: EvalMetric) => {
        const items: MenuProps['items'] = [
          {
            key: 'edit',
            label: '编辑',
            onClick: () => handleEdit(record),
          },
          {
            key: 'delete',
            label: (
              <Popconfirm
                title="确定删除此指标?"
                onConfirm={() => handleDelete(record.id)}
                okText="确定"
                cancelText="取消"
              >
                <span style={{ color: '#ff4d4f' }}>删除</span>
              </Popconfirm>
            ),
          },
        ];

        return (
          <Dropdown menu={{ items }} placement="bottomRight">
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        );
      },
    },
  ];

  // 行选择配置
  const rowSelection = {
    selectedRowKeys,
    onChange: handleRowSelection,
  };

  return (
    <div style={{ padding: 24 }}>
      {/* 页面标题 */}
      <div style={{ marginBottom: 24 }}>
        <Title level={4} style={{ marginBottom: 8 }}>
          评估指标
        </Title>
        <Paragraph type="secondary" style={{ marginBottom: 0 }}>
          评估指标充当裁判的角色，用于自动化或半自动化评估 AI Agent 效果。评估指标通过预定义的规则，对评估对象的输出进行多维度分析，生成可量化的指标和归因结论。
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              // TODO: 打开帮助文档
            }}
            style={{ marginLeft: 8 }}
          >
            帮助文档 <ExportOutlined style={{ fontSize: 12 }} />
          </a>
        </Paragraph>
      </div>

      {/* Tabs */}
      <Tabs
        activeKey={currentScope}
        onChange={handleTabChange}
        style={{ marginBottom: 16 }}
        items={[
          { key: MetricScope.PERSONAL, label: '个人指标' },
          { key: MetricScope.PUBLIC, label: '公共指标' },
        ]}
      />

      {/* 操作栏 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <Space>
          <Input.Search
            placeholder="按名称搜索"
            allowClear
            onSearch={handleSearch}
            style={{ width: 280 }}
            prefix={<SearchOutlined />}
          />
          {selectedRowKeys.length > 0 && (
            <Popconfirm
              title={`确定删除选中的 ${selectedRowKeys.length} 个指标?`}
              onConfirm={handleBatchDelete}
              okText="确定"
              cancelText="取消"
            >
              <Button
                danger
                icon={<DeleteOutlined />}
                loading={deleting}
              >
                删除 ({selectedRowKeys.length})
              </Button>
            </Popconfirm>
          )}
        </Space>

        <Space>
          <Tooltip title="图表视图">
            <Button icon={<BarChartOutlined />} />
          </Tooltip>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            新建评估指标
          </Button>
        </Space>
      </div>

      {/* 表格 */}
      <Table
        rowKey="id"
        columns={columns}
        dataSource={items}
        loading={loading}
        rowSelection={rowSelection}
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条`,
          onChange: handlePageChange,
        }}
        scroll={{ x: 1200 }}
      />

      {/* 新建/编辑弹窗 */}
      <CreateMetricModal
        visible={createModalVisible}
        editingMetric={editingMetric}
      />
    </div>
  );
};

export default EvalMetricListPage;
