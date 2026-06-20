import { apiClient } from './client';
import { 
  AdminDto, 
  AdminRequestDto,
  AdminTransferCampusRequestDto
} from '../../types/api';
import { API_ROUTES } from '../constants';

export const adminsApi = {
  getAdmins: async (): Promise<AdminDto[]> => {
    const response = await apiClient.get<AdminDto[]>(API_ROUTES.ADMINS);
    return response.data;
  },

  getAdminById: async (id: number): Promise<AdminDto> => {
    const response = await apiClient.get<AdminDto>(API_ROUTES.ADMIN_DETAIL(id));
    return response.data;
  },

  createAdmin: async (data: AdminRequestDto): Promise<AdminDto> => {
    const response = await apiClient.post<AdminDto>(API_ROUTES.ADMINS, data);
    return response.data;
  },



  deactivateAdmin: async (id: number): Promise<AdminDto> => {
    const response = await apiClient.put<AdminDto>(API_ROUTES.ADMIN_DEACTIVATE(id));
    return response.data;
  },

  transferCampus: async (id: number, data: AdminTransferCampusRequestDto): Promise<AdminDto> => {
    const response = await apiClient.put<AdminDto>(API_ROUTES.ADMIN_TRANSFER_CAMPUS(id), data);
    return response.data;
  }
};
