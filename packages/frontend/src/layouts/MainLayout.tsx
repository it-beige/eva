import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Layout, Menu, Avatar, Select, Input, Button } from 'antd';
import {
  LeftOutlined,
  RightOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  DatabaseOutlined,
  BarChartOutlined,
  PlayCircleOutlined,
  FileTextOutlined,
  ExperimentOutlined,
  TrophyOutlined,
  AppstoreOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { toggleSidebar, setActiveTopNav, TopNavType } from '../store/uiSlice';
import styles from './MainLayout.module.css';

const { Header, Sider, Content } = Layout;
const { Option } = Select;

const topNavItems = [
  { key: 'analytics', label: '应用分析', path: '/analytics' },
  { key: 'observability', label: '应用可观测', path: '/observability/traces' },
  { key: 'evaluation', label: '应用评测', path: '/eval/tasks' },
] as const;

const menuItems = [
  {
    type: 'group',
    label: '评测',
    children: [
      { key: '/eval/tasks', icon: <CheckCircleOutlined />, label: '评测任务' },
      { key: '/eval/datasets', icon: <DatabaseOutlined />, label: '评测集' },
      { key: '/eval/metrics', icon: <BarChartOutlined />, label: '评估指标' },
      { key: '/eval/auto-eval', icon: <PlayCircleOutlined />, label: '自动化评测' },
    ],
  },
  {
    type: 'group',
    label: 'Prompt',
    children: [
      { key: '/eval/prompts', icon: <FileTextOutlined />, label: 'Prompt管理' },
      { key: '/eval/playground', icon: <ExperimentOutlined />, label: 'Playground' },
    ],
  },
  {
    type: 'item',
    key: '/eval/leaderboard',
    icon: <TrophyOutlined />,
    label: 'Leaderboard',
  },
  {
    type: 'item',
    key: '/eval/apps',
    icon: <AppstoreOutlined />,
    label: 'AI应用管理',
  },
  {
    type: 'item',
    key: '/eval/settings',
    icon: <SettingOutlined />,
    label: '设置',
  },
];

const MainLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { sidebarCollapsed, activeTopNav } = useAppSelector((state) => state.ui);

  const handleTopNavClick = (nav: (typeof topNavItems)[number]) => {
    dispatch(setActiveTopNav(nav.key as TopNavType));
    navigate(nav.path);
  };

  const handleMenuClick = (key: string) => {
    navigate(key);
  };

  const renderMenuItems = () => {
    return menuItems.map((item, index) => {
      if (item.type === 'group') {
        return (
          <div key={index}>
            {!sidebarCollapsed && (
              <div className={styles.menuGroupTitle}>{item.label}</div>
            )}
            {item.children?.map((child) => (
              <Menu.Item
                key={child.key}
                icon={child.icon}
                onClick={() => handleMenuClick(child.key)}
              >
                {child.label}
              </Menu.Item>
            ))}
          </div>
        );
      }
      return (
        <Menu.Item
          key={item.key}
          icon={item.icon}
          onClick={() => handleMenuClick(item.key)}
        >
          {item.label}
        </Menu.Item>
      );
    });
  };

  return (
    <Layout className={styles.layout}>
      <Header className={styles.header}>
        <div className={styles.logoSection}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>E</div>
            <span>Eva+</span>
          </div>
        </div>

        <nav className={styles.navTabs}>
          {topNavItems.map((nav) => (
            <div
              key={nav.key}
              className={`${styles.navTab} ${
                activeTopNav === nav.key ? styles.navTabActive : ''
              }`}
              onClick={() => handleTopNavClick(nav)}
            >
              {nav.label}
            </div>
          ))}
        </nav>

        <div className={styles.userSection}>
          <Avatar size="default" style={{ backgroundColor: '#5B21B6' }}>
            U
          </Avatar>
        </div>
      </Header>

      <Layout>
        <Sider
          width={220}
          collapsed={sidebarCollapsed}
          collapsedWidth={64}
          className={styles.sider}
          trigger={null}
        >
          <div className={styles.siderHeader}>
            {!sidebarCollapsed && (
              <Select
                className={styles.projectSelector}
                defaultValue="project1"
                bordered={false}
                dropdownMatchSelectWidth={false}
              >
                <Option value="project1">AI评测-战略部开...</Option>
                <Option value="project2">AI评测-产品部项目</Option>
              </Select>
            )}
            <Button
              type="text"
              size="small"
              className={styles.collapseBtn}
              icon={sidebarCollapsed ? <RightOutlined /> : <LeftOutlined />}
              onClick={() => dispatch(toggleSidebar())}
            />
          </div>

          {!sidebarCollapsed && (
            <div className={styles.searchWrapper}>
              <Input
                prefix={<SearchOutlined />}
                placeholder="搜索项目"
                bordered={false}
              />
            </div>
          )}

          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            className={styles.menuWrapper}
            inlineCollapsed={sidebarCollapsed}
          >
            {renderMenuItems()}
          </Menu>
        </Sider>

        <Content className={styles.content}>
          <div className={styles.contentWrapper}>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
