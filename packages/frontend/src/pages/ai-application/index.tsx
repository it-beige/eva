import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import type {
  ApplicationResponse,
  CreateApplicationRequest,
  ImportPublicAgentRequest,
  UpdateApplicationRequest,
} from '@eva/shared';
import AppCard from './components/AppCard';
import CreateAppModal from './components/CreateAppModal';
import ImportPublicModal from './components/ImportPublicModal';
import styles from './AIApplicationPage.module.scss';
import { useDebounce } from '../../hooks/useDebounce';
import {
  useCreateApplicationMutation,
  useDeleteApplicationMutation,
  useGetApplicationsQuery,
  useImportPublicAgentMutation,
  useUpdateApplicationMutation,
} from '../../services/applicationQueries';
import { getQueryErrorMessage } from '../../services/evaApi';

const { Title, Text } = Typography;
const { Search } = Input;
const { confirm } = Modal;

const AIApplicationPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchKeyword, setSearchKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [editingApp, setEditingApp] = useState<ApplicationResponse | null>(null);

  const debouncedKeyword = useDebounce(searchKeyword, 300);
  const pageSize = 12;
  const {
    data,
    isFetching: loading,
  } = useGetApplicationsQuery({
    page,
    pageSize,
    keyword: debouncedKeyword || undefined,
  });
  const [createApplication, { isLoading: creating }] =
    useCreateApplicationMutation();
  const [updateApplication, { isLoading: updating }] =
    useUpdateApplicationMutation();
  const [deleteApplication, { isLoading: deleting }] =
    useDeleteApplicationMutation();
  const [importPublicAgent, { isLoading: importing }] =
    useImportPublicAgentMutation();

  const actionLoading = creating || updating || deleting || importing;
  const applications = data?.items ?? [];
  const total = data?.total ?? 0;

  const handleSearch = (value: string) => {
    setSearchKeyword(value);
    setPage(1);
  };

  const handleOpenCreateModal = () => {
    setEditingApp(null);
    setCreateModalVisible(true);
  };

  const handleEdit = (app: ApplicationResponse) => {
    setEditingApp(app);
    setCreateModalVisible(true);
  };

  const handleCloseCreateModal = () => {
    setCreateModalVisible(false);
    setEditingApp(null);
  };

  const handleSubmitCreate = async (
    values: CreateApplicationRequest | UpdateApplicationRequest,
  ) => {
    try {
      if (editingApp) {
        await updateApplication({ id: editingApp.id, data: values }).unwrap();
        message.success('更新成功');
      } else {
        await createApplication(values as CreateApplicationRequest).unwrap();
        message.success('创建成功');
      }

      setCreateModalVisible(false);
      setEditingApp(null);
    } catch (error) {
      message.error(getQueryErrorMessage(error as any, '操作失败'));
    }
  };

  const handleSubmitImport = async (values: ImportPublicAgentRequest) => {
    try {
      await importPublicAgent(values).unwrap();
      message.success('引用成功');
      setImportModalVisible(false);
    } catch (error) {
      message.error(getQueryErrorMessage(error as any, '引用失败'));
    }
  };

  const handleDelete = (app: ApplicationResponse) => {
    confirm({
      title: '确认删除',
      content: `确定要删除应用 "${app.name}" 吗？此操作不可恢复。`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteApplication(app.id).unwrap();
          message.success('删除成功');
        } catch (error) {
          message.error(getQueryErrorMessage(error as any, '删除失败'));
        }
      },
    });
  };

  const handleEvaluate = (app: ApplicationResponse) => {
    navigate(`/eval/tasks/create?appId=${app.id}`);
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Title level={4} className={styles.title}>
          AI应用
        </Title>
        <Text type="secondary">
          通过gitlab管理自建AI应用及竞品AI应用，在评测任务创建中选定AI应用作为AI应用发起评测
          <a
            href="#"
            className={styles.helpLink}
            onClick={(event) => {
              event.preventDefault();
              message.info('帮助文档功能开发中');
            }}
          >
            帮助文档 <QuestionCircleOutlined />
          </a>
        </Text>
      </div>

      <div className={styles.toolbar}>
        <Search
          placeholder="按应用名称搜索"
          allowClear
          onSearch={handleSearch}
          onChange={(event) => handleSearch(event.target.value)}
          className={styles.search}
          value={searchKeyword}
        />
        <div className={styles.actions}>
          <Button
            icon={<ImportOutlined />}
            onClick={() => setImportModalVisible(true)}
            className={styles.importButton}
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

      {loading && applications.length === 0 ? (
        <div className={styles.loadingState}>
          <Spin size="large" />
        </div>
      ) : applications.length === 0 ? (
        <Empty
          description={
            debouncedKeyword ? '未找到匹配的应用' : '暂无AI应用，请创建或引用'
          }
          className={styles.emptyState}
        />
      ) : (
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

          <div className={styles.pagination}>
            <Pagination
              current={page}
              pageSize={pageSize}
              total={total}
              onChange={setPage}
              showSizeChanger={false}
              showQuickJumper
              showTotal={(count) => `共 ${count} 个应用`}
            />
          </div>
        </>
      )}

      <CreateAppModal
        visible={createModalVisible}
        onCancel={handleCloseCreateModal}
        onSubmit={handleSubmitCreate}
        editingApp={editingApp}
        loading={actionLoading}
      />

      <ImportPublicModal
        visible={importModalVisible}
        onCancel={() => setImportModalVisible(false)}
        onSubmit={handleSubmitImport}
        loading={actionLoading}
      />
    </div>
  );
};

export default AIApplicationPage;
