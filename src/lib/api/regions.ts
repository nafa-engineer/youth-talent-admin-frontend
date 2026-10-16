import { apiClient } from './client';
import { API_ROUTES } from '../constants';
import { RegionOption } from '../../types/api';

export const regionsApi = {
  getProvinces: async (): Promise<RegionOption[]> => {
    const response = await apiClient.get<RegionOption[]>(API_ROUTES.REGIONS_PROVINCES);
    return response.data;
  },

  getCities: async (provinceCode: string): Promise<RegionOption[]> => {
    const response = await apiClient.get<RegionOption[]>(API_ROUTES.REGIONS_CITIES, {
      params: { provinceCode },
    });
    return response.data;
  },

  getDistricts: async (cityCode: string): Promise<RegionOption[]> => {
    const response = await apiClient.get<RegionOption[]>(API_ROUTES.REGIONS_DISTRICTS, {
      params: { cityCode },
    });
    return response.data;
  },
};
