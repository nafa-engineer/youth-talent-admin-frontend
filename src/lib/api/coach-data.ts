import { apiClient } from './client';
import {
  CoachDto,
  TeamSummaryDto,
  CustomerDto,
  MentoringAttendanceRecapDto,
  DeedScoreAverageDto,
} from '../../types/api';
import { API_ROUTES } from '../constants';

export const coachDataApi = {
  getProfile: async (): Promise<CoachDto> => {
    const response = await apiClient.get<CoachDto>(API_ROUTES.COACH_PROFILE_API);
    return response.data;
  },

  getMyTeams: async (): Promise<TeamSummaryDto[]> => {
    const response = await apiClient.get<TeamSummaryDto[]>(API_ROUTES.COACH_TEAMS);
    return response.data;
  },

  getMyCustomers: async (): Promise<CustomerDto[]> => {
    const response = await apiClient.get<CustomerDto[]>(API_ROUTES.COACH_CUSTOMERS);
    return response.data;
  },

  getMentoringRecap: async (params?: {
    weekIds?: number[];
    startDate?: string;
    endDate?: string;
  }): Promise<MentoringAttendanceRecapDto[]> => {
    const response = await apiClient.get<MentoringAttendanceRecapDto[]>(
      API_ROUTES.COACH_MENTORING_RECAP,
      { params }
    );
    return response.data;
  },

  getDeedScoreAverage: async (params?: {
    weekIds?: number[];
    startDate?: string;
    endDate?: string;
  }): Promise<DeedScoreAverageDto[]> => {
    const response = await apiClient.get<DeedScoreAverageDto[]>(
      API_ROUTES.COACH_DEED_SCORE_AVERAGE,
      { params }
    );
    return response.data;
  },
};