import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from '../api';
import axios from 'axios';

vi.mock('axios', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    default: {
      ...actual.default,
      create: vi.fn(() => actual.default.create()),
      post: vi.fn(),
    },
  };
});

describe('Axios 401 vs 403 Separation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should immediately reject 403 Forbidden without attempting token refresh', async () => {
    const responseInterceptorError = api.interceptors.response.handlers[0].rejected;

    const forbiddenError = {
      config: { url: '/schools/secret-list' },
      response: {
        status: 403,
        data: { message: 'Forbidden: Insufficient privileges' },
      },
    };

    // Trigger response interceptor with 403 error
    await expect(responseInterceptorError(forbiddenError)).rejects.toEqual(forbiddenError);

    // Verify refresh endpoint was NEVER called
    expect(axios.post).not.toHaveBeenCalled();
  });
});
