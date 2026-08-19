import { describe, it, expect, beforeEach } from 'vitest';
import { setAccessToken, getAccessToken, clearAccessToken } from '../auth.token';

describe('Frontend Security & Token Isolation', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    clearAccessToken();
  });

  it('should never write JWT access token to localStorage', () => {
    setAccessToken('sensitive-jwt-token');

    expect(localStorage.getItem('accessToken')).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('jwt')).toBeNull();
    expect(localStorage.getItem('refreshToken')).toBeNull();
  });

  it('should never write JWT access token to sessionStorage', () => {
    setAccessToken('sensitive-jwt-token');

    expect(sessionStorage.getItem('accessToken')).toBeNull();
    expect(sessionStorage.getItem('token')).toBeNull();
    expect(sessionStorage.getItem('jwt')).toBeNull();
  });

  it('should retain access token only in memory', () => {
    setAccessToken('in-memory-only-token');
    expect(getAccessToken()).toBe('in-memory-only-token');

    clearAccessToken();
    expect(getAccessToken()).toBeNull();
  });
});
