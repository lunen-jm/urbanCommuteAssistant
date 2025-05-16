import axios from 'axios';
import { AuthToken, AuthUser, LoginCredentials, RegisterData } from '../types/auth';

// Use the environment variable that's defined in .env
const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000/api';

// Response from login
interface LoginResponse {
  access_token: string;
  token_type: string;
  refresh_token: string;
  user: {
    id: number;
    username: string;
    email: string;
    full_name: string | null;
  };
}

export const login = async (credentials: LoginCredentials): Promise<{ user: AuthUser; tokens: AuthToken }> => {
  try {
    // Using FormData for OAuth2 compatibility
    const formData = new FormData();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);

    const response = await axios.post<LoginResponse>(`${API_URL}/auth/token`, formData);
    
    const user: AuthUser = {
      id: response.data.user.id,
      username: response.data.user.username,
      email: response.data.user.email,
      fullName: response.data.user.full_name || undefined,
    };
    
    const tokens: AuthToken = {
      accessToken: response.data.access_token,
      tokenType: response.data.token_type,
      refreshToken: response.data.refresh_token,
    };
    
    // Store tokens in localStorage
    localStorage.setItem('tokens', JSON.stringify(tokens));
    
    return { user, tokens };
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.detail || 'Login failed');
    }
    throw new Error('Login failed');
  }
};

export const register = async (registerData: RegisterData): Promise<AuthUser> => {
  try {
    const response = await axios.post<AuthUser>(`${API_URL}/auth/register`, {
      username: registerData.username,
      email: registerData.email,
      password: registerData.password,
      full_name: registerData.fullName,
    });
    
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.detail || 'Registration failed');
    }
    throw new Error('Registration failed');
  }
};

export const logout = (): void => {
  localStorage.removeItem('tokens');
};

export const refreshToken = async (): Promise<AuthToken> => {
  const storedTokens = localStorage.getItem('tokens');
  if (!storedTokens) {
    throw new Error('No refresh token available');
  }
  
  const { refreshToken } = JSON.parse(storedTokens) as AuthToken;
  
  try {
    const response = await axios.post<{ access_token: string, token_type: string, refresh_token: string }>(
      `${API_URL}/auth/refresh-token`,
      { refresh_token: refreshToken }
    );
    
    const newTokens: AuthToken = {
      accessToken: response.data.access_token,
      tokenType: response.data.token_type,
      refreshToken: response.data.refresh_token,
    };
    
    localStorage.setItem('tokens', JSON.stringify(newTokens));
    return newTokens;
  } catch (error) {
    logout(); // Clear invalid tokens
    throw new Error('Token refresh failed');
  }
};

export const getCurrentUser = async (): Promise<AuthUser> => {
  const tokens = localStorage.getItem('tokens');
  if (!tokens) {
    throw new Error('Not authenticated');
  }
  
  const { accessToken } = JSON.parse(tokens) as AuthToken;
  
  try {
    const response = await axios.get<AuthUser>(`${API_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    
    return response.data;
  } catch (error) {
    logout(); // Clear invalid tokens
    throw new Error('Failed to get user information');
  }
};

// Setup axios interceptor for token handling
axios.interceptors.request.use(
  async (config) => {
    const tokens = localStorage.getItem('tokens');
    if (tokens && config.headers) {
      const { accessToken } = JSON.parse(tokens) as AuthToken;
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Refresh token on 401 errors
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const tokens = await refreshToken();
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;
        }
        return axios(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);