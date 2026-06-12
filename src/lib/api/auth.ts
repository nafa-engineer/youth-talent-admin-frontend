import { apiClient } from './client';
import { 
  LoginRequestDto, 
  AdminLoginResponseDto, 
  AdminDto 
} from '../../types/api';
import { API_ROUTES } from '../constants';

export const authApi = {
  login: async (data: LoginRequestDto): Promise<AdminLoginResponseDto> => {
    const response = await apiClient.post<AdminLoginResponseDto>(API_ROUTES.LOGIN, data);
    return response.data;
  },
  
  getProfile: async (): Promise<AdminDto> => {
    const response = await apiClient.get<AdminDto>(API_ROUTES.ADMIN_PROFILE);
    return response.data;
  }
};
