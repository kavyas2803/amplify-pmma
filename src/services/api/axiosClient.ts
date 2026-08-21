import axios, { AxiosError } from 'axios';
import { env } from '@/config/environment';
import { getAuthToken } from '@/services/api/tokenStore';
import type { ApiError } from '@/types/api';

export const axiosClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const normalized: ApiError = {
      message:
        (error.response?.data as { message?: string } | undefined)?.message ??
        error.message ??
        'Something went wrong.',
      status: error.response?.status,
      code: error.code,
    };
    return Promise.reject(normalized);
  },
);
