import React from 'react';
import { Card, Avatar, Dropdown, Button, Typography, Space } from 'antd';
import {
  MoreOutlined,
  LinkOutlined,
  ExperimentOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import type { ApplicationResponse } from '@eva/shared';
import styles from './AppCard.module.scss';

const { Text } = Typography;

interface AppCardProps {
  application: ApplicationResponse;
  onEdit: (app: ApplicationResponse) => void;
  onDelete: (app: ApplicationResponse) => void;
  onEvaluate: (app: ApplicationResponse) => void;
}

const AppCard: React.FC<AppCardProps> = ({
  application,
  onEdit,
  onDelete,
  onEvaluate,
}) => {
  const getInitial = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      '#5A63FF',
      '#34C759',
      '#FAAD14',
      '#FF4D4F',
      '#722ED1',
      '#13C2C2',
      '#EB2F96',
      '#FA541C',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const handleMenuClick = (key: string) => {
    switch (key) {
      case 'edit':
        onEdit(application);
        break;
      case 'delete':
        onDelete(application);
        break;
    }
  };

  const items = [
    {
      key: 'edit',
      icon: <EditOutlined />,
      label: '编辑',
    },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: '删除',
      danger: true,
    },
  ];

  const handleOpenRepo = () => {
    if (application.gitRepoUrl) {
      window.open(application.gitRepoUrl, '_blank');
    }
  };

  return (
    <Card hoverable className={styles.card} styles={{ body: { padding: 16 } }}>
      <div className={styles.cardHeader}>
        <Space>
          <Avatar
            style={{ backgroundColor: getAvatarColor(application.name) }}
            size={40}
          >
            {getInitial(application.name)}
          </Avatar>
          <Text strong className={styles.appName} title={application.name}>
            {application.name}
          </Text>
        </Space>
        <Dropdown
          menu={{ items, onClick: ({ key }) => handleMenuClick(key) }}
          placement="bottomRight"
          trigger={['click']}
        >
          <Button type="text" icon={<MoreOutlined />} size="small" />
        </Dropdown>
      </div>

      <div className={styles.cardBody}>
        <div className={styles.fieldRow}>
          <Text type="secondary" className={styles.fieldLabel}>
            应用描述:{' '}
          </Text>
          <Text
            className={styles.fieldValue}
            ellipsis={{ tooltip: application.description || '暂无描述' }}
          >
            {application.description || '暂无描述'}
          </Text>
        </div>
        <div className={styles.fieldRow}>
          <Text type="secondary" className={styles.fieldLabel}>
            最新版本:{' '}
          </Text>
          <Text className={styles.fieldValue}>
            {application.latestVersion || '无'}
          </Text>
        </div>
      </div>

      <div className={styles.cardFooter}>
        <Button
          type="default"
          icon={<ExperimentOutlined />}
          onClick={() => onEvaluate(application)}
          className={styles.footerButton}
        >
          评测
        </Button>
        <Button
          type="default"
          icon={<LinkOutlined />}
          onClick={handleOpenRepo}
          disabled={!application.gitRepoUrl}
          className={styles.footerButton}
        >
          代码仓库
        </Button>
      </div>
    </Card>
  );
};

export default AppCard;
