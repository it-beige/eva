import { jsx as _jsx } from "react/jsx-runtime";
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { store } from './store';
import { router } from './router';
function App() {
    return (_jsx(Provider, { store: store, children: _jsx(ConfigProvider, { locale: zhCN, theme: {
                token: {
                    colorPrimary: '#5B21B6',
                    colorInfo: '#5B21B6',
                },
            }, children: _jsx(RouterProvider, { router: router }) }) }));
}
export default App;
