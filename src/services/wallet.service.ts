import apiClient from './axios';
import { ApiResponse, Wallet, DepositRequest, WithdrawalRequest } from '@/types';

export const walletService = {
  getBalance: async (): Promise<Wallet> => {
    const response = await apiClient.get<ApiResponse<Wallet>>('/wallets/balance');
    return response.data.data;
  },

  createDepositRequest: async (formData: FormData): Promise<DepositRequest> => {
    const response = await apiClient.post<ApiResponse<{ deposit: DepositRequest }>>(
      '/wallets/deposit-request',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data.deposit;
  },

  createWithdrawalRequest: async (withdrawalData: {
    amount: number;
    paymentMethod: string;
    paymentDetails: string;
  }): Promise<WithdrawalRequest> => {
    const response = await apiClient.post<ApiResponse<{ request: WithdrawalRequest }>>(
      '/wallets/withdrawal-request',
      withdrawalData
    );
    return response.data.data.request;
  },

  cancelWithdrawalRequest: async (requestId: string): Promise<ApiResponse<unknown>> => {
    const response = await apiClient.post<ApiResponse<unknown>>(`/wallets/withdrawal-request/${requestId}/cancel`);
    return response.data;
  },

  getDepositHistory: async (): Promise<DepositRequest[]> => {
    const response = await apiClient.get<ApiResponse<{ deposits: DepositRequest[] }>>('/wallets/deposits');
    return response.data.data.deposits;
  },

  getWithdrawalHistory: async (): Promise<WithdrawalRequest[]> => {
    const response = await apiClient.get<ApiResponse<{ withdrawals: WithdrawalRequest[] }>>('/wallets/withdrawals');
    return response.data.data.withdrawals;
  },

  createRazorpayOrder: async (amount: number): Promise<{ keyId: string; amount: number; currency: string; orderId: string }> => {
    const response = await apiClient.post<ApiResponse<{ keyId: string; amount: number; currency: string; orderId: string }>>('/razorpay/order', { amount });
    return response.data.data;
  },

  verifyRazorpayPayment: async (verificationData: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    amount: number;
  }): Promise<any> => {
    const response = await apiClient.post<ApiResponse<any>>('/razorpay/verify', verificationData);
    return response.data;
  },
};

export default walletService;
