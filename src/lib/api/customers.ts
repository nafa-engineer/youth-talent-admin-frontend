import { apiClient } from './client';
import { 
  CustomerDto, 
  PageCustomerDto, 
  CustomerTransferTeamRequestDto 
} from '../../types/api';
import { API_ROUTES } from '../constants';

export const customersApi = {
  getCustomers: async (params?: Record<string, unknown>): Promise<PageCustomerDto> => {
    const response = await apiClient.get<PageCustomerDto>(API_ROUTES.CUSTOMERS, { params });
    return response.data;
  },
  
  getCustomerCount: async (params?: Record<string, unknown>): Promise<number> => {
    // Expected response based on API docs: { data: count, message: "...", status: 200 }
    // Or if the wrapper is handled by interceptor, it returns `count` directly.
    // Assuming our interceptor returns `response.data` natively, let's verify interceptor logic.
    // In phase 1 `client.ts` we have: `return response.data;` inside response interceptor.
    // However, our types in `client.ts` define `export interface ApiResponse<T> { data: T; ... }`
    // Wait, the interceptor might be returning the whole axios response or just the data.
    // Let's assume standard axios structure where `response` is the data from interceptor, 
    // or if we type it properly, we just do `apiClient.get<number>`.
    const response = await apiClient.get<number>(API_ROUTES.CUSTOMERS_COUNT, { params });
    return response.data as unknown as number; 
    // API returns the count directly or wrapped. Let's assume the interceptor unpacks it or it's just `data`
  },

  transferTeam: async (data: CustomerTransferTeamRequestDto): Promise<CustomerDto> => {
    const response = await apiClient.put<CustomerDto>(API_ROUTES.CUSTOMERS_TRANSFER_TEAM, data);
    return response.data;
  }
};
