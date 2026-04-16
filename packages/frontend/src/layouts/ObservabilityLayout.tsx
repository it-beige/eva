import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Layout, Menu, Avatar, Select, Button } from 'antd';
import { LeftOutlined, RightOutlined, SearchOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { toggleSidebar, setActiveTopNav } from '../store/uiSlice';
import styles from './MainLayout.module.css';

const { Header, Sider, Content } = Layout;
const { Option } = Select;

const topNavItems = [
  { key: 'analytics', label: '应用分析', path: '/analytics' },
  { key: 'observability', label: '应用可观测', path: '/observability/traces' },
  { key: 'evaluation', label: '应用评测', path: '/eval/tasks' },
] as const;

const observabilityMenuItems = [
  {
    key: '/observability/traces',
    icon: <SearchOutlined />,
    label: '调用明细',
  },
];

const ObservabilityLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { sidebarCollapsed, activeTopNav } = useAppSelector((state) => state.ui);

  const handleTopNavClick = (nav: (typeof topNavItems)[number]) => {
    dispatch(setActiveTopNav(nav.key as 'analytics' | 'observability' | 'evaluation'));
    navigate(nav.path);
  };

  const handleMenuClick = (key: string) => {
    navigate(key);
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

          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            className={styles.menuWrapper}
            inlineCollapsed={sidebarCollapsed}
          >
            {observabilityMenuItems.map((item) => (
              <Menu.Item
                key={item.key}
                icon={item.icon}
                onClick={() => handleMenuClick(item.key)}
              >
                {item.label}
              </Menu.Item>
            ))}
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

export default ObservabilityLayout;
