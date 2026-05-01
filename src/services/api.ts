/**
 * Axios client for the Spring API. In Vite dev without `VITE_API_URL`, defaults to relative `/api` (proxied).
 * Debug logging when `VITE_DEBUG_API=true` or Vite dev mode.
 */

import axios, { AxiosInstance } from 'axios';

import { API_CONFIG as API_CONSTANTS, API_DEBUG_LOGGING } from '../utils/constants';

export const API_CONFIG = {
  baseURL: API_CONSTANTS.BASE_URL,
  timeout: API_CONSTANTS.TIMEOUT,
};

const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

if (API_DEBUG_LOGGING) {
  console.log('[API Client] Initialized with base URL:', API_CONFIG.baseURL);
}

apiClient.interceptors.request.use(
  (config) => {
    if (API_DEBUG_LOGGING) {
      const fullUrl = config.baseURL ? `${config.baseURL}${config.url || ''}` : config.url;
      console.log(`[API Client] ${config.method?.toUpperCase()} ${fullUrl}`);
    }
    
    // Add any auth tokens here if needed
    // config.headers.Authorization = `Bearer ${getAuthToken()}`;
    
    return config;
  },
  (error) => {
    console.error('[API Client] Request setup error:', error);
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    if (API_DEBUG_LOGGING) {
      console.log(`[API Client] ✓ ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    if (error.response) {
      // Server responded with error status
      console.error(`[API Client] ✗ ${error.response.status} ${error.config?.method?.toUpperCase()} ${error.config?.url}`);
      console.error('[API Client] Error response:', error.response.data);
    } else if (error.request) {
      // Request made but no response received
      const url = error.config?.baseURL ? `${error.config.baseURL}${error.config.url || ''}` : error.config?.url;
      console.error(`[API Client] ✗ No response received for ${error.config?.method?.toUpperCase()} ${url}`);
      console.error('[API Client] Network error - check if backend is running and accessible');
      console.error('[API Client] Configured base URL:', API_CONFIG.baseURL);
    } else {
      // Error setting up request
      console.error('[API Client] Request error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
