import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import api, { API_TIMEOUT } from '../api';
import { setAccessToken, getAccessToken, clearAccessToken, onSessionExpired } from '@/features/auth/auth.token';
import * as authTokenModule from '@/features/auth/auth.token';

vi.mock('axios', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    default: {
      ...actual.default,
      create: vi.fn((config) => {
        const instance = actual.default.create(config);
        instance.defaults.adapter = vi.fn(async (cfg) => ({
          data: { success: true },
          status: 200,
          statusText: 'OK',
          headers: {},
          config: cfg,
        }));
        return instance;
      }),
      post: vi.fn(),
    },
  };
});

describe('Axios Interceptors & Auth Security', () => {
  beforeEach(() => {
    clearAccessToken();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should configure 90000ms timeout for cold start tolerance', () => {
    expect(API_TIMEOUT).toBe(90000);
    expect(api.defaults.timeout).toBe(90000);
  });

  it('should automatically attach Authorization header when accessToken exists in memory', async () => {
    setAccessToken('valid-jwt-token');

    // Simulate request interceptor
    const config = { headers: {} };
    const requestInterceptor = api.interceptors.request.handlers[0].fulfilled;
    const modifiedConfig = requestInterceptor(config);

    expect(modifiedConfig.headers.Authorization).toBe('Bearer valid-jwt-token');
  });

  it('should not overwrite existing custom Authorization header', async () => {
    setAccessToken('in-memory-token');

    const config = { headers: { Authorization: 'Bearer custom-token' } };
    const requestInterceptor = api.interceptors.request.handlers[0].fulfilled;
    const modifiedConfig = requestInterceptor(config);

    expect(modifiedConfig.headers.Authorization).toBe('Bearer custom-token');
  });

  it('should not attach Authorization header when no token is present', async () => {
    clearAccessToken();

    const config = { headers: {} };
    const requestInterceptor = api.interceptors.request.handlers[0].fulfilled;
    const modifiedConfig = requestInterceptor(config);

    expect(modifiedConfig.headers.Authorization).toBeUndefined();
  });

  it('should clean empty query parameters in request interceptor', () => {
    const config = {
      headers: {},
      params: { page: 1, search: '', filter: null, role: 'STUDENT', empty: undefined },
    };
    const requestInterceptor = api.interceptors.request.handlers[0].fulfilled;
    const modifiedConfig = requestInterceptor(config);

    expect(modifiedConfig.params).toEqual({ page: 1, role: 'STUDENT' });
  });

  it('should prevent refresh loops for login and refresh-token 401 failures', async () => {
    const responseInterceptorError = api.interceptors.response.handlers[0].rejected;

    // 401 on login
    const loginError = {
      config: { url: '/auth/login' },
      response: { status: 401 },
    };

    await expect(responseInterceptorError(loginError)).rejects.toEqual(loginError);

    // 401 on refresh-token
    const refreshError = {
      config: { url: '/auth/refresh-token' },
      response: { status: 401 },
    };

    await expect(responseInterceptorError(refreshError)).rejects.toEqual(refreshError);
  });

  it('should emit session expired and clear token when 401 token refresh fails', async () => {
    const responseInterceptorError = api.interceptors.response.handlers[0].rejected;
    const emitSpy = vi.spyOn(authTokenModule, 'emitSessionExpired');

    // Simulate refresh endpoint rejecting (e.g. invalid/expired cookie)
    axios.post.mockRejectedValueOnce(new Error('Refresh cookie expired'));

    const originalRequest = {
      url: '/students',
      headers: {},
      method: 'get',
    };
    const error401 = {
      config: originalRequest,
      response: { status: 401 },
    };

    await expect(responseInterceptorError(error401)).rejects.toThrow('Refresh cookie expired');
    expect(emitSpy).toHaveBeenCalledTimes(1);
    expect(getAccessToken()).toBeNull();
  });

  it('should not retry unsafe HTTP methods (POST, PUT, DELETE, PATCH) on temporary errors', async () => {
    const responseInterceptorError = api.interceptors.response.handlers[0].rejected;

    for (const method of ['post', 'put', 'delete', 'patch']) {
      const error503 = {
        config: { url: '/students', method },
        response: { status: 503 },
      };

      await expect(responseInterceptorError(error503)).rejects.toEqual(error503);
    }
  });

  it('should not retry temporary errors on auth endpoints', async () => {
    const responseInterceptorError = api.interceptors.response.handlers[0].rejected;

    const authTimeoutError = {
      config: { url: '/auth/login', method: 'get' },
      code: 'ECONNABORTED',
      message: 'timeout of 90000ms exceeded',
    };

    await expect(responseInterceptorError(authTimeoutError)).rejects.toEqual(authTimeoutError);
  });

  it('should retry safe GET request on 502/ECONNABORTED and dispatch server-waking event', async () => {
    vi.useFakeTimers();
    const responseInterceptorError = api.interceptors.response.handlers[0].rejected;

    const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent');
    const originalRequest = {
      url: '/classes',
      method: 'get',
      headers: {},
    };
    const error502 = {
      config: originalRequest,
      response: { status: 502 },
    };

    const promise = responseInterceptorError(error502);

    // Fast-forward retry delay
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(originalRequest._retryCount).toBe(1);
    expect(dispatchEventSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'lms:server-waking',
      })
    );
    expect(result.data).toEqual({ success: true });
  });
});
