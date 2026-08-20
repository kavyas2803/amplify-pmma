import { MOCK_CREDENTIALS, MOCK_USER } from '@/mock-data/authCredentials';
import type { LoginPayload, LoginResult } from '@/types/user';

const MOCK_LATENCY_MS = 600;

function delay<T>(value: T, ms = MOCK_LATENCY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export async function login(payload: LoginPayload): Promise<LoginResult> {
  await delay(null);
  const isValid =
    payload.email.trim().toLowerCase() === MOCK_CREDENTIALS.email.toLowerCase() &&
    payload.password === MOCK_CREDENTIALS.password;

  if (!isValid) {
    return Promise.reject({ message: 'Invalid email or password.', status: 401 });
  }

  return {
    user: MOCK_USER,
    token: 'mock-session-token',
  };
}

export async function logout(): Promise<void> {
  await delay(undefined, 200);
}
