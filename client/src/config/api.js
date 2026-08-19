import axios from 'axios';
import { getErrorMessage } from '@/lib/utils';
import { getAccessToken, setAccessToken, clearAccessToken } from '@/features/auth/auth.token';

/**
 * Centralized Axios instance for all API communication.
 *
 * - Base URL from VITE_API_BASE_URL environment variable.
 * - 30-second timeout.
 * - withCredentials: true ensures HttpOnly refreshToken cookie is transmitted.
 * - Request interceptor automatically attaches the in-memory access token.
 * - Response interceptor implements concurrency-safe 401 refresh queue & retry.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

/*
 * ── Concurrency-Safe Refresh State ──
 */
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

/*
 * ── Request Interceptor ──
 */
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Strip empty string query parameters so server receives clean query payloads
    if (config.params && typeof config.params === 'object' && !Array.isArray(config.params)) {
      const cleaned = {};
      for (const [key, value] of Object.entries(config.params)) {
        if (value !== '' && value !== null && value !== undefined) {
          cleaned[key] = value;
        }
      }
      config.params = cleaned;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/*
 * ── Response Interceptor ──
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If there is no response (network error) or status is not 401, reject immediately
    if (!error.response || error.response.status !== 401 || !originalRequest) {
      return Promise.reject(error);
    }

    // Do not attempt refresh on auth endpoints to prevent infinite refresh loops
    const requestUrl = originalRequest.url || '';
    const isAuthEndpoint =
      requestUrl.includes('/auth/login') ||
      requestUrl.includes('/auth/refresh-token') ||
      requestUrl.includes('/auth/logout');

    if (isAuthEndpoint || originalRequest._retry) {
      return Promise.reject(error);
    }

    // If a refresh is already in flight, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((newToken) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // Direct POST to refresh endpoint using raw axios to bypass interceptors
      const baseURL = import.meta.env.VITE_API_BASE_URL || '/api/v1';
      const refreshResponse = await axios.post(
        `${baseURL}/auth/refresh-token`,
        {},
        { withCredentials: true }
      );

      const newAccessToken = refreshResponse.data?.data?.accessToken;
      if (!newAccessToken) {
        throw new Error('Refresh failed: No access token received');
      }

      setAccessToken(newAccessToken);
      processQueue(null, newAccessToken);

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      clearAccessToken();
      processQueue(refreshError, null);
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

/**
 * Extract a structured error from an API call failure.
 * @param {Error} error - Axios error
 * @returns {{ message: string, status: number|null, errors: string[] }}
 */
export function extractApiError(error) {
  const data = error?.response?.data;
  return {
    message: getErrorMessage(error),
    status: error?.response?.status || null,
    errors: data?.errors || [],
  };
}

export default api;
