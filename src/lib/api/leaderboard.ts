import { apiClient } from './client';
import { DeedLeaderboardResponseDto } from '../../types/api';
import { API_ROUTES } from '../constants';

export const leaderboardApi = {
  getGlobalLeaderboard: async (params?: { campusId?: number | string; weekId?: number | string }): Promise<DeedLeaderboardResponseDto> => {
    const response = await apiClient.get<DeedLeaderboardResponseDto>(API_ROUTES.LEADERBOARD_GLOBAL, { params });
    return response.data;
  },

  getActivityLeaderboard: async (activityId: number | string, params?: { campusId?: number | string; weekId?: number | string }): Promise<DeedLeaderboardResponseDto> => {
    const response = await apiClient.get<DeedLeaderboardResponseDto>(API_ROUTES.LEADERBOARD_ACTIVITY(activityId), { params });
    return response.data;
  },

  generateLeaderboard: async (weekId: number | string): Promise<{ generatedAt: string; count: number }> => {
    const response = await apiClient.post<{ generatedAt: string; count: number }>(API_ROUTES.LEADERBOARD_GENERATE, { weekId });
    return response.data;
  }
};
