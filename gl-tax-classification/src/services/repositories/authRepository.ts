import {
  getCurrentUser as getCognitoCurrentUser,
  signIn,
  signOut,
  fetchUserAttributes,
  fetchAuthSession,
} from 'aws-amplify/auth';

import type { AuthUser, LoginPayload } from '@/types/user';

async function buildAuthUser(
  fallbackEmail = '',
): Promise<AuthUser> {
  const attributes = await fetchUserAttributes();

  return {
    email: attributes.email ?? fallbackEmail,
    displayName:
      attributes.name ??
      attributes.email ??
      fallbackEmail,
    role: 'FinanceUser',
  };
}

export async function loginUser(
  payload: LoginPayload,
): Promise<AuthUser> {
  const result = await signIn({
    username: payload.email,
    password: payload.password,
  });

  if (!result.isSignedIn) {
    throw new Error(
      `Authentication requires: ${result.nextStep.signInStep}`,
    );
  }

  return buildAuthUser(payload.email);
}

export async function logoutUser(): Promise<void> {
  await signOut();
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    await getCognitoCurrentUser();

    return await buildAuthUser();
  } catch {
    return null;
  }
}

export async function isAuthenticated(): Promise<boolean> {
  try {
    const session = await fetchAuthSession();
    return Boolean(session.tokens?.accessToken);
  } catch {
    return false;
  }
}