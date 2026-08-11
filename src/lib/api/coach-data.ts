import { apiClient } from './client';
import {
  CoachDto,
  TeamSummaryDto,
  CustomerDto,
  CoachMentoringRecapDto,
  CoachDeedScoreAverageDto,
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
  }): Promise<CoachMentoringRecapDto[]> => {
    const response = await apiClient.get<CoachMentoringRecapDto[]>(
      API_ROUTES.COACH_MENTORING_RECAP,
      { params }
    );
    return response.data;
  },

  getDeedScoreAverage: async (params?: {
    weekIds?: number[];
    startDate?: string;
    endDate?: string;
  }): Promise<CoachDeedScoreAverageDto[]> => {
    const response = await apiClient.get<CoachDeedScoreAverageDto[]>(
      API_ROUTES.COACH_DEED_SCORE_AVERAGE,
      { params }
    );
    return response.data;
  },
};