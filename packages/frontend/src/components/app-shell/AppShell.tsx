import { Button, Layout, Menu } from 'antd';
import {
  LeftOutlined,
  RightOutlined,
  FileTextOutlined,
  BookOutlined,
  SmileOutlined,
  CustomerServiceOutlined,
  SwapOutlined,
} from '@ant-design/icons';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import type { MenuProps } from 'antd';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { setActiveTopNav, toggleSidebar } from '../../store/uiSlice';
import {
  topNavItems,
  getTopNavFromPath,
  type ShellMenuItem,
} from '../../app/navigation';
import { clearSelectedProject } from '../../store/projectSlice';
import { clearSession, getCurrentUser, hasRole } from '../../auth/session';
import PageTabs from '../page/PageTabs';
import styles from './AppShell.module.scss';

const { Header, Sider, Content } = Layout;

type AppShellProps = {
  menuItems: ShellMenuItem[];
};

const AppShell = ({ menuItems }: AppShellProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { sidebarCollapsed } = useAppSelector((state) => state.ui);
  const selectedProject = useAppSelector((state) => state.project.selectedProject);
  const activeTopNav = getTopNavFromPath(location.pathname);
  const currentUser = getCurrentUser();

  const handleTopNavClick = (path: string, key: string) => {
    dispatch(setActiveTopNav(key as ReturnType<typeof getTopNavFromPath>));
    navigate(path);
  };

  const handleMenuClick = (key: string) => {
    navigate(key);
  };

  const visibleMenuItems = menuItems
    .map((item) => {
      if (item.type === 'group') {
        return {
          ...item,
          children: item.children.filter(
            (child) =>
              !child.requiredRole ||
              hasRole(currentUser, child.requiredRole),
          ),
        };
      }

      return item;
    })
    .filter(
      (item) =>
        (item.type === 'group' && item.children.length > 0) ||
        (item.type === 'item' &&
          (!item.requiredRole || hasRole(currentUser, item.requiredRole))),
    );

  const handleLogout = () => {
    clearSession();
    navigate('/login', { replace: true });
  };

  const menuEntries: MenuProps['items'] = visibleMenuItems.map((item, index) => {
    if (item.type === 'group') {
      return {
        type: 'group',
        key: `group-${index}`,
        label: sidebarCollapsed ? null : (
          <div className={styles.menuGroupTitle}>{item.label}</div>
        ),
        children: item.children.map((child) => ({
          key: child.key,
          icon: child.icon,
          label: child.label,
        })),
      };
    }

    return {
      key: item.key,
      icon: item.icon,
      label: item.label,
    };
  });

  return (
    <Layout className={styles.layout}>
      <Header className={styles.header}>
        <div className={styles.logoSection}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>E</div>
            <span className={styles.logoName}>Eva+</span>
          </div>
        </div>

        <nav className={styles.navTabs}>
          {topNavItems.map((nav) => (
            <button
              type="button"
              key={nav.key}
              className={`${styles.navTab} ${
                activeTopNav === nav.key ? styles.navTabActive : ''
              }`}
              onClick={() => handleTopNavClick(nav.path, nav.key)}
            >
              {nav.label}
            </button>
          ))}
        </nav>

        <div className={styles.userSection}>
          <span className={styles.headerLink}>
            <FileTextOutlined />
            指标口径说明
          </span>
          <span className={styles.headerLink}>
            <BookOutlined />
            帮助文档
          </span>
          <button
            type="button"
            className={styles.avatarButton}
            onClick={handleLogout}
            title={currentUser ? `${currentUser.name}，点击退出` : '退出'}
          >
            <SmileOutlined />
          </button>
        </div>
      </Header>

      <Layout className={styles.shellBody}>
        <Sider
          width={280}
          collapsed={sidebarCollapsed}
          collapsedWidth={88}
          className={styles.sider}
          trigger={null}
        >
          <div className={styles.siderInner}>
            <div className={styles.siderHeader}>
              {!sidebarCollapsed && (
                <div className={styles.projectSelector}>
                  {selectedProject ? (
                    <Button
                      type="text"
                      block
                      className={styles.projectSwitchBtn}
                      icon={<SwapOutlined />}
                      onClick={() => {
                        dispatch(clearSelectedProject());
                        navigate('/projects');
                      }}
                    >
                      {selectedProject.projectName}
                    </Button>
                  ) : (
                    <Button
                      type="text"
                      block
                      onClick={() => navigate('/projects')}
                    >
                      选择项目
                    </Button>
                  )}
                </div>
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
              items={menuEntries}
              onClick={({ key }) => handleMenuClick(String(key))}
            />
          </div>
        </Sider>

        <Content className={styles.content}>
          <PageTabs />
          <div className={styles.contentWrapper}>
            <div className={styles.contentInner}>
              <Outlet />
            </div>
          </div>
        </Content>
      </Layout>

      <span className={styles.assistantFab}>
        <CustomerServiceOutlined />
      </span>
    </Layout>
  );
};

export default AppShell;
