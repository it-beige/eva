import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  App as AntdApp,
  Alert,
  Button,
  Form,
  Input,
  Radio,
  Select,
  Typography,
} from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { ProjectCreateMode } from '@eva/shared';
import projectApi, {
  type SearchUserItem,
  type PlatformItem,
  type AppItem,
} from '../../services/projectApi';
import { getCurrentUser } from '../../auth/session';
import styles from './CreateProject.module.scss';

const { Title, Text } = Typography;
const { TextArea } = Input;

const tipMessages: Record<string, string> = {
  [ProjectCreateMode.DIRECT]:
    '如果有多应用组合看数据需求，可选择【联合创建】项目',
  [ProjectCreateMode.LINKED]:
    '已在其他平台创建应用或场景，可通过一键关联快速接入；更多观测需求请参考SDK使用手册。',
  [ProjectCreateMode.JOINT]:
    '创建联合项目可以将多个应用或场景组合在一起进行统一管理和数据分析',
};

const CreateProjectPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form] = Form.useForm();
  const { message } = AntdApp.useApp();
  const currentUser = getCurrentUser();

  const initialMode =
    (searchParams.get('mode') as ProjectCreateMode) || ProjectCreateMode.DIRECT;

  const [mode, setMode] = useState<ProjectCreateMode>(initialMode);
  const [submitting, setSubmitting] = useState(false);
  const [pid, setPid] = useState('');
  const [userSearchResults, setUserSearchResults] = useState<SearchUserItem[]>([]);
  const [userSearchLoading, setUserSearchLoading] = useState(false);
  const [platforms, setPlatforms] = useState<PlatformItem[]>([]);
  const [apps, setApps] = useState<AppItem[]>([]);
  const [appsLoading, setAppsLoading] = useState(false);

  // Generate PID on mount for direct mode
  useEffect(() => {
    const loadPid = async () => {
      try {
        const result = await projectApi.generatePid();
        setPid(result.pid);
        form.setFieldValue('pid', result.pid);
      } catch {
        // ignore
      }
    };
    loadPid();
  }, [form]);

  // Load platforms
  useEffect(() => {
    const loadPlatforms = async () => {
      try {
        const result = await projectApi.getPlatforms();
        setPlatforms(result);
      } catch {
        // ignore
      }
    };
    loadPlatforms();
  }, []);

  // Set default admin as current user
  useEffect(() => {
    if (currentUser) {
      form.setFieldValue('adminIds', [currentUser.id]);
      // Seed search results with current user
      setUserSearchResults([
        {
          id: currentUser.id,
          name: currentUser.name,
          employeeId: currentUser.employeeId || '',
          displayName: `${currentUser.name}(${currentUser.employeeId || ''})`,
        },
      ]);
    }
  }, [currentUser, form]);

  const handleModeChange = (newMode: ProjectCreateMode) => {
    setMode(newMode);
    form.setFieldsValue({
      createMode: newMode,
      platform: undefined,
      linkedApp: undefined,
      jointApps: undefined,
    });
  };

  const handlePlatformChange = async (platform: string) => {
    form.setFieldValue('linkedApp', undefined);
    setAppsLoading(true);
    try {
      const result = await projectApi.getApps(platform);
      setApps(result);
    } catch {
      setApps([]);
    } finally {
      setAppsLoading(false);
    }
  };

  const handleUserSearch = useCallback(
    async (keyword: string) => {
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
    },
    [],
  );

  const handleSubmit = async (values: any) => {
    setSubmitting(true);
    try {
      await projectApi.createProject({
        createMode: mode,
        pid: mode === ProjectCreateMode.DIRECT ? pid : undefined,
        platform: values.platform,
        linkedApp: values.linkedApp,
        projectName: values.projectName,
        description: values.description,
        jointApps: values.jointApps,
        adminIds: values.adminIds,
        userIds: values.userIds,
      });
      message.success('项目创建成功');
      navigate('/projects');
    } catch (error: any) {
      message.error(
        error?.response?.data?.message || '创建失败，请重试',
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Load all apps for joint mode
  useEffect(() => {
    if (mode === ProjectCreateMode.JOINT) {
      const loadAllApps = async () => {
        setAppsLoading(true);
        try {
          const result = await projectApi.getApps();
          setApps(result);
        } catch {
          setApps([]);
        } finally {
          setAppsLoading(false);
        }
      };
      loadAllApps();
    }
  }, [mode]);

  const userOptions = userSearchResults.map((u) => ({
    value: u.id,
    label: u.displayName,
  }));

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Button
          type="link"
          icon={<ArrowLeftOutlined />}
          className={styles.backBtn}
          onClick={() => navigate('/projects')}
        >
          返回
        </Button>
        <Title level={4} className={styles.title}>
          创建项目
        </Title>
      </div>

      <div className={styles.content}>
        <div className={styles.formSection}>
          <div className={styles.sectionTitle}>项目基础信息</div>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              createMode: mode,
              pid,
            }}
          >
            <Form.Item
              label="新建方式"
              name="createMode"
              required
            >
              <Radio.Group
                value={mode}
                onChange={(e) => handleModeChange(e.target.value)}
              >
                <Radio value={ProjectCreateMode.LINKED}>关联应用/场景</Radio>
                <Radio value={ProjectCreateMode.DIRECT}>直接创建</Radio>
                <Radio value={ProjectCreateMode.JOINT}>联合创建</Radio>
              </Radio.Group>
            </Form.Item>

            <Alert
              type="info"
              showIcon
              message={tipMessages[mode]}
              className={styles.tipBox}
            />

            {/* Direct mode: show pid */}
            {mode === ProjectCreateMode.DIRECT && (
              <Form.Item label="pid" name="pid" required>
                <Input value={pid} disabled style={{ background: '#f5f5f5' }} />
              </Form.Item>
            )}

            {/* Linked mode: platform + app */}
            {mode === ProjectCreateMode.LINKED && (
              <>
                <Form.Item
                  label="平台选择"
                  name="platform"
                  rules={[{ required: true, message: '请选择平台' }]}
                >
                  <Select
                    placeholder="请选择平台"
                    options={platforms.map((p) => ({
                      value: p.platformCode,
                      label: p.platformName,
                    }))}
                    onChange={handlePlatformChange}
                  />
                </Form.Item>
                <Form.Item
                  label="关联应用"
                  name="linkedApp"
                  rules={[{ required: true, message: '请选择关联应用' }]}
                  extra={
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      只展示有权限的应用/场景，加权限请到对应平台上操作
                    </Text>
                  }
                >
                  <Select
                    placeholder="请选择应用"
                    showSearch
                    loading={appsLoading}
                    filterOption={(input, option) =>
                      (option?.label ?? '')
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    options={apps.map((a) => ({
                      value: a.appCode,
                      label: `${a.appName} (${a.appCode})`,
                    }))}
                    onChange={(_, option: any) => {
                      // Auto fill project name
                      if (!form.getFieldValue('projectName')) {
                        const app = apps.find((a) => a.appCode === option?.value);
                        if (app) {
                          form.setFieldValue('projectName', app.appName);
                        }
                      }
                    }}
                  />
                </Form.Item>
              </>
            )}

            {/* Joint mode: joint scope */}
            {mode === ProjectCreateMode.JOINT && (
              <Form.Item
                label="联合范围"
                name="jointApps"
                rules={[
                  { required: true, message: '请选择联合范围' },
                  {
                    validator: (_, value) =>
                      value && value.length >= 2
                        ? Promise.resolve()
                        : Promise.reject('联合创建至少选择2个应用'),
                  },
                ]}
                extra={
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    只展示有权限的应用/场景，加权限请到对应平台上操作
                  </Text>
                }
              >
                <Select
                  mode="multiple"
                  placeholder="请选择要联合的应用/场景"
                  showSearch
                  loading={appsLoading}
                  filterOption={(input, option) =>
                    (option?.label ?? '')
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  options={apps.map((a) => ({
                    value: a.appCode,
                    label: `${a.appName} (${a.appCode})`,
                  }))}
                />
              </Form.Item>
            )}

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
              <TextArea rows={3} placeholder="请填写项目描述" />
            </Form.Item>

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
                placeholder="搜索并添加用户"
                showSearch
                filterOption={false}
                loading={userSearchLoading}
                onSearch={handleUserSearch}
                options={userOptions}
                notFoundContent={userSearchLoading ? '搜索中...' : '无结果'}
              />
            </Form.Item>

            <Form.Item className={styles.submitBtn}>
              <Button type="primary" htmlType="submit" loading={submitting}>
                创建项目
              </Button>
            </Form.Item>
          </Form>
        </div>

        <div className={styles.stepSection}>
          <div className={styles.stepItem}>
            <span className={styles.stepNumber}>01</span>
            <span className={styles.stepDivider} />
            <span className={styles.stepLabel}>填写项目基础信息</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateProjectPage;
