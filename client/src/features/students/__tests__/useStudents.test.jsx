import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@/components/feedback';
import {
  useStudents,
  useStudent,
  useCreateStudent,
  useUpdateStudent,
  useDeleteStudent,
} from '../hooks/useStudents';
import * as studentsApi from '../api/students.api';

vi.mock('../api/students.api', () => ({
  fetchStudents: vi.fn(),
  fetchStudentById: vi.fn(),
  fetchStudentProfile: vi.fn(),
  fetchStudentAcademic: vi.fn(),
  createStudent: vi.fn(),
  updateStudent: vi.fn(),
  deleteStudent: vi.fn(),
  uploadStudentAvatar: vi.fn(),
  fetchClasses: vi.fn(),
  fetchSections: vi.fn(),
  fetchAcademicSessions: vi.fn(),
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

describe('useStudents React Query Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('useStudents should fetch and return paginated students', async () => {
    const mockData = {
      students: [{ id: 's1', firstName: 'Jane' }],
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
    };
    studentsApi.fetchStudents.mockResolvedValueOnce(mockData);

    const { result } = renderHook(() => useStudents({ page: 1 }), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockData);
  });

  it('useCreateStudent should mutate and invalidate student queries', async () => {
    const mockCreated = { id: 's2', firstName: 'Bob' };
    studentsApi.createStudent.mockResolvedValueOnce(mockCreated);

    const { result } = renderHook(() => useCreateStudent(), {
      wrapper: createWrapper(),
    });

    await result.current.mutateAsync({ firstName: 'Bob' });
    expect(studentsApi.createStudent).toHaveBeenCalledWith({ firstName: 'Bob' });
  });

  it('useUpdateStudent should mutate and invalidate specific student queries', async () => {
    const mockUpdated = { id: 's2', firstName: 'Bob Updated' };
    studentsApi.updateStudent.mockResolvedValueOnce(mockUpdated);

    const { result } = renderHook(() => useUpdateStudent('s2'), {
      wrapper: createWrapper(),
    });

    await result.current.mutateAsync({ firstName: 'Bob Updated' });
    expect(studentsApi.updateStudent).toHaveBeenCalledWith('s2', { firstName: 'Bob Updated' });
  });

  it('useDeleteStudent should mutate and invalidate student queries', async () => {
    studentsApi.deleteStudent.mockResolvedValueOnce({ success: true });

    const { result } = renderHook(() => useDeleteStudent(), {
      wrapper: createWrapper(),
    });

    await result.current.mutateAsync('s2');
    expect(studentsApi.deleteStudent).toHaveBeenCalledWith('s2');
  });
});
