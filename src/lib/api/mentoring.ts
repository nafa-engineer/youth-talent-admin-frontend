import { apiClient } from './client';
import { MentoringAttendanceRecapDto, MentoringAttendanceSummaryDto, PageResponse } from '../../types/api';
import { API_ROUTES } from '../constants';

export interface MentoringRecapParams {
  campusId?: number | string;
  gender?: 'PRIA' | 'WANITA';
  teamId?: number | string;
  weekIds?: number[];
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
}

export const mentoringApi = {
  getMentoringRecap: async (params?: MentoringRecapParams): Promise<PageResponse<MentoringAttendanceRecapDto>> => {
    const response = await apiClient.get<PageResponse<MentoringAttendanceRecapDto>>(API_ROUTES.MENTORING_RECAP, { params });
    return response.data;
  },

  getRecapSummary: async (params?: Record<string, unknown>): Promise<MentoringAttendanceSummaryDto> => {
    const response = await apiClient.get<MentoringAttendanceSummaryDto>(
      API_ROUTES.MENTORING_RECAP_SUMMARY, { params }
    );
    return response.data;
  }
};
