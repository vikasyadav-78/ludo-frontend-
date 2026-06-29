import apiClient from './axios';
import { ApiResponse, User } from '@/types';

export const uploadService = {
  uploadAvatar: async (file: File): Promise<ApiResponse<{ avatarUrl: string; user: User }>> => {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await apiClient.post<ApiResponse<{ avatarUrl: string; user: User }>>(
      '/users/avatar',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  uploadBattleScreenshot: async (
    battleId: string,
    status: 'WIN' | 'LOSS' | 'CANCEL',
    file: File
  ): Promise<ApiResponse<any>> => {
    const formData = new FormData();
    formData.append('battleId', battleId);
    formData.append('status', status);
    formData.append('screenshot', file);

    const response = await apiClient.post<ApiResponse<any>>('/battles/submit-result', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  uploadDepositReceipt: async (
    amount: number,
    transactionId: string,
    paymentMethod: string,
    file: File
  ): Promise<ApiResponse<any>> => {
    const formData = new FormData();
    formData.append('amount', amount.toString());
    formData.append('transactionId', transactionId);
    formData.append('paymentMethod', paymentMethod);
    formData.append('screenshot', file);

    const response = await apiClient.post<ApiResponse<any>>('/wallets/deposit-request', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export default uploadService;
