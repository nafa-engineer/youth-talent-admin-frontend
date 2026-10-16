import { apiClient } from './client';
import { API_ROUTES } from '../constants';
import {
  DistrictCampusMapDto,
  DistrictCampusMapRequestDto,
  PageResponse,
} from '../../types/api';

export const districtMapApi = {
  list: async (params: {
    search?: string;
    page?: number;
    size?: number;
  }): Promise<PageResponse<DistrictCampusMapDto>> => {
    const response = await apiClient.get<PageResponse<DistrictCampusMapDto>>(
      API_ROUTES.DISTRICT_CAMPUS_MAP,
      { params }
    );
    return response.data;
  },

  set: async (data: DistrictCampusMapRequestDto): Promise<DistrictCampusMapDto> => {
    const response = await apiClient.put<DistrictCampusMapDto>(API_ROUTES.DISTRICT_CAMPUS_MAP, data);
    return response.data;
  },

  remove: async (districtCode: string): Promise<void> => {
    await apiClient.delete(`${API_ROUTES.DISTRICT_CAMPUS_MAP}/${districtCode}`);
  },
};
