import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  App as AntdApp,
  Alert,
  Button,
  Form,
  Input,
  Typography,
} from 'antd';
import {
  LockOutlined,
  UserOutlined,
  ExperimentOutlined,
  BarChartOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import authApi from '../../services/authApi';
import { getAccessToken, persistSession } from '../../auth/session';
import styles from './LoginPage.module.scss';

const { Title, Paragraph } = Typography;

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
      employeeId: 'demo',
      password: 'eva2026',
    });
  };

  return (
    <div className={styles.page}>
      {/* ── Left Brand Panel ──────────────────────────── */}
      <div className={styles.brandPanel}>
        <div className={styles.glowOrb} />
        <div className={styles.glowOrbSmall} />

        <div className={styles.brandContent}>
          <div className={styles.brandLogo}>
            <div className={styles.brandLogoIcon}>E</div>
            <span className={styles.brandLogoName}>Eva+</span>
          </div>

          <h1 className={styles.brandHeadline}>
            企业级 AI 模型
            <br />
            <span className={styles.brandHeadlineAccent}>评测与质量管理平台</span>
          </h1>

          <p className={styles.brandSubtitle}>
            构建标准化的 AI 评测体系，覆盖 Prompt 管理、自动化评测、模型对比、
            可观测性分析等全链路能力，助力团队高效交付高质量 AI 应用。
          </p>

          <div className={styles.features}>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>
                <ExperimentOutlined />
              </div>
              <div className={styles.featureText}>
                <span className={styles.featureTitle}>自动化评测</span>
                <span className={styles.featureDesc}>
                  支持多维度指标体系，自动运行评测任务并生成量化报告
                </span>
              </div>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>
                <BarChartOutlined />
              </div>
              <div className={styles.featureText}>
                <span className={styles.featureTitle}>模型排行榜</span>
                <span className={styles.featureDesc}>
                  多模型横向对比，数据驱动决策，快速定位最优方案
                </span>
              </div>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>
                <SafetyCertificateOutlined />
              </div>
              <div className={styles.featureText}>
                <span className={styles.featureTitle}>质量守护</span>
                <span className={styles.featureDesc}>
                  全链路可观测性，实时监控模型表现与应用健康度
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative SVG illustration */}
        <svg
          className={styles.illustration}
          viewBox="0 0 280 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Bar chart */}
          <rect x="20" y="120" width="24" height="60" rx="4" fill="#6366f1" />
          <rect x="54" y="80" width="24" height="100" rx="4" fill="#818cf8" />
          <rect x="88" y="100" width="24" height="80" rx="4" fill="#6366f1" />
          <rect x="122" y="60" width="24" height="120" rx="4" fill="#818cf8" />
          <rect x="156" y="90" width="24" height="90" rx="4" fill="#6366f1" />
          {/* Trend line */}
          <polyline
            points="32,110 66,70 100,90 134,50 168,80 210,40 250,55"
            stroke="#a5adff"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Dots */}
          <circle cx="32" cy="110" r="4" fill="#a5adff" />
          <circle cx="66" cy="70" r="4" fill="#a5adff" />
          <circle cx="100" cy="90" r="4" fill="#a5adff" />
          <circle cx="134" cy="50" r="4" fill="#a5adff" />
          <circle cx="168" cy="80" r="4" fill="#a5adff" />
          <circle cx="210" cy="40" r="5" fill="#fff" stroke="#a5adff" strokeWidth="2" />
          <circle cx="250" cy="55" r="4" fill="#a5adff" />
          {/* Axis */}
          <line x1="10" y1="180" x2="270" y2="180" stroke="#6366f1" strokeWidth="1" opacity="0.5" />
          <line x1="10" y1="20" x2="10" y2="180" stroke="#6366f1" strokeWidth="1" opacity="0.5" />
        </svg>
      </div>

      {/* ── Right Form Panel ─────────────────────────── */}
      <div className={styles.formPanel}>
        <div className={styles.formWrapper}>
          <div className={styles.formHeader}>
            <Title level={2} className={styles.formTitle}>
              登录
            </Title>
            <Paragraph className={styles.formSubtitle}>
              使用工号和密码登录 Eva 评测平台
            </Paragraph>
          </div>

          <Alert
            type="info"
            showIcon
            className={styles.demoAlert}
            message="演示账号"
            description="工号：demo，密码：eva2026"
            action={
              <Button size="small" type="link" onClick={handleFillDemo}>
                一键填充
              </Button>
            }
          />

          <div className={styles.formBody}>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              initialValues={{
                employeeId: 'demo',
                password: 'eva2026',
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
          </div>

          <div className={styles.formFooter}>
            <div>Eva AI Evaluation Platform</div>
            <div className={styles.formFooterVersion}>v1.0.0</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
