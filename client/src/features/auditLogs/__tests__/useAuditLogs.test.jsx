import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuditLogs } from '../hooks/useAuditLogs';
import * as auditApi from '../api/auditLogs.api';

vi.mock('../api/auditLogs.api', () => ({
  fetchAuditLogs: vi.fn(),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useAuditLogs React Query Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch audit logs with cleaned params', async () => {
    auditApi.fetchAuditLogs.mockResolvedValue({
      logs: [{ id: 'log1', event: 'NOTICE_PUBLISHED' }],
      pagination: { page: 1, total: 1 },
    });

    const { result } = renderHook(() => useAuditLogs({ event: 'NOTICE_PUBLISHED', entityType: '' }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(auditApi.fetchAuditLogs).toHaveBeenCalledWith({ event: 'NOTICE_PUBLISHED' });
    expect(result.current.data.logs).toHaveLength(1);
  });
});
