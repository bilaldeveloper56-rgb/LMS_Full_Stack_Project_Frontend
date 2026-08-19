import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from '@/config/api';
import { fetchAuditLogs } from '../api/auditLogs.api';

vi.mock('@/config/api', () => ({
  default: {
    get: vi.fn(),
  },
}));

describe('Audit Logs API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetchAuditLogs should call /audit-logs with query params', async () => {
    api.get.mockResolvedValueOnce({
      data: {
        success: true,
        data: [{ id: 'log1', event: 'AUTH_LOGIN_SUCCESS', entityType: 'User' }],
        pagination: { page: 1, limit: 50, total: 1, totalPages: 1 },
      },
    });

    const result = await fetchAuditLogs({ event: 'AUTH_LOGIN_SUCCESS', page: 1 });
    expect(api.get).toHaveBeenCalledWith('/audit-logs', {
      params: { event: 'AUTH_LOGIN_SUCCESS', page: 1 },
    });
    expect(result.logs).toHaveLength(1);
    expect(result.pagination.total).toBe(1);
  });
});
