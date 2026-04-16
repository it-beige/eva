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
  const redirectTo = from?.from ?? '/eval/tasks';

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
        <Space orientation="vertical" size={20} className={styles.stack}>
          <div>
            <Text className={styles.brand}>Eva Platform</Text>
            <Title level={2} className={styles.title}>
              登录评测平台
            </Title>
            <Paragraph type="secondary" className={styles.description}>
              使用演示账号即可进入系统。当前仓库未实现完整注册流程，这里提供最小可用登录。
            </Paragraph>
          </div>

          <Alert
            type="info"
            showIcon
            title="演示账号"
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
              size="large"
              block
              loading={loading}
            >
              登录
            </Button>
          </Form>
        </Space>
      </Card>
    </div>
  );
};

export default LoginPage;
