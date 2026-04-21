import React, { useState } from 'react';
import {
  SettingOutlined,
  TeamOutlined,
  KeyOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import ProjectSettings from './components/ProjectSettings';
import MemberManagement from './components/MemberManagement';
import TokenManagement from './components/TokenManagement';
import PageContainer from '../../components/page/PageContainer';
import styles from './SettingsPage.module.scss';

interface NavItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    key: 'project',
    label: '项目设置',
    icon: <SettingOutlined />,
    description: '基本信息',
  },
  {
    key: 'members',
    label: '成员管理',
    icon: <TeamOutlined />,
    description: '团队协作',
  },
  {
    key: 'tokens',
    label: 'API Token',
    icon: <KeyOutlined />,
    description: '接口凭证',
  },
];

const PANEL_MAP: Record<string, React.FC> = {
  project: ProjectSettings,
  members: MemberManagement,
  tokens: TokenManagement,
};

const SettingsPage: React.FC = () => {
  const [activeKey, setActiveKey] = useState('project');
  const ActivePanel = PANEL_MAP[activeKey] ?? ProjectSettings;

  return (
    <PageContainer
      description="管理项目配置、团队成员和 API Token。"
      extra={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--eva-text-tertiary)', fontSize: 13 }}>
          <SafetyCertificateOutlined />
          <span>仅管理员可修改设置</span>
        </div>
      }
    >
      <div className={styles.settingsLayout}>
        {/* 左侧导航 */}
        <aside className={styles.sideNav}>
          <nav className={styles.navCard}>
            {NAV_ITEMS.map((item) => (
              <div
                key={item.key}
                className={`${styles.navItem} ${activeKey === item.key ? styles.navItemActive : ''}`}
                onClick={() => setActiveKey(item.key)}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                <span className={styles.navLabel}>{item.label}</span>
              </div>
            ))}
          </nav>
        </aside>

        {/* 右侧内容 */}
        <main className={styles.contentArea}>
          <ActivePanel />
        </main>
      </div>
    </PageContainer>
  );
};

export default SettingsPage;
