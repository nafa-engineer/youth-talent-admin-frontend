import { apiClient } from './client';
import { TeamDto, TeamRequestDto } from '../../types/api';
import { API_ROUTES } from '../constants';

export const teamsApi = {
  getTeams: async (params?: { campusId?: number | string }): Promise<TeamDto[]> => {
    const response = await apiClient.get<TeamDto[]>(API_ROUTES.TEAMS, { params });
    return response.data;
  },

  getTeamById: async (id: number | string): Promise<TeamDto> => {
    const response = await apiClient.get<TeamDto>(API_ROUTES.TEAM_DETAIL(id));
    return response.data;
  },

  getTeamsByCampus: async (campusId: number | string): Promise<TeamDto[]> => {
    const response = await apiClient.get<TeamDto[]>(API_ROUTES.TEAMS_BY_CAMPUS(campusId));
    return response.data;
  },

  getTeamCount: async (params?: Record<string, unknown>): Promise<number> => {
    const response = await apiClient.get<number>(API_ROUTES.TEAMS_COUNT, { params });
    return response.data as unknown as number;
  },

  createTeam: async (data: TeamRequestDto): Promise<TeamDto> => {
    const response = await apiClient.post<TeamDto>(API_ROUTES.TEAMS, data);
    return response.data;
  },

  updateTeam: async (id: number | string, data: TeamRequestDto): Promise<TeamDto> => {
    const response = await apiClient.put<TeamDto>(API_ROUTES.TEAM_DETAIL(id), data);
    return response.data;
  },

  deleteTeam: async (id: number | string): Promise<void> => {
    // Kosongkan sementara sampai endpoint backend tersedia
    console.log("Mock delete team called for ID:", id);
    return Promise.resolve();
  }
};
