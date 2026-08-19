import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@/components/feedback';
import {
  useAssignments,
  useAssignment,
  useCreateAssignment,
  usePublishAssignment,
  useSubmitAssignment,
  useGradeSubmission,
} from '../hooks/useAssignments';
import * as assignmentsApi from '../api/assignments.api';

vi.mock('../api/assignments.api', () => ({
  fetchAssignments: vi.fn(),
  fetchAssignmentById: vi.fn(),
  fetchAssignmentSubmissions: vi.fn(),
  createAssignment: vi.fn(),
  updateAssignment: vi.fn(),
  deleteAssignment: vi.fn(),
  publishAssignment: vi.fn(),
  submitAssignment: vi.fn(),
  gradeSubmission: vi.fn(),
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

describe('useAssignments React Query Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('useAssignments should fetch assignments list', async () => {
    assignmentsApi.fetchAssignments.mockResolvedValue({
      assignments: [{ id: 'asgn1', title: 'Math HW' }],
      pagination: { page: 1, total: 1 },
    });

    const { result } = renderHook(() => useAssignments({ page: 1 }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data.assignments).toHaveLength(1);
  });

  it('useCreateAssignment and usePublishAssignment should execute mutations', async () => {
    assignmentsApi.createAssignment.mockResolvedValue({ id: 'asgn1' });
    assignmentsApi.publishAssignment.mockResolvedValue({ id: 'asgn1', status: 'PUBLISHED' });

    const { result: createHook } = renderHook(() => useCreateAssignment(), {
      wrapper: createWrapper(),
    });
    await createHook.current.mutateAsync({ title: 'Math HW' });
    expect(assignmentsApi.createAssignment).toHaveBeenCalled();

    const { result: publishHook } = renderHook(() => usePublishAssignment('asgn1'), {
      wrapper: createWrapper(),
    });
    await publishHook.current.mutateAsync();
    expect(assignmentsApi.publishAssignment).toHaveBeenCalledWith('asgn1');
  });

  it('useSubmitAssignment and useGradeSubmission should execute mutations', async () => {
    assignmentsApi.submitAssignment.mockResolvedValue({ id: 'sub1', status: 'SUBMITTED' });
    assignmentsApi.gradeSubmission.mockResolvedValue({ id: 'sub1', status: 'GRADED' });

    const { result: submitHook } = renderHook(() => useSubmitAssignment('asgn1'), {
      wrapper: createWrapper(),
    });
    await submitHook.current.mutateAsync({ submissionContent: 'Solved' });
    expect(assignmentsApi.submitAssignment).toHaveBeenCalledWith('asgn1', { submissionContent: 'Solved' });

    const { result: gradeHook } = renderHook(() => useGradeSubmission('asgn1'), {
      wrapper: createWrapper(),
    });
    await gradeHook.current.mutateAsync({ submissionId: 'sub1', score: 95 });
    expect(assignmentsApi.gradeSubmission).toHaveBeenCalledWith('sub1', { score: 95 });
  });
});
