import apiClient from './axios';
import { ApiResponse, User } from '@/types';

export const profileService = {
  getProfile: async (): Promise<User> => {
    const response = await apiClient.get<ApiResponse<{ user: User }>>('/users/profile');
    return response.data.data.user;
  },

  updateProfile: async (profileData: { name: string }): Promise<User> => {
    const response = await apiClient.put<ApiResponse<{ user: User }>>('/users/profile', profileData);
    return response.data.data.user;
  },

  changeMobile: async (mobileData: { mobile: string }): Promise<User> => {
    const response = await apiClient.patch<ApiResponse<{ user: User }>>('/users/mobile', mobileData);
    return response.data.data.user;
  },

  uploadAvatar: async (formData: FormData): Promise<{ avatarUrl: string; user: User }> => {
    const response = await apiClient.post<ApiResponse<{ avatarUrl: string; user: User }>>('/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  getLeaderboard: async (): Promise<{
    topWinners: Array<{ rank: number; name: string; avatar: string; winnings: number; wins: number }>;
    topReferrers: Array<{ rank: number; name: string; avatar: string; referralsCount: number; bonusEarned: number }>;
  }> => {
    const response = await apiClient.get<ApiResponse<{
      topWinners: Array<{ rank: number; name: string; avatar: string; winnings: number; wins: number }>;
      topReferrers: Array<{ rank: number; name: string; avatar: string; referralsCount: number; bonusEarned: number }>;
    }>>('/users/leaderboard');
    return response.data.data;
  },
};

export default profileService;
