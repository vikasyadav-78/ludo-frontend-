import apiClient from './axios';
import { ApiResponse, Battle } from '@/types';

const mapBattle = (battle: any): Battle => {
  if (!battle) return battle;
  return {
    ...battle,
    createdBy: battle.creator || (typeof battle.createdBy === 'object' ? battle.createdBy : { id: battle.createdBy, name: 'Creator' }),
    joinedBy: battle.joiner || (typeof battle.joinedBy === 'object' ? battle.joinedBy : (battle.joinedBy ? { id: battle.joinedBy, name: 'Challenger' } : undefined)),
  };
};

const mapBattles = (battles: any[]): Battle[] => {
  if (!Array.isArray(battles)) return [];
  return battles.map(mapBattle);
};

export const battleService = {
  createBattle: async (battleData: { title: string; amount: number; inviteCode?: string }): Promise<Battle> => {
    const response = await apiClient.post<ApiResponse<{ battle: Battle }>>('/battles', battleData);
    return mapBattle(response.data.data.battle);
  },

  joinBattle: async (battleId: string): Promise<Battle> => {
    const response = await apiClient.post<ApiResponse<{ battle: Battle }>>(`/battles/${battleId}/join`);
    return mapBattle(response.data.data.battle);
  },

  cancelBattle: async (battleId: string): Promise<ApiResponse<unknown>> => {
    const response = await apiClient.post<ApiResponse<unknown>>(`/battles/${battleId}/cancel`);
    return response.data;
  },

  setInviteCode: async (battleId: string, inviteCode: string): Promise<Battle> => {
    const response = await apiClient.post<ApiResponse<{ battle: Battle }>>(`/battles/${battleId}/invite-code`, { inviteCode });
    return mapBattle(response.data.data.battle);
  },

  getBattleDetails: async (battleId: string): Promise<Battle> => {
    const response = await apiClient.get<ApiResponse<{ battle: Battle }>>(`/battles/${battleId}`);
    return mapBattle(response.data.data.battle);
  },

  getOpenBattles: async (): Promise<Battle[]> => {
    const response = await apiClient.get<ApiResponse<{ battles: Battle[] }>>('/battles/open');
    return mapBattles(response.data.data.battles);
  },

  getActiveBattles: async (): Promise<Battle[]> => {
    const response = await apiClient.get<ApiResponse<{ battles: Battle[] }>>('/battles/active');
    return mapBattles(response.data.data.battles);
  },

  getCompletedBattles: async (): Promise<Battle[]> => {
    const response = await apiClient.get<ApiResponse<{ battles: Battle[] }>>('/battles/completed');
    return mapBattles(response.data.data.battles);
  },

  getBattleHistory: async (): Promise<Battle[]> => {
    const response = await apiClient.get<ApiResponse<{ battles: Battle[] }>>('/battles/history');
    return mapBattles(response.data.data.battles);
  },

  submitResult: async (formData: FormData): Promise<ApiResponse<unknown>> => {
    const response = await apiClient.post<ApiResponse<unknown>>('/battles/submit-result', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export default battleService;
