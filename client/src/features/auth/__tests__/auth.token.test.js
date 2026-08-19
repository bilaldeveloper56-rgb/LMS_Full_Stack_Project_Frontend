import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getAccessToken,
  setAccessToken,
  clearAccessToken,
  onTokenChange,
} from '../auth.token';

describe('In-Memory Access Token Store', () => {
  beforeEach(() => {
    clearAccessToken();
  });

  it('should initialize with null token', () => {
    expect(getAccessToken()).toBeNull();
  });

  it('should set and get access token in memory', () => {
    setAccessToken('mock.jwt.token');
    expect(getAccessToken()).toBe('mock.jwt.token');
  });

  it('should clear access token from memory', () => {
    setAccessToken('mock.jwt.token');
    clearAccessToken();
    expect(getAccessToken()).toBeNull();
  });

  it('should notify subscribers on token change', () => {
    const listener = vi.fn();
    const unsubscribe = onTokenChange(listener);

    setAccessToken('new.jwt.token');
    expect(listener).toHaveBeenCalledWith('new.jwt.token');

    clearAccessToken();
    expect(listener).toHaveBeenCalledWith(null);

    unsubscribe();
    setAccessToken('another.token');
    expect(listener).toHaveBeenCalledTimes(2);
  });
});
