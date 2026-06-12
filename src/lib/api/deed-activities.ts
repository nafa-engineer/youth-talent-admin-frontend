import { apiClient } from './client';
import { DeedActivityDto } from '../../types/api';
import { API_ROUTES } from '../constants';

export const deedActivitiesApi = {
  getDeedActivities: async (): Promise<DeedActivityDto[]> => {
    const response = await apiClient.get<DeedActivityDto[]>(API_ROUTES.DEED_ACTIVITIES);
    return response.data;
  },

  getDeedActivityById: async (id: number | string): Promise<DeedActivityDto> => {
    const response = await apiClient.get<DeedActivityDto>(API_ROUTES.DEED_ACTIVITY_DETAIL(id));
    return response.data;
  }
};
