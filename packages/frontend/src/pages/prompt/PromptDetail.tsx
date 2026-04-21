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
import { formatDateTime } from '../../utils/format';
import styles from './Prompt.module.scss';

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
      <div className={styles.loadingState}>
        <Spin size="large" />
      </div>
    );
  }

  if (!currentPrompt) {
    return (
      <div className={styles.emptyState}>
        <Empty description="Prompt 不存在或已被删除" />
        <div className={styles.emptyActions}>
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

      <div className={styles.detailActions}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/eval/prompts')}
        >
          返回
        </Button>
      </div>

      <Card title="基本信息" className={styles.infoCard}>
        <Descriptions column={2}>
          <Descriptions.Item label="名称">
            {currentPrompt.name}
          </Descriptions.Item>
          <Descriptions.Item label="版本号">
            <Tag className="eva-pillTagBlue">v{currentPrompt.version}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="描述">
            {currentPrompt.description || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="创建人">
            {currentPrompt.createdBy || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="创建时间">
            {formatDateTime(currentPrompt.createdAt)}
          </Descriptions.Item>
          <Descriptions.Item label="更新时间">
            {formatDateTime(currentPrompt.updatedAt)}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="当前 Prompt 内容" className={styles.contentCard}>
        <pre className={styles.promptContent}>
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
