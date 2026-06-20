import { apiClient } from './client';
import { MentoringAttendanceRecapDto } from '../../types/api';
import { API_ROUTES } from '../constants';

export interface MentoringRecapParams {
  campusId?: number | string;
  gender?: 'PRIA' | 'WANITA';
  teamId?: number | string;
  weekIds?: number[];
  startDate?: string;
  endDate?: string;
}

export const mentoringApi = {
  getMentoringRecap: async (params?: MentoringRecapParams): Promise<MentoringAttendanceRecapDto[]> => {
    const response = await apiClient.get<MentoringAttendanceRecapDto[]>(API_ROUTES.MENTORING_RECAP, { params });
    return response.data;
  }
};
