export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  fullName?: string;
}

export interface AuthToken {
  accessToken: string;
  tokenType: string;
  refreshToken: string;
}

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  fullName?: string;
}

export interface AuthState {
  user: AuthUser | null;
  tokens: AuthToken | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}