import { env } from '@/config/environment';
import * as realAuthService from '@/services/api/authService';
import * as mockAuthService from '@/mock-data/mockAuthService';
import {
  clearAuthToken,
  getStoredUser,
  setAuthToken,
  setStoredUser,
} from '@/services/api/tokenStore';
import type { AuthUser, LoginPayload } from '@/types/user';

const impl = env.useMockData ? mockAuthService : realAuthService;

export async function loginUser(payload: LoginPayload): Promise<AuthUser> {
  const result = await impl.login(payload);
  setAuthToken(result.token);
  setStoredUser(result.user);
  return result.user;
}

export async function logoutUser(): Promise<void> {
  try {
    await impl.logout();
  } finally {
    clearAuthToken();
  }
}

export function getCurrentUser(): AuthUser | null {
  return getStoredUser<AuthUser>();
}

export function isAuthenticated(): boolean {
  return getCurrentUser() !== null;
}
