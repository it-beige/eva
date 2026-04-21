import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { App as AntdApp, ConfigProvider, theme } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { store } from './store';
import { router } from './router';

function App() {
  return (
    <Provider store={store}>
      <ConfigProvider
        locale={zhCN}
        theme={{
          algorithm: theme.defaultAlgorithm,
          cssVar: { key: 'eva' },
          hashed: false,
          token: {
            colorPrimary: '#5A63FF',
            colorInfo: '#5A63FF',
            colorSuccess: '#34C759',
            colorWarning: '#FAAD14',
            colorError: '#FF4D4F',
            colorTextBase: '#2F3542',
            colorBgBase: '#F5F7FA',
            colorBgContainer: '#FFFFFF',
            colorBgElevated: '#FFFFFF',
            colorBgLayout: '#EFF1F5',
            colorBorder: '#E3E8F5',
            colorSplit: '#EEF2F8',
            borderRadius: 8,
            borderRadiusLG: 12,
            borderRadiusSM: 6,
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04), 0 4px 12px rgba(71, 92, 122, 0.06)',
            boxShadowSecondary: '0 6px 20px rgba(71, 92, 122, 0.1)',
            fontFamily:
              '"SF Pro Display", "SF Pro Text", "PingFang SC", "Helvetica Neue", Arial, sans-serif',
          },
          components: {
            Layout: {
              bodyBg: 'transparent',
              headerBg: 'transparent',
              siderBg: 'transparent',
            },
            Menu: {
              itemBg: 'transparent',
              subMenuItemBg: 'transparent',
              itemSelectedBg: '#EEF0FF',
              itemSelectedColor: '#5A63FF',
              itemHoverColor: '#2F3542',
              itemHoverBg: '#F0F2F8',
              itemBorderRadius: 8,
              itemHeight: 42,
            },
            Card: {
              colorBgContainer: '#FFFFFF',
              colorBorderSecondary: '#E8ECF4',
              bodyPadding: 20,
              headerPadding: 20,
            },
            Table: {
              headerBg: '#F7F8FC',
              headerColor: '#6B7A90',
              headerSplitColor: '#E8EDF7',
              rowHoverBg: '#F5F7FF',
              borderColor: '#EEF2F8',
              cellPaddingBlock: 14,
            },
            Button: {
              primaryShadow: '0 2px 6px rgba(99, 102, 241, 0.2)',
              defaultShadow: 'none',
              defaultBg: '#F5F7FA',
              defaultBorderColor: '#DDE3EE',
              defaultColor: '#3F4655',
              borderRadius: 8,
              controlHeight: 36,
              fontWeight: 500,
            },
            Input: {
              activeBorderColor: '#5A63FF',
              hoverBorderColor: '#BFC8FF',
              activeShadow: '0 0 0 2px rgba(99, 102, 241, 0.08)',
              colorBgContainer: '#FFFFFF',
            },
            Select: {
              activeBorderColor: '#5A63FF',
              hoverBorderColor: '#BFC8FF',
              colorBgContainer: '#FFFFFF',
              optionSelectedBg: '#EEF0FF',
            },
            Dropdown: {
              colorBgElevated: '#FFFFFF',
            },
            Tabs: {
              itemColor: '#5E677A',
              itemHoverColor: '#5A63FF',
              itemSelectedColor: '#5A63FF',
              inkBarColor: '#5A63FF',
            },
            Modal: {
              contentBg: '#FFFFFF',
              headerBg: '#FFFFFF',
              borderRadiusLG: 14,
            },
            Segmented: {
              trackBg: '#ECEEF4',
              itemSelectedBg: '#FFFFFF',
            },
            Tag: {
              borderRadiusSM: 4,
            },
            Badge: {
              dotSize: 8,
            },
            Statistic: {
              contentFontSize: 28,
              titleFontSize: 13,
            },
          },
        }}
      >
        <AntdApp>
          <RouterProvider router={router} />
        </AntdApp>
      </ConfigProvider>
    </Provider>
  );
}

export default App;
