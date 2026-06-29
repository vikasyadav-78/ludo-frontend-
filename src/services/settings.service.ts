import apiClient from './axios';
import { ApiResponse } from '@/types';

export const settingsService = {
  getPublicSettings: async (): Promise<Record<string, string>> => {
    const response = await apiClient.get<ApiResponse<{ settings: Record<string, string> }>>('/system-settings/public');
    return response.data.data.settings;
  },
};

export default settingsService;
