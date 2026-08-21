import { axiosClient } from '@/services/api/axiosClient';
import type { LoginPayload, LoginResult } from '@/types/user';

// Real backend implementation. Not used while env.useMockData is true.
export async function login(payload: LoginPayload): Promise<LoginResult> {
  const response = await axiosClient.post<LoginResult>('/auth/login', payload);
  return response.data;
}

export async function logout(): Promise<void> {
  await axiosClient.post('/auth/logout');
}
