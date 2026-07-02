import apiClient from './axios';
import { ApiResponse, User } from '@/types';

export const authService = {
  registerSendOtp: async (userData: unknown): Promise<{ status: string; message: string; otp?: string }> => {
    const response = await apiClient.post<{ status: string; message: string; otp?: string }>('/auth/register-send-otp', userData);
    return response.data;
  },

  registerVerifyOtp: async (verifyData: unknown): Promise<{ user: User; token: string }> => {
    const response = await apiClient.post<ApiResponse<{ user: User; token: string }>>('/auth/register-verify-otp', verifyData);
    return response.data.data;
  },

  login: async (credentials: unknown): Promise<{ user: User; token: string; refreshToken: string }> => {
    const response = await apiClient.post<ApiResponse<{ user: User; token: string; refreshToken: string }>>('/auth/login', credentials);
    return response.data.data;
  },

  forgotPassword: async (identifier: string): Promise<{ status: string; method: 'EMAIL' | 'MOBILE'; message?: string; token?: string; otp?: string; target?: string }> => {
    const response = await apiClient.post<{ status: string; method: 'EMAIL' | 'MOBILE'; message?: string; token?: string; otp?: string; target?: string }>('/auth/forgot-password', { identifier });
    return response.data;
  },

  resetPassword: async (data: unknown): Promise<ApiResponse<unknown>> => {
    const response = await apiClient.post<ApiResponse<unknown>>('/auth/reset-password', data);
    return response.data;
  },

  resetPasswordMobile: async (resetData: unknown): Promise<ApiResponse<unknown>> => {
    const response = await apiClient.post<ApiResponse<unknown>>('/auth/reset-password-mobile', resetData);
    return response.data;
  },

  verifyResetOtp: async (data: { identifier: string; otp: string }): Promise<{ status: string; message: string }> => {
    const response = await apiClient.post<{ status: string; message: string }>('/auth/verify-reset-otp', data);
    return response.data;
  },

  changePassword: async (passwords: unknown): Promise<ApiResponse<unknown>> => {
    const response = await apiClient.post<ApiResponse<unknown>>('/auth/change-password', passwords);
    return response.data;
  },

  logout: async (): Promise<ApiResponse<unknown>> => {
    const response = await apiClient.post<ApiResponse<unknown>>('/auth/logout');
    return response.data;
  },
};

export default authService;
