import { useEffect, useState, useCallback } from 'react';
import {
  Button,
  Input,
  Tag,
  Popconfirm,
  Space,
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
import PageContainer from '../../components/page/PageContainer';
import { AutoEvalStatus } from '@eva/shared';
import type { AutoEval } from '@eva/shared';
import type { ColumnsType } from 'antd/es/table';
import EnhancedTable, { type ColumnConfig } from '../../components/EnhancedTable';
import { formatDateTime } from '../../utils/format';
import styles from './AutoEvalListPage.module.scss';

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

  useEffect(() => {
    dispatch(fetchAutoEvals({}));
  }, [dispatch, page, pageSize, keyword]);

  const handleSearch = useCallback(() => {
    dispatch(setKeyword(searchValue));
  }, [dispatch, searchValue]);

  const handleCreate = () => {
    navigate('/auto-eval/create');
  };

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

  const columns: ColumnsType<AutoEval> = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      ellipsis: { showTitle: false },
      render: (text: string, record: AutoEval) => (
        <Tooltip title={text} placement="topLeft">
          <a onClick={() => navigate(`/auto-eval/${record.id}`)}>{text}</a>
        </Tooltip>
      ),
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 160,
      render: (value: string) => formatDateTime(value),
    },
    {
      title: '创建人',
      dataIndex: 'createdBy',
      key: 'createdBy',
      width: 120,
      ellipsis: { showTitle: false },
      render: (value: string | null) => (
        <Tooltip title={value || '-'} placement="topLeft">
          <span>{value || '-'}</span>
        </Tooltip>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (value: string) => formatDateTime(value),
    },
    {
      title: '采样率',
      dataIndex: 'sampleRate',
      key: 'sampleRate',
      width: 100,
      render: (value: number) => `${value}%`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: AutoEvalStatus) => (
        <Tag color={statusMap[status].color}>{statusMap[status].text}</Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => navigate(`/auto-eval/${record.id}/edit`)}
          >
            编辑
          </Button>
          <Button
            type="link"
            size="small"
            icon={<CopyOutlined />}
            onClick={() => message.info('复制功能开发中')}
          >
            复制
          </Button>
          <Popconfirm
            title="确认删除"
            description={`确定要删除规则 "${record.name}" 吗？`}
            onConfirm={() => {
              dispatch(deleteAutoEval(record.id)).then(() => {
                message.success('删除成功');
              });
            }}
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

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      dispatch(setSelectedRowKeys(newSelectedRowKeys as string[]));
    },
  };

  return (
    <PageContainer
      description="通过定义采样过滤规则及评估指标，针对线上 Trace 数据周期性自动评测并沉淀报告。"
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          创建新规则
        </Button>
      }
    >
      <div className="eva-filterBar">
        <div className="eva-filterBarMain">
          <div className="eva-filterField">
            <span className="eva-filterFieldLabel">搜索</span>
            <Input
              placeholder="按名称搜索规则"
              prefix={<SearchOutlined />}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onPressEnter={handleSearch}
              className={styles.searchInput}
              allowClear
            />
          </div>
        </div>
        <div className="eva-filterBarActions">
          <Button icon={<FilterOutlined />}>筛选 (0)</Button>
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
        </div>
      </div>

      <div className="eva-contentCard">
        <div className="eva-contentCardBody">
          <EnhancedTable<AutoEval>
        rowSelection={rowSelection}
        columns={columns}
        columnConfigs={columnConfigs}
        dataSource={items}
        rowKey="id"
        loading={loading}
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (t) => `共 ${t} 条`,
          onChange: (newPage, newPageSize) => {
            dispatch(setPage(newPage));
            if (newPageSize !== pageSize) {
              dispatch(setPageSize(newPageSize));
            }
          },
        }}
        locale={{
          emptyText: (
            <Empty
              description="暂无数据"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ),
        }}
      />
        </div>
      </div>
    </PageContainer>
  );
};

export default AutoEvalListPage;
