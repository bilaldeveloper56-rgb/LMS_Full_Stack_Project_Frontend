import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import api from '../api';
import { setAccessToken, getAccessToken, clearAccessToken } from '@/features/auth/auth.token';

vi.mock('axios', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    default: {
      ...actual.default,
      create: vi.fn(() => {
        const instance = actual.default.create();
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
});
