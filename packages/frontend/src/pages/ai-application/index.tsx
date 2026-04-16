import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Row,
  Col,
  Input,
  Button,
  Typography,
  Pagination,
  Empty,
  Spin,
  Modal,
  message,
} from 'antd';
import {
  PlusOutlined,
  ImportOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import { AppDispatch, RootState } from '../../app/store';
import {
  fetchApplications,
  createApplication,
  updateApplication,
  deleteApplication,
  importPublicAgent,
  setPage,
} from '../../store/aiApplicationSlice';
import {
  CreateApplicationRequest,
  UpdateApplicationRequest,
  ImportPublicAgentRequest,
  AIApplication,
} from '../../services/aiApplicationApi';
import AppCard from './components/AppCard';
import CreateAppModal from './components/CreateAppModal';
import ImportPublicModal from './components/ImportPublicModal';
import { useDebounce } from '../../hooks/useDebounce';

const { Title, Text } = Typography;
const { Search } = Input;
const { confirm } = Modal;

// 默认项目ID（实际应该从项目选择器或路由参数获取）
const DEFAULT_PROJECT_ID = '00000000-0000-0000-0000-000000000001';

const AIApplicationPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    applications,
    loading,
    total,
    page,
    pageSize,
    totalPages,
  } = useSelector((state: RootState) => state.aiApplication);

  const [searchKeyword, setSearchKeyword] = useState('');
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [editingApp, setEditingApp] = useState<AIApplication | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // 防抖搜索
  const debouncedKeyword = useDebounce(searchKeyword, 300);

  // 获取应用列表
  const loadApplications = useCallback(() => {
    dispatch(
      fetchApplications({
        page,
        pageSize,
        keyword: debouncedKeyword || undefined,
        projectId: DEFAULT_PROJECT_ID,
      })
    );
  }, [dispatch, page, pageSize, debouncedKeyword]);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  // 处理搜索
  const handleSearch = (value: string) => {
    setSearchKeyword(value);
    dispatch(setPage(1));
  };

  // 处理页码变化
  const handlePageChange = (newPage: number) => {
    dispatch(setPage(newPage));
  };

  // 打开新增弹窗
  const handleOpenCreateModal = () => {
    setEditingApp(null);
    setCreateModalVisible(true);
  };

  // 打开编辑弹窗
  const handleEdit = (app: AIApplication) => {
    setEditingApp(app);
    setCreateModalVisible(true);
  };

  // 关闭新增/编辑弹窗
  const handleCloseCreateModal = () => {
    setCreateModalVisible(false);
    setEditingApp(null);
  };

  // 提交新增/编辑
  const handleSubmitCreate = async (
    values: CreateApplicationRequest | UpdateApplicationRequest
  ) => {
    setActionLoading(true);
    try {
      if (editingApp) {
        await dispatch(
          updateApplication({ id: editingApp.id, data: values })
        ).unwrap();
        message.success('更新成功');
      } else {
        await dispatch(
          createApplication(values as CreateApplicationRequest)
        ).unwrap();
        message.success('创建成功');
      }
      setCreateModalVisible(false);
      setEditingApp(null);
      loadApplications();
    } catch (error: any) {
      message.error(error || '操作失败');
    } finally {
      setActionLoading(false);
    }
  };

  // 打开引用公共Agent弹窗
  const handleOpenImportModal = () => {
    setImportModalVisible(true);
  };

  // 关闭引用公共Agent弹窗
  const handleCloseImportModal = () => {
    setImportModalVisible(false);
  };

  // 提交引用公共Agent
  const handleSubmitImport = async (values: ImportPublicAgentRequest) => {
    setActionLoading(true);
    try {
      await dispatch(importPublicAgent(values)).unwrap();
      message.success('引用成功');
      setImportModalVisible(false);
      loadApplications();
    } catch (error: any) {
      message.error(error || '引用失败');
    } finally {
      setActionLoading(false);
    }
  };

  // 处理删除
  const handleDelete = (app: AIApplication) => {
    confirm({
      title: '确认删除',
      content: `确定要删除应用 "${app.name}" 吗？此操作不可恢复。`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await dispatch(deleteApplication(app.id)).unwrap();
          message.success('删除成功');
          loadApplications();
        } catch (error: any) {
          message.error(error || '删除失败');
        }
      },
    });
  };

  // 处理评测
  const handleEvaluate = (app: AIApplication) => {
    // 跳转到评测任务创建页面，并携带应用ID
    window.location.href = `/eval/tasks/create?appId=${app.id}`;
  };

  return (
    <div style={{ padding: 24 }}>
      {/* 页面标题 */}
      <div style={{ marginBottom: 24 }}>
        <Title level={4} style={{ marginBottom: 8 }}>
          AI应用
        </Title>
        <Text type="secondary">
          通过gitlab管理自建AI应用及竞品AI应用，在评测任务创建中选定AI应用作为AI应用发起评测
          <a
            href="#"
            style={{ marginLeft: 8 }}
            onClick={(e) => {
              e.preventDefault();
              message.info('帮助文档功能开发中');
            }}
          >
            帮助文档 <QuestionCircleOutlined />
          </a>
        </Text>
      </div>

      {/* 搜索栏和操作按钮 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
        }}
      >
        <Search
          placeholder="按应用名称搜索"
          allowClear
          onSearch={handleSearch}
          onChange={(e) => handleSearch(e.target.value)}
          style={{ width: 320 }}
          value={searchKeyword}
        />
        <div style={{ display: 'flex', gap: 12 }}>
          <Button
            icon={<ImportOutlined />}
            onClick={handleOpenImportModal}
            style={{
              backgroundColor: '#722ed1',
              borderColor: '#722ed1',
              color: '#fff',
            }}
          >
            引用公共Code Agent
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleOpenCreateModal}
          >
            新增AI应用
          </Button>
        </div>
      </div>

      {/* 加载状态 */}
      {loading && applications.length === 0 ? (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: 400,
          }}
        >
          <Spin size="large" />
        </div>
      ) : applications.length === 0 ? (
        /* 空状态 */
        <Empty
          description={
            debouncedKeyword ? '未找到匹配的应用' : '暂无AI应用，请创建或引用'
          }
          style={{ marginTop: 80 }}
        />
      ) : (
        /* 应用卡片网格 */
        <>
          <Row gutter={[24, 24]}>
            {applications.map((app) => (
              <Col key={app.id} xs={24} sm={12} md={8} lg={6}>
                <AppCard
                  application={app}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onEvaluate={handleEvaluate}
                />
              </Col>
            ))}
          </Row>

          {/* 分页 */}
          {totalPages > 1 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginTop: 32,
              }}
            >
              <Pagination
                current={page}
                pageSize={pageSize}
                total={total}
                onChange={handlePageChange}
                showSizeChanger={false}
                showTotal={(total) => `共 ${total} 条`}
              />
            </div>
          )}
        </>
      )}

      {/* 新增/编辑弹窗 */}
      <CreateAppModal
        visible={createModalVisible}
        onCancel={handleCloseCreateModal}
        onSubmit={handleSubmitCreate}
        editingApp={editingApp}
        projectId={DEFAULT_PROJECT_ID}
        loading={actionLoading}
      />

      {/* 引用公共Agent弹窗 */}
      <ImportPublicModal
        visible={importModalVisible}
        onCancel={handleCloseImportModal}
        onSubmit={handleSubmitImport}
        projectId={DEFAULT_PROJECT_ID}
        loading={actionLoading}
      />
    </div>
  );
};

export default AIApplicationPage;
