import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  App as AntdApp,
  Button,
  Card,
  Form,
  Input,
  Select,
  Spin,
  Tag,
  Typography,
} from 'antd';
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  CopyOutlined,
} from '@ant-design/icons';
import projectApi, {
  type ProjectItem,
  type SearchUserItem,
} from '../../services/projectApi';
import styles from './CreateProject.module.scss';

const { Text, Link } = Typography;
const { TextArea } = Input;

const EditProjectPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [form] = Form.useForm();
  const { message } = AntdApp.useApp();

  const [project, setProject] = useState<ProjectItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userSearchResults, setUserSearchResults] = useState<SearchUserItem[]>([]);
  const [userSearchLoading, setUserSearchLoading] = useState(false);

  useEffect(() => {
    if (!id) return;

    const loadProject = async () => {
      setLoading(true);
      try {
        const data = await projectApi.getProject(id);
        setProject(data);

        form.setFieldsValue({
          pid: data.pid,
          projectName: data.projectName,
          description: data.description || '',
          adminIds: data.admins.map((a) => a.id),
          userIds: data.users.map((u) => u.id),
        });

        const allUsers: SearchUserItem[] = [
          ...data.admins.map((a) => ({
            id: a.id,
            name: a.name,
            employeeId: a.employeeId,
            displayName: `${a.name}(${a.employeeId})`,
          })),
          ...data.users.map((u) => ({
            id: u.id,
            name: u.name,
            employeeId: u.employeeId,
            displayName: `${u.name}(${u.employeeId})`,
          })),
        ];
        const seen = new Set<string>();
        const unique = allUsers.filter((u) => {
          if (seen.has(u.id)) return false;
          seen.add(u.id);
          return true;
        });
        setUserSearchResults(unique);
      } catch {
        message.error('加载项目信息失败');
        navigate('/projects');
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [id, form, message, navigate]);

  const handleUserSearch = useCallback(async (keyword: string) => {
    if (!keyword || keyword.length < 1) return;
    setUserSearchLoading(true);
    try {
      const result = await projectApi.searchUsers(keyword);
      setUserSearchResults((prev) => {
        const existingIds = new Set(prev.map((u) => u.id));
        const newUsers = result.filter((u) => !existingIds.has(u.id));
        return [...prev, ...newUsers];
      });
    } catch {
      // ignore
    } finally {
      setUserSearchLoading(false);
    }
  }, []);

  const handleSubmit = async (values: any) => {
    if (!id) return;
    setSubmitting(true);
    try {
      await projectApi.updateProject(id, {
        projectName: values.projectName,
        description: values.description,
        adminIds: values.adminIds,
        userIds: values.userIds,
      });
      message.success('项目保存成功');
      navigate('/projects');
    } catch (error: any) {
      message.error(error?.response?.data?.message || '保存失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      message.success('已复制到剪贴板');
    } catch {
      message.error('复制失败');
    }
  };

  const userOptions = userSearchResults.map((u) => ({
    value: u.id,
    label: u.displayName,
  }));

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.topBar}>
          <div className={styles.topBarLeft}>
            <div className={styles.topBarLogo}>
              <div className={styles.logoIcon}>E</div>
              <span className={styles.logoName}>Eva+</span>
            </div>
            <div className={styles.topBarDivider} />
            <Text className={styles.topBarTitle}>编辑项目</Text>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
          <Spin size="large" />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <div className={styles.topBarLeft}>
          <div className={styles.topBarLogo}>
            <div className={styles.logoIcon}>E</div>
            <span className={styles.logoName}>Eva+</span>
          </div>
          <div className={styles.topBarDivider} />
          <Text className={styles.topBarTitle}>编辑项目</Text>
        </div>
        <Button
          type="link"
          icon={<ArrowLeftOutlined />}
          className={styles.backBtn}
          onClick={() => navigate('/projects')}
        >
          返回项目列表
        </Button>
      </div>

      <div className={styles.body}>
        <div className={styles.content}>
          <div className={styles.formSection}>
            <div className={styles.sectionTitle}>项目基础信息</div>

            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              requiredMark="optional"
            >
              <Form.Item label="pid" name="pid" required>
                <Input disabled style={{ background: '#f9fafb' }} />
              </Form.Item>

              <Form.Item
                label="项目名称"
                name="projectName"
                rules={[
                  { required: true, message: '项目名称不能为空' },
                  { max: 50, message: '项目名称不能超过50个字符' },
                ]}
              >
                <Input placeholder="请输入项目名称" />
              </Form.Item>

              <Form.Item
                label="项目描述"
                name="description"
                rules={[{ max: 200, message: '项目描述不能超过200个字符' }]}
              >
                <TextArea rows={3} placeholder="请填写项目描述（选填）" />
              </Form.Item>

              {project?.encryption?.generated && (
                <Card className={styles.encryptionCard} bordered={false}>
                  <div className={styles.encryptionRow}>
                    <Text strong>生产加密方案：</Text>
                    <Tag color="success" icon={<CheckCircleOutlined />}>
                      已生成
                    </Tag>
                    <Link>使用说明</Link>
                  </div>
                  <div className={styles.encryptionRow}>
                    <Text type="secondary">密钥名称：</Text>
                    <Text code>{project.encryption.keyName}</Text>
                    <Button
                      type="text"
                      size="small"
                      icon={<CopyOutlined />}
                      onClick={() => handleCopy(project.encryption!.keyName)}
                    />
                  </div>
                  <div className={styles.encryptionRow}>
                    <Text type="secondary">发放码：</Text>
                    <Text code>{project.encryption.issueCode}</Text>
                    <Button
                      type="text"
                      size="small"
                      icon={<CopyOutlined />}
                      onClick={() => handleCopy(project.encryption!.issueCode)}
                    />
                  </div>
                </Card>
              )}

              <Form.Item
                label="管理员"
                name="adminIds"
                rules={[{ required: true, message: '至少选择1个管理员' }]}
              >
                <Select
                  mode="multiple"
                  placeholder="搜索并添加管理员"
                  showSearch
                  filterOption={false}
                  loading={userSearchLoading}
                  onSearch={handleUserSearch}
                  options={userOptions}
                  notFoundContent={userSearchLoading ? '搜索中...' : '无结果'}
                />
              </Form.Item>

              <Form.Item label="普通用户" name="userIds">
                <Select
                  mode="multiple"
                  placeholder="搜索并添加用户（选填）"
                  showSearch
                  filterOption={false}
                  loading={userSearchLoading}
                  onSearch={handleUserSearch}
                  options={userOptions}
                  notFoundContent={userSearchLoading ? '搜索中...' : '无结果'}
                />
              </Form.Item>

              <div className={styles.submitRow}>
                <Button type="primary" htmlType="submit" loading={submitting}>
                  保存项目
                </Button>
                <Button onClick={() => navigate('/projects')}>
                  取消
                </Button>
              </div>
            </Form>
          </div>

          <div className={styles.stepSection}>
            <div className={styles.stepItem}>
              <span className={styles.stepNumber}>1</span>
              <span className={styles.stepLabel}>填写项目基础信息</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProjectPage;
