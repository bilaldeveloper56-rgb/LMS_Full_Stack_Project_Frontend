import axios from 'axios';
import { getErrorMessage, getApiBaseUrl } from '@/lib/utils';
import { getAccessToken, setAccessToken, clearAccessToken, emitSessionExpired } from '@/features/auth/auth.token';
import { getTenantSubdomain } from '@/lib/tenant';

export const API_TIMEOUT = 90000;
export { getApiBaseUrl };

/**
 * Centralized Axios instance for all API communication.
 *
 * - Base URL resolved dynamically via getApiBaseUrl().
 * - 90-second timeout (accommodates Render Free cold-start latency).
 * - withCredentials: true ensures HttpOnly refreshToken cookie is transmitted.
 * - Request interceptor automatically attaches the in-memory access token.
 * - Response interceptor implements concurrency-safe 401 refresh queue & retry,
 *   plus bounded exponential backoff retry for safe idempotent requests (GET/HEAD/OPTIONS).
 */
const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

/*
 * ── Safe Retry Strategy for Cold Starts & Upstream Outages ──
 */
const SAFE_RETRY_METHODS = ['GET', 'HEAD', 'OPTIONS'];
const MAX_SAFE_RETRIES = 2; // Up to 2 retries (3 total attempts)
const SAFE_RETRY_BASE_DELAY = 2000; // 2s, then 4s

const isAuthEndpointUrl = (url = '') => {
  return (
    url.includes('/auth/login') ||
    url.includes('/auth/refresh-token') ||
    url.includes('/auth/logout') ||
    url.includes('/auth/change-password')
  );
};

const isTemporaryServerOrNetworkFailure = (error) => {
  if (!error) return false;
  // Timeout (Axios ECONNABORTED or timeout string)
  if (error.code === 'ECONNABORTED' || (error.message && error.message.toLowerCase().includes('timeout'))) {
    return true;
  }
  // Browser-level network drop or Cloudflare 502/504 without CORS headers
  if (error.code === 'ERR_NETWORK' || error.message === 'Network Error' || !error.response) {
    return true;
  }
  // Upstream server temporary failure status codes
  const status = error.response?.status;
  return status === 408 || status === 502 || status === 503 || status === 504;
};

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

    // In local development, attach tenant subdomain header for localhost fallback testing
    if (import.meta.env.DEV) {
      const tenantSlug = getTenantSubdomain();
      if (tenantSlug && !config.headers['X-Tenant-Subdomain']) {
        config.headers['X-Tenant-Subdomain'] = tenantSlug;
      }
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

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const requestUrl = originalRequest.url || '';
    const isAuthEndpoint = isAuthEndpointUrl(requestUrl);

    // 1. Handle HTTP 401 Unauthorized with Token Refresh
    if (error.response && error.response.status === 401) {
      // Do not attempt refresh on auth endpoints to prevent infinite refresh loops
      if (isAuthEndpoint || originalRequest._retry) {
        return Promise.reject(error);
      }

      // If a refresh is already in flight, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            originalRequest._retry = true;
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Direct POST to refresh endpoint using raw axios to bypass interceptors
        const baseURL = getApiBaseUrl();
        const refreshResponse = await axios.post(
          `${baseURL}/auth/refresh-token`,
          {},
          { withCredentials: true, timeout: API_TIMEOUT }
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
        emitSessionExpired();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // 2. Safe Bounded Retry for Cold Starts & Upstream Server Errors (GET/HEAD/OPTIONS only)
    const method = (originalRequest.method || 'get').toUpperCase();
    const isSafeMethod = SAFE_RETRY_METHODS.includes(method);
    const shouldRetry =
      isSafeMethod &&
      !isAuthEndpoint &&
      isTemporaryServerOrNetworkFailure(error);

    const currentRetries = originalRequest._retryCount || 0;

    if (shouldRetry && currentRetries < MAX_SAFE_RETRIES) {
      originalRequest._retryCount = currentRetries + 1;
      const delay = SAFE_RETRY_BASE_DELAY * Math.pow(2, currentRetries);

      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(
          new CustomEvent('lms:server-waking', {
            detail: {
              attempt: originalRequest._retryCount,
              delay,
              url: originalRequest.url,
            },
          })
        );
      }

      await new Promise((resolve) => setTimeout(resolve, delay));
      return api(originalRequest);
    }

    return Promise.reject(error);
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
