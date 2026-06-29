import apiClient from './axios';
import { ApiResponse } from '@/types';

export interface ReferralDashboardStats {
  referralCode: string;
  totalReferrals: number;
  activeReferrals: number;
  firstDepositRewards: number;
  commissionEarnings: number;
  totalEarnings: number;
}

export const referralService = {
  getReferralDashboard: async (): Promise<ReferralDashboardStats> => {
    const response = await apiClient.get<ApiResponse<ReferralDashboardStats>>('/users/referral-dashboard');
    return response.data.data;
  },
};

export default referralService;
