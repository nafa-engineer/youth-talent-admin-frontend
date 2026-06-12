import { apiClient } from './client';
import { WeekDto } from '../../types/api';
import { API_ROUTES } from '../constants';

export const weeksApi = {
  getCurrentWeek: async (): Promise<WeekDto> => {
    const response = await apiClient.get<WeekDto>(API_ROUTES.WEEKS_CURRENT);
    return response.data;
  },

  getWeekById: async (id: number | string): Promise<WeekDto> => {
    const response = await apiClient.get<WeekDto>(API_ROUTES.WEEK_DETAIL(id));
    return response.data;
  }
};
