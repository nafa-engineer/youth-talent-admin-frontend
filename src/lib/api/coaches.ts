import { apiClient } from './client';
import { CoachDto, CoachRequestDto, CoachAssignTeamRequestDto } from '../../types/api';
import { API_ROUTES } from '../constants';

export const coachesApi = {
  getCoaches: async (): Promise<CoachDto[]> => {
    const response = await apiClient.get<CoachDto[]>(API_ROUTES.COACHES);
    return response.data;
  },

  getCoachById: async (id: number | string): Promise<CoachDto> => {
    const response = await apiClient.get<CoachDto>(API_ROUTES.COACH_DETAIL(id));
    return response.data;
  },

  createCoach: async (data: CoachRequestDto): Promise<CoachDto> => {
    const response = await apiClient.post<CoachDto>(API_ROUTES.COACHES, data);
    return response.data;
  },

  activateCoach: async (id: number | string): Promise<CoachDto> => {
    const response = await apiClient.put<CoachDto>(API_ROUTES.COACH_ACTIVATE(id));
    return response.data;
  },

  deactivateCoach: async (id: number | string): Promise<CoachDto> => {
    const response = await apiClient.put<CoachDto>(API_ROUTES.COACH_DEACTIVATE(id));
    return response.data;
  },

  assignTeam: async (id: number | string, data: CoachAssignTeamRequestDto): Promise<CoachDto> => {
    const response = await apiClient.put<CoachDto>(API_ROUTES.COACH_ASSIGN_TEAM(id), data);
    return response.data;
  },

  unassignTeam: async (id: number | string, teamId: number | string): Promise<CoachDto> => {
    const response = await apiClient.delete<CoachDto>(API_ROUTES.COACH_UNASSIGN_TEAM(id, teamId));
    return response.data;
  },
};