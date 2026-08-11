import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api-dev.youthtalent.id';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        try {
          const parsed = JSON.parse(authStorage);
          const token = parsed?.state?.user?.accessToken;
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (e) {
          console.error('Error parsing token from storage', e);
        }
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    // Jika backend membungkus response di dalam { status, message, data }
    if (response.data && response.data.data !== undefined) {
      response.data = response.data.data;
    }
    return response;
  },
  (error) => {
    if (error.response) {
      const { status } = error.response;
      
      if (status === 401 || status === 403) {
        if (typeof window !== 'undefined') {
          // Jangan redirect jika sudah di halaman login (agar login form
          // bisa menampilkan pesan error dari response 401 via toast)
          if (window.location.pathname !== '/login') {
            console.warn('apiClient interceptor caught 401/403. Redirecting to login. URL:', error.config?.url);
            localStorage.removeItem('auth-storage');
            window.location.href = '/login?expired=true&from=apiClient';
          }
        }
      }
    }
    return Promise.reject(error);
  }
);

if (process.env.NEXT_PUBLIC_USE_MOCK_API === 'true') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { setupMockApi } = require('./mock');
  setupMockApi();
}
