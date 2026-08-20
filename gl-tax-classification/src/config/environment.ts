// Centralized environment configuration.
// Reads from Vite env vars so it can be swapped per-environment without
// touching application code.

export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? '',
  useMockData: (import.meta.env.VITE_USE_MOCK_DATA ?? 'true') === 'true',
  appEnv: import.meta.env.VITE_APP_ENV ?? 'development',
  pollingIntervalMs: Number(import.meta.env.VITE_POLLING_INTERVAL_MS ?? 3000),
};
