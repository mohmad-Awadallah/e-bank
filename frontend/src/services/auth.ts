// src/services/auth.ts
import apiClient from '@/lib/apiClient';
import { RegisterData, LoginCredentials, UserData } from '@/types/auth';

const handleError = (error: any, defaultMessage: string) => {
  return error.response?.data?.message || defaultMessage;
};

export const AuthService = {
  register: async (data: RegisterData): Promise<any> => {
    const response = await apiClient.post('/auth/register', data, { withCredentials: true });
    return response.data;
  },

  login: async (credentials: LoginCredentials): Promise<void> => {
    try {
      await apiClient.post('/auth/login', credentials, { withCredentials: true });
    } catch (error: any) {
      throw new Error(handleError(error, 'Login failed. Please check your credentials.'));
    }
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout', {}, { withCredentials: true });
    } catch (error: any) {
      throw new Error(handleError(error, 'Logout failed'));
    }
  },

  getCurrentUser: async (): Promise<UserData> => {
    try {
      const response = await apiClient.get('/users/me', { withCredentials: true });
      return response.data as UserData;
    } catch (error: any) {
      throw new Error(handleError(error, 'Failed to fetch current user'));
    }
  },

  // تغيير هنا لاستخدام apiClient
  registerUser: async (userData: any): Promise<any> => {
    try {
      const response = await apiClient.post('/users', userData, { withCredentials: true });
      return response.data;
    } catch (error: any) {
      throw new Error(handleError(error, 'Failed to register user'));
    }
  }
};

1