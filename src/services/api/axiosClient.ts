import axios, { AxiosError } from 'axios';
import { fetchAuthSession } from 'aws-amplify/auth';
import { env } from '@/config/environment';
import type { ApiError } from '@/types/api';

export const axiosClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosClient.interceptors.request.use(async (config) => {
  try {
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // No authenticated session; request proceeds without an Authorization header.
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
