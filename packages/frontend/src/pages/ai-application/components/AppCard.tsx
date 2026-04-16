import React from 'react';
import { Card, Avatar, Dropdown, Button, Typography, Space } from 'antd';
import {
  MoreOutlined,
  LinkOutlined,
  ExperimentOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { AIApplication } from '../../../services/aiApplicationApi';

const { Text } = Typography;

interface AppCardProps {
  application: AIApplication;
  onEdit: (app: AIApplication) => void;
  onDelete: (app: AIApplication) => void;
  onEvaluate: (app: AIApplication) => void;
}

const AppCard: React.FC<AppCardProps> = ({
  application,
  onEdit,
  onDelete,
  onEvaluate,
}) => {
  // 获取首字母作为头像
  const getInitial = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  // 获取头像颜色
  const getAvatarColor = (name: string) => {
    const colors = [
      '#1677ff',
      '#52c41a',
      '#faad14',
      '#f5222d',
      '#722ed1',
      '#13c2c2',
      '#eb2f96',
      '#fa541c',
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
    <Card
      hoverable
      style={{
        borderRadius: 8,
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.06)',
        transition: 'all 0.3s ease',
      }}
      bodyStyle={{ padding: 16 }}
    >
      {/* 头部：图标 + 名称 + 更多操作 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}
      >
        <Space>
          <Avatar
            style={{
              backgroundColor: getAvatarColor(application.name),
              fontSize: 16,
              fontWeight: 500,
            }}
            size={40}
          >
            {getInitial(application.name)}
          </Avatar>
          <Text
            strong
            style={{
              fontSize: 16,
              maxWidth: 140,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            title={application.name}
          >
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

      {/* 中间：描述 + 版本 */}
      <div style={{ marginBottom: 16, minHeight: 60 }}>
        <div style={{ marginBottom: 8 }}>
          <Text type="secondary" style={{ fontSize: 13 }}>
            应用描述:{' '}
          </Text>
          <Text
            style={{ fontSize: 13 }}
            ellipsis={{ tooltip: application.description || '暂无描述' }}
          >
            {application.description || '暂无描述'}
          </Text>
        </div>
        <div>
          <Text type="secondary" style={{ fontSize: 13 }}>
            最新版本:{' '}
          </Text>
          <Text style={{ fontSize: 13 }}>
            {application.latestVersion || '无'}
          </Text>
        </div>
      </div>

      {/* 底部：操作按钮 */}
      <div style={{ display: 'flex', gap: 8 }}>
        <Button
          type="default"
          icon={<ExperimentOutlined />}
          onClick={() => onEvaluate(application)}
          style={{ flex: 1 }}
        >
          评测
        </Button>
        <Button
          type="default"
          icon={<LinkOutlined />}
          onClick={handleOpenRepo}
          disabled={!application.gitRepoUrl}
          style={{ flex: 1 }}
        >
          代码仓库
        </Button>
      </div>
    </Card>
  );
};

export default AppCard;
