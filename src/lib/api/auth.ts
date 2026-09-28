import { apiClient } from './client';
import { 
  LoginRequestDto, 
  AdminLoginResponseDto, 
  AdminDto,
  CoachLoginResponseDto,
} from '../../types/api';
import { API_ROUTES } from '../constants';

export const authApi = {
  login: async (data: LoginRequestDto): Promise<AdminLoginResponseDto> => {
    const response = await apiClient.post<AdminLoginResponseDto>(API_ROUTES.LOGIN, data);
    return response.data;
  },

  coachLogin: async (data: LoginRequestDto): Promise<CoachLoginResponseDto> => {
    const response = await apiClient.post<CoachLoginResponseDto>(API_ROUTES.LOGIN_COACH, data);
    return response.data;
  },

  forgotPassword: async (email: string): Promise<string> => {
    const response = await apiClient.post<string>(API_ROUTES.FORGOT_PASSWORD_ADMIN, { email });
    return response.data;
  },

  resetPassword: async (token: string, newPassword: string): Promise<string> => {
    const response = await apiClient.post<string>(API_ROUTES.RESET_PASSWORD_ADMIN, { token, newPassword });
    return response.data;
  },

  coachForgotPassword: async (email: string): Promise<string> => {
    const response = await apiClient.post<string>(API_ROUTES.FORGOT_PASSWORD_COACH, { email });
    return response.data;
  },

  coachResetPassword: async (token: string, newPassword: string): Promise<string> => {
    const response = await apiClient.post<string>(API_ROUTES.RESET_PASSWORD_COACH, { token, newPassword });
    return response.data;
  },

  getProfile: async (): Promise<AdminDto> => {
    const response = await apiClient.get<AdminDto>(API_ROUTES.ADMIN_PROFILE);
    return response.data;
  }
};