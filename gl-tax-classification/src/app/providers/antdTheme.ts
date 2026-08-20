import type { ThemeConfig } from 'antd';

// Mirrors the Tailwind tokens in src/index.css. Keep these two in sync
// whenever the palette changes.
export const antdTheme: ThemeConfig = {
  token: {
    colorPrimary: '#4f46e5',
    colorPrimaryHover: '#4338ca',
    colorPrimaryActive: '#3730a3',
    colorBgLayout: '#f4f4f6',
    colorBgContainer: '#ffffff',
    colorBorder: '#e2e2e5',
    colorBorderSecondary: '#e2e2e5',
    colorText: '#1a1a1a',
    colorTextSecondary: '#6b7280',
    colorTextTertiary: '#9ca3af',
    colorSuccess: '#16833b',
    colorSuccessBg: '#eaf7ee',
    colorWarning: '#ad6800',
    colorWarningBg: '#fff7e6',
    colorError: '#cf1322',
    colorErrorBg: '#fff1f0',
    colorInfo: '#1d4ed8',
    colorInfoBg: '#e6f0ff',
    borderRadius: 8,
    fontFamily:
      'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  components: {
    Table: {
      headerBg: '#fafafa',
      headerColor: '#1a1a1a',
      borderColor: '#e2e2e5',
      rowHoverBg: '#f4f4f6',
    },
    Menu: {
      darkItemBg: '#000000',
      darkItemSelectedBg: '#4f46e5',
      darkItemHoverBg: '#18181b',
      darkItemColor: '#e4e4e7',
      darkItemSelectedColor: '#ffffff',
    },
    Modal: {
      borderRadiusLG: 12,
    },
    Button: {
      borderRadius: 8,
      controlHeight: 38,
    },
    Input: {
      borderRadius: 8,
      controlHeight: 38,
    },
    Select: {
      borderRadius: 8,
      controlHeight: 38,
    },
    Tag: {
      borderRadiusSM: 6,
    },
  },
};
