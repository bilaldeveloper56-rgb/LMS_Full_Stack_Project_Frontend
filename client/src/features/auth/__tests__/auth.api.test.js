import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from '@/config/api';
import {
  loginApi,
  refreshTokenApi,
  logoutApi,
  getMeApi,
  updateProfileApi,
  changePasswordApi,
  forgotPasswordApi,
  resetPasswordApi,
} from '../api/auth.api';

vi.mock('@/config/api', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    patch: vi.fn(),
  },
}));

describe('Auth API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loginApi should post to /auth/login with credentials and return data', async () => {
    const mockResponse = {
      data: {
        success: true,
        data: {
          user: { id: 'u1', email: 'admin@school.com' },
          accessToken: 'token-123',
        },
      },
    };
    api.post.mockResolvedValueOnce(mockResponse);

    const result = await loginApi({ email: 'admin@school.com', password: 'Password123!' });

    expect(api.post).toHaveBeenCalledWith('/auth/login', {
      email: 'admin@school.com',
      password: 'Password123!',
    });
    expect(result).toEqual(mockResponse.data.data);
  });

  it('refreshTokenApi should post to /auth/refresh-token and return new token', async () => {
    const mockResponse = {
      data: {
        success: true,
        data: { accessToken: 'token-456' },
      },
    };
    api.post.mockResolvedValueOnce(mockResponse);

    const result = await refreshTokenApi();

    expect(api.post).toHaveBeenCalledWith('/auth/refresh-token');
    expect(result).toEqual({ accessToken: 'token-456' });
  });

  it('logoutApi should post to /auth/logout', async () => {
    api.post.mockResolvedValueOnce({ data: { success: true, message: 'Logged out successfully' } });

    const result = await logoutApi();

    expect(api.post).toHaveBeenCalledWith('/auth/logout');
    expect(result.success).toBe(true);
  });

  it('getMeApi should get /auth/me and return current user', async () => {
    const mockResponse = {
      data: {
        success: true,
        data: { user: { id: 'u1', firstName: 'Admin', role: 'SUPER_ADMIN' } },
      },
    };
    api.get.mockResolvedValueOnce(mockResponse);

    const result = await getMeApi();

    expect(api.get).toHaveBeenCalledWith('/auth/me');
    expect(result.user.role).toBe('SUPER_ADMIN');
  });

  it('updateProfileApi should patch /auth/me with profile changes', async () => {
    const mockResponse = {
      data: {
        success: true,
        data: { user: { id: 'u1', firstName: 'Jane' } },
      },
    };
    api.patch.mockResolvedValueOnce(mockResponse);

    const result = await updateProfileApi({ firstName: 'Jane' });

    expect(api.patch).toHaveBeenCalledWith('/auth/me', { firstName: 'Jane' });
    expect(result.user.firstName).toBe('Jane');
  });

  it('changePasswordApi should post to /auth/change-password', async () => {
    api.post.mockResolvedValueOnce({ data: { success: true } });

    await changePasswordApi({
      currentPassword: 'old',
      newPassword: 'new',
      confirmPassword: 'new',
    });

    expect(api.post).toHaveBeenCalledWith('/auth/change-password', {
      currentPassword: 'old',
      newPassword: 'new',
      confirmPassword: 'new',
    });
  });

  it('forgotPasswordApi should post to /auth/forgot-password', async () => {
    api.post.mockResolvedValueOnce({ data: { success: true } });

    await forgotPasswordApi('test@school.com');

    expect(api.post).toHaveBeenCalledWith('/auth/forgot-password', { email: 'test@school.com' });
  });

  it('resetPasswordApi should post to /auth/reset-password', async () => {
    api.post.mockResolvedValueOnce({ data: { success: true } });

    await resetPasswordApi({ token: 'tok', password: 'p', confirmPassword: 'p' });

    expect(api.post).toHaveBeenCalledWith('/auth/reset-password', {
      token: 'tok',
      password: 'p',
      confirmPassword: 'p',
    });
  });
});
