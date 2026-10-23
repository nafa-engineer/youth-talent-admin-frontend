import { apiClient } from './client';
import { API_ROUTES } from '../constants';
import { FillinPromptDto, FillinPromptRequestDto } from '../../types/api';

export const promptsApi = {
  getAll: async (): Promise<FillinPromptDto[]> => {
    const response = await apiClient.get<FillinPromptDto[]>(API_ROUTES.PROMPTS_ALL);
    return response.data;
  },

  create: async (data: FillinPromptRequestDto): Promise<FillinPromptDto> => {
    const response = await apiClient.post<FillinPromptDto>(API_ROUTES.PROMPTS, data);
    return response.data;
  },

  update: async (id: number, data: FillinPromptRequestDto): Promise<FillinPromptDto> => {
    const response = await apiClient.put<FillinPromptDto>(API_ROUTES.PROMPT_DETAIL(id), data);
    return response.data;
  },

  remove: async (id: number): Promise<void> => {
    await apiClient.delete(API_ROUTES.PROMPT_DETAIL(id));
  },
};
