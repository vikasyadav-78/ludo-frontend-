import apiClient from './axios';
import { ApiResponse, Transaction } from '@/types';

export const transactionService = {
  getTransactionHistory: async (): Promise<Transaction[]> => {
    const response = await apiClient.get<ApiResponse<{ transactions: Transaction[] }>>('/wallets/transactions');
    return response.data.data.transactions;
  },

  getWalletLedger: async (): Promise<any[]> => {
    const response = await apiClient.get<ApiResponse<{ ledger: any[] }>>('/wallets/ledger');
    return response.data.data.ledger;
  },
};

export default transactionService;
