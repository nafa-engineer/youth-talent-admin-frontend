import { apiClient } from './client';
import { DeedScoreAverageDto } from '../../types/api';
import { API_ROUTES } from '../constants';

export const deedScoreApi = {
  getAverage: async (params?: Record<string, unknown>): Promise<DeedScoreAverageDto> => {
    const response = await apiClient.get<DeedScoreAverageDto>(
      API_ROUTES.DEED_SCORE_AVERAGE,
      { params }
    );
    return response.data;
  }
};
