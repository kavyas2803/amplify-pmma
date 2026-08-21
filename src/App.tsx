import { ConfigProvider } from 'antd';
import { AuthProvider } from '@/app/providers/AuthProvider';
import { AppRouter } from '@/app/router/AppRouter';
import { antdTheme } from '@/app/providers/antdTheme';

export default function App() {
  return (
    <ConfigProvider theme={antdTheme}>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </ConfigProvider>
  );
}
