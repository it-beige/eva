import { useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CloseOutlined, MoreOutlined } from '@ant-design/icons';
import { Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import {
  setActiveTab,
  removeTab,
  removeOtherTabs,
  removeAllTabs,
} from '../../store/tabsSlice';
import styles from './PageTabs.module.scss';

/**
 * 页面标签栏组件
 *
 * 位于 AppShell 的 header 与 content 之间，提供多页面快速切换能力。
 * 标签页状态由 Redux tabsSlice 统一管理，PageContainer 负责注册标签。
 */
const PageTabs = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { tabs, activeKey } = useAppSelector((state) => state.tabs);
  const listRef = useRef<HTMLDivElement>(null);

  // 激活标签变化时自动滚动到可见区域
  useEffect(() => {
    if (!listRef.current) return;
    const activeEl = listRef.current.querySelector(`[data-tab-key="${activeKey}"]`);
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }
  }, [activeKey]);

  /** 点击标签 → 切换激活 + 路由跳转 */
  const handleTabClick = useCallback(
    (key: string) => {
      dispatch(setActiveTab(key));
      navigate(key);
    },
    [dispatch, navigate],
  );

  /** 关闭标签 */
  const handleClose = useCallback(
    (key: string, e: React.MouseEvent) => {
      e.stopPropagation();

      // 如果关闭的是当前激活标签，先计算下一个要激活的标签
      if (key === activeKey) {
        const index = tabs.findIndex((t) => t.key === key);
        const nextTab = tabs[index + 1] ?? tabs[index - 1];
        const nextKey = nextTab?.key ?? '/eval/tasks';
        dispatch(removeTab(key));
        navigate(nextKey);
      } else {
        dispatch(removeTab(key));
      }
    },
    [activeKey, tabs, dispatch, navigate],
  );

  /** 右键/更多菜单 */
  const getContextMenuItems = useCallback(
    (key: string): MenuProps['items'] => {
      const tab = tabs.find((t) => t.key === key);
      return [
        tab?.closable
          ? {
              key: 'close',
              label: '关闭',
              onClick: () => {
                const index = tabs.findIndex((t) => t.key === key);
                const nextTab = tabs[index + 1] ?? tabs[index - 1];
                dispatch(removeTab(key));
                if (key === activeKey) {
                  navigate(nextTab?.key ?? '/eval/tasks');
                }
              },
            }
          : null,
        {
          key: 'closeOthers',
          label: '关闭其他',
          onClick: () => {
            dispatch(removeOtherTabs(key));
            dispatch(setActiveTab(key));
            navigate(key);
          },
        },
        {
          key: 'closeAll',
          label: '关闭所有',
          onClick: () => {
            dispatch(removeAllTabs());
            navigate('/eval/tasks');
          },
        },
      ].filter(Boolean) as MenuProps['items'];
    },
    [tabs, activeKey, dispatch, navigate],
  );

  /** 全局更多操作 */
  const globalMenuItems: MenuProps['items'] = [
    {
      key: 'closeOthers',
      label: '关闭其他标签',
      onClick: () => {
        dispatch(removeOtherTabs(activeKey));
      },
    },
    {
      key: 'closeAll',
      label: '关闭所有标签',
      onClick: () => {
        dispatch(removeAllTabs());
        navigate('/eval/tasks');
      },
    },
  ];

  return (
    <div className={styles.tabsBar}>
      <div className={styles.tabsList} ref={listRef}>
        {tabs.map((tab) => (
          <Dropdown
            key={tab.key}
            menu={{ items: getContextMenuItems(tab.key) }}
            trigger={['contextMenu']}
          >
            <button
              type="button"
              data-tab-key={tab.key}
              className={`${styles.tab} ${tab.key === activeKey ? styles.tabActive : ''} ${!tab.closable ? styles.tabUnclosable : ''}`}
              onClick={() => handleTabClick(tab.key)}
            >
              <span className={styles.tabTitle}>{tab.title}</span>
              {tab.closable && (
                <span
                  className={styles.tabClose}
                  onClick={(e) => handleClose(tab.key, e)}
                  role="button"
                  tabIndex={-1}
                >
                  <CloseOutlined />
                </span>
              )}
            </button>
          </Dropdown>
        ))}
      </div>

      <div className={styles.tabActions}>
        <Dropdown menu={{ items: globalMenuItems }} trigger={['click']} placement="bottomRight">
          <button type="button" className={styles.actionBtn} title="标签操作">
            <MoreOutlined />
          </button>
        </Dropdown>
      </div>
    </div>
  );
};

export default PageTabs;
