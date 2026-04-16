import { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Breadcrumb,
  Card,
  Descriptions,
  Tag,
  Spin,
  Empty,
  Button,
} from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { fetchPrompt, fetchVersions } from '../../store/promptSlice';
import VersionCompare from './components/VersionCompare';
import styles from './Prompt.module.css';

const PromptDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentPrompt, versions, loading } = useAppSelector(
    (state) => state.prompt
  );

  useEffect(() => {
    if (id) {
      dispatch(fetchPrompt(id));
      dispatch(fetchVersions(id));
    }
  }, [id, dispatch]);

  if (loading && !currentPrompt) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!currentPrompt) {
    return (
      <div style={{ padding: 24 }}>
        <Empty description="Prompt 不存在或已被删除" />
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Button onClick={() => navigate('/eval/prompts')}>
            返回列表
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.detailContainer}>
      <Breadcrumb className={styles.breadcrumb}>
        <Breadcrumb.Item>
          <Link to="/eval/prompts">Prompt管理</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>{currentPrompt.name}</Breadcrumb.Item>
      </Breadcrumb>

      <div style={{ marginBottom: 16 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/eval/prompts')}
        >
          返回
        </Button>
      </div>

      <Card title="基本信息" style={{ marginBottom: 24 }}>
        <Descriptions column={2}>
          <Descriptions.Item label="名称">
            {currentPrompt.name}
          </Descriptions.Item>
          <Descriptions.Item label="版本号">
            <Tag color="blue">v{currentPrompt.version}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="描述">
            {currentPrompt.description || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="创建人">
            {currentPrompt.createdBy || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="创建时间">
            {new Date(currentPrompt.createdAt).toLocaleString()}
          </Descriptions.Item>
          <Descriptions.Item label="更新时间">
            {new Date(currentPrompt.updatedAt).toLocaleString()}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="当前 Prompt 内容" style={{ marginBottom: 24 }}>
        <pre
          style={{
            background: '#f5f5f5',
            padding: 16,
            borderRadius: 4,
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
            fontFamily: 'monospace',
            fontSize: 13,
            lineHeight: 1.6,
            maxHeight: 400,
            overflow: 'auto',
          }}
        >
          {currentPrompt.content}
        </pre>
      </Card>

      <Card title="版本对比">
        <VersionCompare versions={versions} />
      </Card>
    </div>
  );
};

export default PromptDetailPage;
