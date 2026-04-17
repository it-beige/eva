import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  App as AntdApp,
  Alert,
  Button,
  Card,
  Form,
  Input,
  Space,
  Typography,
} from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import authApi from '../../services/authApi';
import { getAccessToken, persistSession } from '../../auth/session';
import styles from './LoginPage.module.scss';

const { Title, Text, Paragraph } = Typography;

interface LoginFormValues {
  employeeId: string;
  password: string;
}

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [form] = Form.useForm<LoginFormValues>();
  const [loading, setLoading] = useState(false);
  const { message } = AntdApp.useApp();
  const from = location.state as { from?: string } | null;
  const redirectTo = from?.from ?? '/projects';

  useEffect(() => {
    if (getAccessToken()) {
      navigate(redirectTo, { replace: true });
    }
  }, [navigate, redirectTo]);

  const handleSubmit = async (values: LoginFormValues) => {
    setLoading(true);
    try {
      const result = await authApi.login(values);
      persistSession(result.accessToken, result.user);
      message.success(`欢迎回来，${result.user.name}`);
      navigate(redirectTo, { replace: true });
    } catch (error: any) {
      message.error(
        error?.response?.data?.message || '登录失败，请检查账号和密码',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    form.setFieldsValue({
      employeeId: 'admin001',
      password: 'admin123',
    });
  };

  return (
    <div className={styles.page}>
      <Card className={styles.card}>
        <Space direction="vertical" size={24} className={styles.stack}>
          <div>
            <div className={styles.logoRow}>
              <div className={styles.logoIcon}>E</div>
              <div className={styles.logoText}>
                <Text className={styles.brand}>Eva Platform</Text>
                <Title level={2} className={styles.title}>
                  登录评测平台
                </Title>
              </div>
            </div>
            <Paragraph className={styles.description}>
              使用工号和密码登录 Eva AI 评测平台，管理您的评测任务与数据。
            </Paragraph>
          </div>

          <Alert
            type="info"
            showIcon
            className={styles.demoAlert}
            message="演示账号"
            description="工号：admin001，密码：admin123"
            action={
              <Button size="small" type="link" onClick={handleFillDemo}>
                一键填充
              </Button>
            }
          />

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              employeeId: 'admin001',
              password: 'admin123',
            }}
            requiredMark={false}
          >
            <Form.Item
              label="工号"
              name="employeeId"
              rules={[{ required: true, message: '请输入工号' }]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="请输入工号"
                size="large"
              />
            </Form.Item>

            <Form.Item
              label="密码"
              name="password"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="请输入密码"
                size="large"
              />
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              className={styles.loginButton}
            >
              登录
            </Button>
          </Form>

          <div className={styles.footer}>
            Eva AI Evaluation Platform v1.0
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default LoginPage;
