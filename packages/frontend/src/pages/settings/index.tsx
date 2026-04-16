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
    <div className="h-full p-6">
      <h1 className="text-2xl font-bold mb-6">设置</h1>
      <Card>
        <Tabs
          activeKey={activeKey}
          onChange={setActiveKey}
          items={tabItems}
        />
      </Card>
    </div>
  );
};

export default SettingsPage;
