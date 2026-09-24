import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getErrorMessage, getApiBaseUrl, truncate, getInitials, cn } from '../utils';

describe('getErrorMessage Utility', () => {
  const originalNavigator = globalThis.navigator;

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return fallback when error is null or undefined', () => {
    expect(getErrorMessage(null)).toBe('An unexpected error occurred.');
    expect(getErrorMessage(undefined, 'Custom fallback')).toBe('Custom fallback');
  });

  it('should detect browser offline state', () => {
    // Mock navigator.onLine as false
    Object.defineProperty(globalThis, 'navigator', {
      value: { onLine: false },
      configurable: true,
      writable: true,
    });

    const error = new Error('Random error');
    expect(getErrorMessage(error)).toBe('You appear to be offline. Please check your internet connection.');

    // Restore
    Object.defineProperty(globalThis, 'navigator', {
      value: originalNavigator,
      configurable: true,
      writable: true,
    });
  });

  it('should return formatted validation errors from data.errors array', () => {
    const error = {
      response: {
        status: 422,
        data: {
          errors: ['Email is invalid', 'Password must be at least 8 characters'],
        },
      },
    };
    expect(getErrorMessage(error)).toBe('Email is invalid, Password must be at least 8 characters');
  });

  it('should return safe backend operational message', () => {
    const error = {
      response: {
        status: 400,
        data: {
          message: 'This email is already in use by another student.',
        },
      },
    };
    expect(getErrorMessage(error)).toBe('This email is already in use by another student.');
  });

  it('should sanitize technical/sensitive error messages and fall back to status message', () => {
    const error = {
      response: {
        status: 500,
        data: {
          message: 'MongoError: connection timed out at Object.connect',
        },
      },
    };
    // Should NOT leak MongoError or stack trace
    expect(getErrorMessage(error)).toBe('Something went wrong on the server. Please try again.');
  });

  it('should categorize HTTP 401 as session expired', () => {
    const error = { response: { status: 401 } };
    expect(getErrorMessage(error)).toBe('Your session has expired. Please sign in again.');
  });

  it('should categorize HTTP 403 as permission denied', () => {
    const error = { response: { status: 403 } };
    expect(getErrorMessage(error)).toBe('You do not have permission to perform this action.');
  });

  it('should categorize HTTP 404 as not found', () => {
    const error = { response: { status: 404 } };
    expect(getErrorMessage(error)).toBe('The requested resource was not found.');
  });

  it('should categorize HTTP 422 as validation failure', () => {
    const error = { response: { status: 422 } };
    expect(getErrorMessage(error)).toBe('The provided data failed validation. Please check your inputs.');
  });

  it('should categorize HTTP 429 as rate limit', () => {
    const error = { response: { status: 429 } };
    expect(getErrorMessage(error)).toBe('Too many requests. Please wait a moment and try again.');
  });

  it('should categorize HTTP 500 as server error', () => {
    const error = { response: { status: 500 } };
    expect(getErrorMessage(error)).toBe('Something went wrong on the server. Please try again.');
  });

  it('should categorize HTTP 502/503/504 as server temporarily unavailable', () => {
    expect(getErrorMessage({ response: { status: 502 } })).toBe('The server is temporarily unavailable. Please try again shortly.');
    expect(getErrorMessage({ response: { status: 503 } })).toBe('The server is temporarily unavailable. Please try again shortly.');
    expect(getErrorMessage({ response: { status: 504 } })).toBe('The server is temporarily unavailable. Please try again shortly.');
  });

  it('should categorize ECONNABORTED timeout error correctly', () => {
    const error = { code: 'ECONNABORTED', message: 'timeout of 45000ms exceeded' };
    expect(getErrorMessage(error)).toBe('The server took too long to respond. Please try again.');
  });

  it('should categorize ERR_NETWORK and Network Error correctly', () => {
    expect(getErrorMessage({ code: 'ERR_NETWORK' })).toBe('Unable to reach the server. Please check your internet connection and try again.');
    expect(getErrorMessage({ message: 'Network Error' })).toBe('Unable to reach the server. Please check your internet connection and try again.');
    expect(getErrorMessage(new Error('Network Error'))).toBe('Unable to reach the server. Please check your internet connection and try again.');
  });
});

describe('getApiBaseUrl Utility', () => {
  it('should return a valid base URL string', () => {
    const url = getApiBaseUrl();
    expect(typeof url).toBe('string');
    expect(url.length).toBeGreaterThan(0);
  });
});

describe('Other Utility Functions', () => {
  it('should truncate strings correctly', () => {
    expect(truncate('Hello world', 5)).toBe('Hello…');
    expect(truncate('Short', 10)).toBe('Short');
    expect(truncate(null, 5)).toBe('');
  });

  it('should generate initials correctly', () => {
    expect(getInitials('John', 'Doe')).toBe('JD');
    expect(getInitials('Alice', '')).toBe('A');
    expect(getInitials('', '')).toBe('');
  });

  it('should merge class names with cn', () => {
    expect(cn('btn', 'btn-primary')).toBe('btn btn-primary');
    expect(cn('btn', false && 'hidden', 'active')).toBe('btn active');
  });
});
