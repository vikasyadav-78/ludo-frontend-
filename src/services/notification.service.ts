import apiClient from './axios';
import { ApiResponse, AppNotification } from '@/types';

export const notificationService = {
  getNotifications: async (): Promise<AppNotification[]> => {
    try {
      const response = await apiClient.get<ApiResponse<AppNotification[]>>('/notifications');
      return response.data.data;
    } catch {
      return [];
    }
  },

  markRead: async (notificationId: string): Promise<ApiResponse<unknown>> => {
    const response = await apiClient.patch<ApiResponse<unknown>>(`/notifications/${notificationId}/read`);
    return response.data;
  },

  markAllRead: async (): Promise<ApiResponse<unknown>> => {
    const response = await apiClient.post<ApiResponse<unknown>>('/notifications/read-all');
    return response.data;
  },
};

export default notificationService;
