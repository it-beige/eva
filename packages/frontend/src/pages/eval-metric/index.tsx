import React, { useEffect, useCallback } from 'react';
import {
  Button,
  Input,
  Tabs,
  Space,
  message,
  Popconfirm,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  DeleteOutlined,
  BarChartOutlined,
  EditOutlined,
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
import PageContainer from '../../components/page/PageContainer';
import { MetricScope, MetricType, EvalMetric, METRIC_TYPE_LABELS } from '@eva/shared';
import type { ColumnsType } from 'antd/es/table';
import EnhancedTable, { type ColumnConfig } from '../../components/EnhancedTable';
import { formatDateTime } from '../../utils/format';
import styles from './EvalMetricPage.module.scss';

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

  const loadData = useCallback(() => {
    dispatch(fetchEvalMetrics({}));
  }, [dispatch]);

  useEffect(() => {
    loadData();
  }, [loadData, currentScope, page, pageSize, keyword]);

  const handleTabChange = (activeKey: string) => {
    dispatch(setCurrentScope(activeKey as MetricScope));
  };

  const handleSearch = (value: string) => {
    dispatch(setKeyword(value));
  };

  const handlePageChange = (newPage: number, newPageSize?: number) => {
    dispatch(setPage(newPage));
    if (newPageSize && newPageSize !== pageSize) {
      dispatch(setPageSize(newPageSize));
    }
  };

  const handleRowSelection = (selectedKeys: React.Key[]) => {
    dispatch(setSelectedRowKeys(selectedKeys as string[]));
  };

  const handleCreate = () => {
    dispatch(showCreateModal());
  };

  const handleEdit = (record: EvalMetric) => {
    dispatch(showEditModal(record));
  };

  const handleDelete = async (id: string) => {
    try {
      await dispatch(deleteEvalMetric(id)).unwrap();
      message.success('删除成功');
    } catch (error: any) {
      message.error(error.message || '删除失败');
    }
  };

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

  const columns: ColumnsType<EvalMetric> = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      width: 180,
      ellipsis: { showTitle: false },
      render: (text: string, record: EvalMetric) => (
        <Tooltip title={text} placement="topLeft">
          <a className={styles.nameLink} onClick={() => handleEdit(record)}>
            {text}
          </a>
        </Tooltip>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: { showTitle: false },
      render: (text: string) => (
        <Tooltip title={text || '-'} placement="topLeft">
          <span>{text || '-'}</span>
        </Tooltip>
      ),
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
      width: 100,
      ellipsis: { showTitle: false },
      render: (text: string) => (
        <Tooltip title={text || '-'} placement="topLeft">
          <span>{text || '-'}</span>
        </Tooltip>
      ),
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 160,
      render: (date: string) => formatDateTime(date),
    },
    {
      title: '创建人',
      dataIndex: 'createdBy',
      key: 'createdBy',
      width: 100,
      ellipsis: { showTitle: false },
      render: (text: string) => (
        <Tooltip title={text || '-'} placement="topLeft">
          <span>{text || '-'}</span>
        </Tooltip>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (date: string) => formatDateTime(date),
    },
    {
      title: '操作',
      key: 'action',
      width: 160,
      fixed: 'right',
      render: (_, record: EvalMetric) => (
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
            title="确定删除此指标?"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
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

  const rowSelection = {
    selectedRowKeys,
    onChange: handleRowSelection,
  };

  return (
    <PageContainer
      description={
        <>
          评估指标充当裁判的角色，用于自动化或半自动化评估 AI Agent 效果。评估指标通过预定义的规则，对评估对象的输出进行多维度分析，生成可量化的指标和归因结论。
          <a
            href="#"
            className={styles.helpLink}
            onClick={(e) => e.preventDefault()}
          >
            帮助文档 <ExportOutlined className={styles.helpIcon} />
          </a>
        </>
      }
      extra={
        <>
          <Tooltip title="图表视图">
            <Button icon={<BarChartOutlined />} />
          </Tooltip>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            新建评估指标
          </Button>
        </>
      }
    >
      <div className="eva-contentCard">
        <div className="eva-contentCardBody">
          <Tabs
            activeKey={currentScope}
            onChange={handleTabChange}
            items={[
              { key: MetricScope.PERSONAL, label: '个人指标' },
              { key: MetricScope.PUBLIC, label: '公共指标' },
            ]}
          />

          <div className="eva-filterBar">
            <div className="eva-filterBarMain">
              <div className="eva-filterField">
                <span className="eva-filterFieldLabel">搜索</span>
                <Input.Search
                  placeholder="按名称搜索指标"
                  allowClear
                  onSearch={handleSearch}
                  className={styles.searchInput}
                  prefix={<SearchOutlined />}
                />
              </div>
            </div>
            <div className="eva-filterBarActions">
              {selectedRowKeys.length > 0 && (
                <Popconfirm
                  title={`确定删除选中的 ${selectedRowKeys.length} 个指标?`}
                  onConfirm={handleBatchDelete}
                  okText="确定"
                  cancelText="取消"
                >
                  <Button danger icon={<DeleteOutlined />} loading={deleting}>
                    删除 ({selectedRowKeys.length})
                  </Button>
                </Popconfirm>
              )}
            </div>
          </div>

          <EnhancedTable<EvalMetric>
        rowKey="id"
        columns={columns}
        columnConfigs={columnConfigs}
        dataSource={items}
        loading={loading}
        rowSelection={rowSelection}
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (t) => `共 ${t} 条`,
          onChange: handlePageChange,
        }}
        scroll={{ x: 1200 }}
      />
        </div>
      </div>

      <CreateMetricModal
        visible={createModalVisible}
        editingMetric={editingMetric}
      />
    </PageContainer>
  );
};

export default EvalMetricListPage;
