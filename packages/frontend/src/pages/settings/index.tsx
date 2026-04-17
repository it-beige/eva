import React, { useState } from 'react';
import { Tabs, Card } from 'antd';
import {
  SettingOutlined,
  TeamOutlined,
  KeyOutlined,
} from '@ant-design/icons';
import ProjectSettings from './components/ProjectSettings';
import MemberManagement from './components/MemberManagement';
import TokenManagement from './components/TokenManagement';
import PageContainer from '../../components/page/PageContainer';

const SettingsPage: React.FC = () => {
  const [activeKey, setActiveKey] = useState('project');

  const tabItems = [
    {
      key: 'project',
      label: (
        <span>
          <SettingOutlined />
          项目设置
        </span>
      ),
      children: <ProjectSettings />,
    },
    {
      key: 'members',
      label: (
        <span>
          <TeamOutlined />
          成员管理
        </span>
      ),
      children: <MemberManagement />,
    },
    {
      key: 'tokens',
      label: (
        <span>
          <KeyOutlined />
          API Token
        </span>
      ),
      children: <TokenManagement />,
    },
  ];

  return (
    <PageContainer description="管理项目配置、团队成员和 API Token。">
      <Card>
        <Tabs
          activeKey={activeKey}
          onChange={setActiveKey}
          items={tabItems}
        />
      </Card>
    </PageContainer>
  );
};

export default SettingsPage;
