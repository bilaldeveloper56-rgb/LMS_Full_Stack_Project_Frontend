import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@/components/feedback';
import {
  useLeaves,
  useMyLeaves,
  useCreateLeave,
  useApproveLeave,
  useRejectLeave,
  useCancelLeave,
} from '../hooks/useLeaves';
import * as leavesApi from '../api/leaves.api';

vi.mock('../api/leaves.api', () => ({
  fetchLeaves: vi.fn(),
  fetchMyLeaves: vi.fn(),
  fetchStudentLeaves: vi.fn(),
  fetchTeacherLeaves: vi.fn(),
  fetchLeaveById: vi.fn(),
  createLeave: vi.fn(),
  updateLeave: vi.fn(),
  cancelLeave: vi.fn(),
  approveLeave: vi.fn(),
  rejectLeave: vi.fn(),
  deleteLeave: vi.fn(),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>{children}</ToastProvider>
    </QueryClientProvider>
  );
};

describe('useLeaves React Query Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('useLeaves should fetch list', async () => {
    leavesApi.fetchLeaves.mockResolvedValue({
      leaves: [{ id: 'l1', status: 'PENDING' }],
      pagination: { page: 1, total: 1 },
    });

    const { result } = renderHook(() => useLeaves({ status: 'PENDING' }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data.leaves).toHaveLength(1);
  });

  it('useApproveLeave and useRejectLeave should execute mutations', async () => {
    leavesApi.approveLeave.mockResolvedValue({ id: 'l1', status: 'APPROVED' });
    leavesApi.rejectLeave.mockResolvedValue({ id: 'l1', status: 'REJECTED' });

    const { result: approveHook } = renderHook(() => useApproveLeave(), { wrapper: createWrapper() });
    await approveHook.current.mutateAsync('l1');
    expect(leavesApi.approveLeave).toHaveBeenCalledWith('l1');

    const { result: rejectHook } = renderHook(() => useRejectLeave(), { wrapper: createWrapper() });
    await rejectHook.current.mutateAsync({ id: 'l1', rejectionReason: 'Reason' });
    expect(leavesApi.rejectLeave).toHaveBeenCalledWith('l1', { rejectionReason: 'Reason' });
  });
});
