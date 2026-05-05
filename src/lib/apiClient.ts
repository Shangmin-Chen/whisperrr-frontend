/**
 * Axios client for the Spring API. In Vite dev without `VITE_API_URL`, defaults to relative `/api` (proxied).
 * Debug logging when `VITE_DEBUG_API=true` or Vite dev mode.
 */

import axios, { AxiosInstance, isAxiosError } from 'axios';

import { API_CONFIG as API_CONSTANTS, API_DEBUG_LOGGING } from '../utils/constants';
import { supabase } from './supabase';

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

/** Refresh this far before Supabase {@code expires_at} so Spring never sees an expired JWT. */
const ACCESS_TOKEN_REFRESH_SKEW_MS = 120_000;

async function getAccessTokenForApi(): Promise<string | undefined> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.access_token) {
    return undefined;
  }

  const expiresAtMs = session.expires_at ? session.expires_at * 1000 : 0;
  const needsRefresh =
    !expiresAtMs || expiresAtMs <= Date.now() + ACCESS_TOKEN_REFRESH_SKEW_MS;

  if (!needsRefresh) {
    return session.access_token;
  }

  const { data, error } = await supabase.auth.refreshSession();
  if (error) {
    if (API_DEBUG_LOGGING) {
      console.warn('[API Client] refreshSession failed:', error.message);
    }
    return session.access_token;
  }
  return data.session?.access_token ?? session.access_token;
}

apiClient.interceptors.request.use(
  async (config) => {
    const token = await getAccessTokenForApi();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (API_DEBUG_LOGGING) {
      const fullUrl = config.baseURL ? `${config.baseURL}${config.url || ''}` : config.url;
      console.log(`[API Client] ${config.method?.toUpperCase()} ${fullUrl}`);
    }

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
      console.log(
        `[API Client] ✓ ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`
      );
    }
    return response;
  },
  async (error) => {
    if (isAxiosError(error) && error.response?.status === 401) {
      const { data, error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError || !data.session) {
        try {
          await supabase.auth.signOut();
        } catch {
          // ignore sign-out failures
        }
      }
    }

    if (error.response) {
      console.error(
        `[API Client] ✗ ${error.response.status} ${error.config?.method?.toUpperCase()} ${error.config?.url}`
      );
      console.error('[API Client] Error response:', error.response.data);
    } else if (error.request) {
      const url = error.config?.baseURL ? `${error.config.baseURL}${error.config.url || ''}` : error.config?.url;
      console.error(`[API Client] ✗ No response received for ${error.config?.method?.toUpperCase()} ${url}`);
      console.error('[API Client] Network error - check if backend is running and accessible');
      console.error('[API Client] Configured base URL:', API_CONFIG.baseURL);
    } else {
      console.error('[API Client] Request error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
