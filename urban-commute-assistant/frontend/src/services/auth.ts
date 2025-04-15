import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

interface LoginCredentials {
  email: string;
  password: string;
}

interface UserRegistrationData {
  name: string;
  email: string;
  password: string;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  token: string;
}

export const login = async (email: string, password: string): Promise<UserData> => {
    try {
        const response = await axios.post(`${API_URL}/auth/login`, { email, password });
        return response.data;
    } catch (error: unknown) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || 'Login failed');
        }
        throw new Error('Login failed');
    }
};

export const register = async (userData: UserRegistrationData): Promise<UserData> => {
    try {
        const response = await axios.post(`${API_URL}/auth/register`, userData);
        return response.data;
    } catch (error: unknown) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || 'Registration failed');
        }
        throw new Error('Registration failed');
    }
};

export const logout = () => {
    localStorage.removeItem('user');
};

export const getCurrentUser = (): UserData | null => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
};

export const setCurrentUser = (user: UserData): void => {
    localStorage.setItem('user', JSON.stringify(user));
};