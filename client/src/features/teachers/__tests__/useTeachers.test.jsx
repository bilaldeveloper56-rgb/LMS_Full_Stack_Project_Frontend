import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@/components/feedback';
import {
  useTeachers,
  useCreateTeacher,
  useUpdateTeacher,
  useDeleteTeacher,
} from '../hooks/useTeachers';
import * as teachersApi from '../api/teachers.api';

vi.mock('../api/teachers.api', () => ({
  fetchTeachers: vi.fn(),
  fetchTeacherById: vi.fn(),
  fetchTeacherAssignments: vi.fn(),
  createTeacher: vi.fn(),
  updateTeacher: vi.fn(),
  deleteTeacher: vi.fn(),
  uploadTeacherAvatar: vi.fn(),
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

describe('useTeachers React Query Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('useTeachers should fetch and return teachers', async () => {
    const mockData = {
      teachers: [{ id: 't1', firstName: 'Niels' }],
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
    };
    teachersApi.fetchTeachers.mockResolvedValueOnce(mockData);

    const { result } = renderHook(() => useTeachers({ page: 1 }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockData);
  });

  it('useCreateTeacher should mutate and call createTeacher', async () => {
    teachersApi.createTeacher.mockResolvedValueOnce({ id: 't2', firstName: 'Max' });

    const { result } = renderHook(() => useCreateTeacher(), {
      wrapper: createWrapper(),
    });

    await result.current.mutateAsync({ firstName: 'Max' });
    expect(teachersApi.createTeacher).toHaveBeenCalledWith({ firstName: 'Max' });
  });

  it('useUpdateTeacher should mutate and call updateTeacher', async () => {
    teachersApi.updateTeacher.mockResolvedValueOnce({ id: 't2', firstName: 'Max Updated' });

    const { result } = renderHook(() => useUpdateTeacher('t2'), {
      wrapper: createWrapper(),
    });

    await result.current.mutateAsync({ firstName: 'Max Updated' });
    expect(teachersApi.updateTeacher).toHaveBeenCalledWith('t2', { firstName: 'Max Updated' });
  });

  it('useDeleteTeacher should mutate and call deleteTeacher', async () => {
    teachersApi.deleteTeacher.mockResolvedValueOnce({ success: true });

    const { result } = renderHook(() => useDeleteTeacher(), {
      wrapper: createWrapper(),
    });

    await result.current.mutateAsync('t2');
    expect(teachersApi.deleteTeacher).toHaveBeenCalledWith('t2');
  });
});
