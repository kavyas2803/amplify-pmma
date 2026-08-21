import type { ThemeConfig } from 'antd';

// Mirrors the Tailwind tokens in src/index.css. Keep these two in sync
// whenever the palette changes.
export const antdTheme: ThemeConfig = {
  token: {
    colorPrimary: '#4f46e5',
    colorPrimaryHover: '#4338ca',
    colorPrimaryActive: '#3730a3',
    colorBgLayout: '#f5f6f8',
    colorBgContainer: '#ffffff',
    colorBorder: '#e5e7eb',
    colorBorderSecondary: '#e5e7eb',
    colorText: '#111827',
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
    borderRadius: 7,
    fontSize: 13,
    controlHeight: 38,
    fontFamily:
      'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  components: {
    Table: {
      headerBg: '#f8fafc',
      headerColor: '#374151',
      headerSplitColor: 'transparent',
      borderColor: '#e2e2e5',
      rowHoverBg: '#f4f4f6',
      cellPaddingBlock: 13,
      cellPaddingInline: 16,
    },
    Menu: {
      darkItemBg: '#000000',
      darkItemSelectedBg: '#4f46e5',
      darkItemHoverBg: '#18181b',
      darkItemColor: '#e4e4e7',
      darkItemSelectedColor: '#ffffff',
    },
    Modal: {
      borderRadiusLG: 9,
    },
    Button: {
      borderRadius: 7,
    },
    Input: {
      borderRadius: 7,
    },
    Select: {
      borderRadius: 7,
    },
    Tag: {
      borderRadiusSM: 6,
    },
  },
};
