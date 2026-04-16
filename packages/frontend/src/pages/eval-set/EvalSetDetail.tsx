import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Card,
  Breadcrumb,
  Button,
  Space,
  Tag,
  Typography,
  Divider,
  Row,
  Col,
  message,
  Modal,
  Form,
  Input,
  Pagination,

} from 'antd';
import {
  ArrowLeftOutlined,
  FilterOutlined,
  DownloadOutlined,
  CopyOutlined,
  BarChartOutlined,
  TableOutlined,
  RobotOutlined,
  ThunderboltOutlined,
  PlusOutlined,
  ClockCircleOutlined,
  LinkOutlined,
  TagOutlined,
} from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import {
  fetchEvalSet,
  fetchEvalSetItems,
  deleteEvalSetItem,
  createEvalSetItem,
  updateEvalSetItem,
  setItemsPage,
  setItemsPageSize,
  clearCurrentEvalSet,
} from '../../store/evalSetSlice';
import { EvalSetItemTable } from './components/EvalSetItemTable';
import { ColumnManager } from './components/ColumnManager';
import { TagManager } from './components/TagManager';
import { EvalSetItem } from '@eva/shared';

const { Title, Text } = Typography;
const { TextArea } = Input;

const EVAL_SET_TYPE_COLORS: Record<string, string> = {
  text: 'blue',
  code: 'green',
};

const EVAL_SET_TYPE_LABELS: Record<string, string> = {
  text: '文本',
  code: 'Code',
};

const EvalSetDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const {
    currentEvalSet,
    detailLoading,
    items,
    itemsTotal,
    itemsPage,
    itemsPageSize,
    itemsLoading,
  } = useAppSelector((state) => state.evalSet);

  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(['input', 'output']);
  const [allColumns, setAllColumns] = useState<string[]>(['input', 'output']);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<EvalSetItem | null>(null);
  const [form] = Form.useForm();
  const [tags, setTags] = useState<string[]>([]);

  const loadData = useCallback(() => {
    if (id) {
      dispatch(fetchEvalSet(id));
      dispatch(
        fetchEvalSetItems({
          evalSetId: id,
          params: { page: itemsPage, pageSize: itemsPageSize },
        }),
      );
    }
  }, [dispatch, id, itemsPage, itemsPageSize]);

  useEffect(() => {
    loadData();
    return () => {
      dispatch(clearCurrentEvalSet());
    };
  }, [loadData, dispatch]);

  // 从数据项中提取所有列
  useEffect(() => {
    if (items.length > 0) {
      const columnsSet = new Set<string>();
      items.forEach((item) => {
        if (item.input && typeof item.input === 'object') {
          Object.keys(item.input).forEach((key) => columnsSet.add(key));
        }
      });
      const columns = Array.from(columnsSet);
      setAllColumns(columns);
      if (visibleColumns.length === 0) {
        setVisibleColumns(columns.slice(0, 5));
      }
    }
  }, [items]);

  const handleDeleteItem = async (itemId: string) => {
    if (!id) return;
    try {
      await dispatch(deleteEvalSetItem({ evalSetId: id, itemId })).unwrap();
      message.success('删除成功');
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleEditItem = (item: EvalSetItem) => {
    setCurrentItem(item);
    form.setFieldsValue({
      input: JSON.stringify(item.input, null, 2),
      output: JSON.stringify(item.output, null, 2),
    });
    setEditModalOpen(true);
  };

  const handleSaveItem = async () => {
    if (!id || !currentItem) return;
    try {
      const values = await form.validateFields();
      await dispatch(
        updateEvalSetItem({
          evalSetId: id,
          itemId: currentItem.id,
          data: {
            input: JSON.parse(values.input),
            output: values.output ? JSON.parse(values.output) : undefined,
          },
        }),
      ).unwrap();
      message.success('保存成功');
      setEditModalOpen(false);
      setCurrentItem(null);
    } catch (error) {
      message.error('保存失败，请检查JSON格式');
    }
  };

  const handleAddItem = async () => {
    if (!id) return;
    try {
      await dispatch(
        createEvalSetItem({
          evalSetId: id,
          data: {
            input: { question: '新问题' },
            output: { answer: '新答案' },
          },
        }),
      ).unwrap();
      message.success('添加成功');
    } catch (error) {
      message.error('添加失败');
    }
  };

  const handleAddTag = (tag: string) => {
    setTags([...tags, tag]);
    message.success(`添加标签: ${tag}`);
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
    message.success(`移除标签: ${tag}`);
  };

  const handleExport = () => {
    message.success('导出功能开发中');
  };

  const handleCopy = () => {
    message.success('复制功能开发中');
  };

  const handleAIGenerate = () => {
    message.success('AI扩写功能开发中');
  };

  const handleAIPreprocess = () => {
    message.success('AI数据加工功能开发中');
  };

  if (!currentEvalSet && !detailLoading) {
    return (
      <div style={{ padding: 24 }}>
        <Card>
          <Text type="secondary">评测集不存在</Text>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <Breadcrumb style={{ marginBottom: 16 }}>
        <Breadcrumb.Item>
          <Link to="/eval/datasets">评测集</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>{currentEvalSet?.name || '加载中...'}</Breadcrumb.Item>
        <Breadcrumb.Item>Items</Breadcrumb.Item>
      </Breadcrumb>

      <Card loading={detailLoading} bordered={false}>
        <div style={{ marginBottom: 24 }}>
          <Space align="center" style={{ marginBottom: 16 }}>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/eval/datasets')}>
              返回
            </Button>
            <Title level={4} style={{ margin: 0 }}>
              {currentEvalSet?.name}
            </Title>
            {currentEvalSet && (
              <Tag color={EVAL_SET_TYPE_COLORS[currentEvalSet.type]}>
                {EVAL_SET_TYPE_LABELS[currentEvalSet.type]}
              </Tag>
            )}
          </Space>

          <Row gutter={24} style={{ marginBottom: 16 }}>
            <Col>
              <Space>
                <ClockCircleOutlined />
                <Text type="secondary">
                  创建时间:{' '}
                  {currentEvalSet?.createdAt
                    ? new Date(currentEvalSet.createdAt).toLocaleString()
                    : '-'}
                </Text>
              </Space>
            </Col>
            {currentEvalSet?.gitRepoUrl && (
              <Col>
                <Space>
                  <LinkOutlined />
                  <a
                    href={currentEvalSet.gitRepoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    GitLab仓库地址
                  </a>
                </Space>
              </Col>
            )}
          </Row>

          <div style={{ marginBottom: 16 }}>
            <Space align="center">
              <TagOutlined />
              <TagManager
                tags={tags}
                onAddTag={handleAddTag}
                onRemoveTag={handleRemoveTag}
              />
            </Space>
          </div>
        </div>

        <Divider />

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <Space>
            <Button icon={<FilterOutlined />}>筛选 (0)</Button>
            <Button icon={<DownloadOutlined />} onClick={handleExport}>
              下载
            </Button>
            <Button icon={<CopyOutlined />} onClick={handleCopy}>
              复制
            </Button>
          </Space>

          <Space>
            <Button icon={<BarChartOutlined />} />
            <Button icon={<TableOutlined />} />
            <ColumnManager
              allColumns={allColumns}
              visibleColumns={visibleColumns}
              onChange={setVisibleColumns}
            />
            <Button icon={<RobotOutlined />} onClick={handleAIGenerate}>
              AI扩写
            </Button>
            <Button icon={<ThunderboltOutlined />} onClick={handleAIPreprocess}>
              AI数据加工
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddItem}>
              新增数据项
            </Button>
          </Space>
        </div>

        <EvalSetItemTable
          items={items}
          loading={itemsLoading}
          columns={allColumns}
          visibleColumns={visibleColumns}
          selectedRowKeys={selectedRowKeys}
          onSelectChange={setSelectedRowKeys}
          onEdit={handleEditItem}
          onDelete={handleDeleteItem}
          isCodeType={currentEvalSet?.type === 'code'}
        />

        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
          <Pagination
            current={itemsPage}
            pageSize={itemsPageSize}
            total={itemsTotal}
            showSizeChanger
            showQuickJumper
            showTotal={(total) => `共 ${total} 条`}
            onChange={(page, pageSize) => {
              dispatch(setItemsPage(page));
              if (pageSize) dispatch(setItemsPageSize(pageSize));
            }}
          />
        </div>
      </Card>

      <Modal
        title="编辑数据项"
        open={editModalOpen}
        onCancel={() => {
          setEditModalOpen(false);
          setCurrentItem(null);
        }}
        onOk={handleSaveItem}
        width={800}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Input (JSON)"
            name="input"
            rules={[{ required: true, message: '请输入Input数据' }]}
          >
            <TextArea rows={10} style={{ fontFamily: 'monospace' }} />
          </Form.Item>
          <Form.Item label="Output (JSON)" name="output">
            <TextArea rows={10} style={{ fontFamily: 'monospace' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default EvalSetDetailPage;
