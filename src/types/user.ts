export interface AuthUser {
  email: string;
  displayName: string;
  role: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResult {
  user: AuthUser;
  token: string;
}
