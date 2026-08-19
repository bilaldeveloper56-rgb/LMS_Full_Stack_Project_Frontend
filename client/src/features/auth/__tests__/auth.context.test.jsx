import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../auth.context';
import * as authApi from '../api/auth.api';
import { getAccessToken } from '../auth.token';

vi.mock('../api/auth.api', () => ({
  loginApi: vi.fn(),
  logoutApi: vi.fn(),
  refreshTokenApi: vi.fn(),
  getMeApi: vi.fn(),
}));

describe('AuthContext & Provider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should restore session on mount when valid refresh token exists', async () => {
    authApi.refreshTokenApi.mockResolvedValueOnce({ accessToken: 'restored-token' });
    authApi.getMeApi.mockResolvedValueOnce({
      user: { id: 'u1', email: 'admin@school.com', role: 'SCHOOL_ADMIN' },
    });

    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user?.email).toBe('admin@school.com');
    expect(getAccessToken()).toBe('restored-token');
  });

  it('should gracefully transition to unauthenticated when refresh fails on mount', async () => {
    authApi.refreshTokenApi.mockRejectedValueOnce(new Error('No token'));

    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(getAccessToken()).toBeNull();
  });

  it('should authenticate user and store access token upon login', async () => {
    authApi.refreshTokenApi.mockRejectedValueOnce(new Error('No token'));

    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    authApi.loginApi.mockResolvedValueOnce({
      user: { id: 'u2', email: 'teacher@school.com', role: 'TEACHER' },
      accessToken: 'teacher-token',
    });

    await act(async () => {
      await result.current.login({ email: 'teacher@school.com', password: 'Password123!' });
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user?.email).toBe('teacher@school.com');
    expect(getAccessToken()).toBe('teacher-token');
  });

  it('should clear user state and token upon logout', async () => {
    authApi.refreshTokenApi.mockResolvedValueOnce({ accessToken: 'initial-token' });
    authApi.getMeApi.mockResolvedValueOnce({
      user: { id: 'u1', email: 'admin@school.com' },
    });

    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });

    authApi.logoutApi.mockResolvedValueOnce({});

    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(getAccessToken()).toBeNull();
  });

  it('should update user fields via updateUser', async () => {
    authApi.refreshTokenApi.mockResolvedValueOnce({ accessToken: 'tok' });
    authApi.getMeApi.mockResolvedValueOnce({
      user: { id: 'u1', firstName: 'John', lastName: 'Doe' },
    });

    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.user?.firstName).toBe('John');
    });

    act(() => {
      result.current.updateUser({ firstName: 'Johnny' });
    });

    expect(result.current.user?.firstName).toBe('Johnny');
  });
});
