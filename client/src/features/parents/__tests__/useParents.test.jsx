import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@/components/feedback';
import {
  useParents,
  useCreateParent,
  useUpdateParent,
  useDeleteParent,
  useLinkChild,
  useUnlinkChild,
} from '../hooks/useParents';
import * as parentsApi from '../api/parents.api';

vi.mock('../api/parents.api', () => ({
  fetchParents: vi.fn(),
  fetchParentById: vi.fn(),
  fetchParentChildren: vi.fn(),
  createParent: vi.fn(),
  updateParent: vi.fn(),
  deleteParent: vi.fn(),
  linkStudentParent: vi.fn(),
  unlinkStudentParent: vi.fn(),
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

describe('useParents React Query Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('useParents should fetch and return parents list', async () => {
    const mockData = {
      parents: [{ id: 'p1', firstName: 'Martha' }],
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
    };
    parentsApi.fetchParents.mockResolvedValueOnce(mockData);

    const { result } = renderHook(() => useParents({ page: 1 }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockData);
  });

  it('useCreateParent should call createParent', async () => {
    parentsApi.createParent.mockResolvedValueOnce({ id: 'p2' });
    const { result } = renderHook(() => useCreateParent(), { wrapper: createWrapper() });

    await result.current.mutateAsync({ firstName: 'Thomas' });
    expect(parentsApi.createParent).toHaveBeenCalledWith({ firstName: 'Thomas' });
  });

  it('useLinkChild should call linkStudentParent', async () => {
    parentsApi.linkStudentParent.mockResolvedValueOnce({ id: 'l1' });
    const { result } = renderHook(() => useLinkChild('p1'), { wrapper: createWrapper() });

    await result.current.mutateAsync({ studentId: 's1', relationshipType: 'MOTHER' });
    expect(parentsApi.linkStudentParent).toHaveBeenCalledWith({
      studentId: 's1',
      relationshipType: 'MOTHER',
      parentId: 'p1',
    });
  });
});
