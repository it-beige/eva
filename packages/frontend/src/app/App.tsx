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
            colorBgBase: '#FFFFFF',
            colorBgContainer: '#FFFFFF',
            colorBgElevated: '#FFFFFF',
            colorBorder: '#E3E8F5',
            colorSplit: '#EEF2F8',
            borderRadius: 8,
            borderRadiusLG: 10,
            borderRadiusSM: 6,
            boxShadow: '0 6px 20px rgba(71, 92, 122, 0.08)',
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
              itemHoverBg: '#F6F8FC',
              itemBorderRadius: 8,
              itemHeight: 42,
            },
            Card: {
              colorBgContainer: '#FFFFFF',
              colorBorderSecondary: '#EEF2F8',
              bodyPadding: 20,
              headerPadding: 20,
            },
            Table: {
              headerBg: '#FFFFFF',
              headerColor: '#7F8DA3',
              rowHoverBg: '#FAFBFF',
              borderColor: '#E8EDF7',
            },
            Button: {
              primaryShadow: 'none',
              defaultShadow: 'none',
              borderRadius: 8,
              controlHeight: 38,
            },
            Input: {
              activeBorderColor: '#5A63FF',
              hoverBorderColor: '#BFC8FF',
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
            },
            Segmented: {
              trackBg: '#F5F7FC',
              itemSelectedBg: '#FFFFFF',
            },
          },
        }}
      >
        <AntdApp>
          <RouterProvider
            router={router}
            future={{
              v7_startTransition: true,
            }}
          />
        </AntdApp>
      </ConfigProvider>
    </Provider>
  );
}

export default App;
