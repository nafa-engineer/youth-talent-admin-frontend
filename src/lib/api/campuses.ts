import { apiClient } from './client';
import { 
  CampusDto, 
  CampusRequestDto 
} from '../../types/api';
import { API_ROUTES } from '../constants';

export const campusesApi = {
  getCampuses: async (): Promise<CampusDto[]> => {
    const response = await apiClient.get<CampusDto[]>(API_ROUTES.CAMPUSES);
    return response.data;
  },

  getCampusById: async (id: number): Promise<CampusDto> => {
    const response = await apiClient.get<CampusDto>(`${API_ROUTES.CAMPUSES}/${id}`);
    return response.data;
  },

  createCampus: async (data: CampusRequestDto): Promise<CampusDto> => {
    const response = await apiClient.post<CampusDto>(API_ROUTES.CAMPUSES, data);
    return response.data;
  },

  updateCampus: async (id: number, data: CampusRequestDto): Promise<CampusDto> => {
    const response = await apiClient.put<CampusDto>(`${API_ROUTES.CAMPUSES}/${id}`, data);
    return response.data;
  },

  deleteCampus: async (id: number): Promise<void> => {
    console.log("Mock delete campus called for ID:", id);
    return Promise.resolve();
  }
};
