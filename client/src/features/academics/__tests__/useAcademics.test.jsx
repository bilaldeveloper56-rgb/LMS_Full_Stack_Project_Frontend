import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@/components/feedback';
import {
  useAcademicSessions,
  useCreateAcademicSession,
  useSetCurrentSession,
  useClasses,
  useCreateClass,
  useSections,
  useCreateSection,
  useSubjects,
  useCreateSubject,
  useTeacherAssignmentsList,
  useCreateTeacherAssignment,
} from '../hooks/useAcademics';
import * as academicsApi from '../api/academics.api';

vi.mock('../api/academics.api', () => ({
  fetchAcademicSessions: vi.fn(),
  fetchAcademicSessionById: vi.fn(),
  createAcademicSession: vi.fn(),
  updateAcademicSession: vi.fn(),
  changeAcademicSessionStatus: vi.fn(),
  setAcademicSessionCurrent: vi.fn(),
  deleteAcademicSession: vi.fn(),
  fetchClasses: vi.fn(),
  fetchClassById: vi.fn(),
  createClass: vi.fn(),
  updateClass: vi.fn(),
  deleteClass: vi.fn(),
  fetchSections: vi.fn(),
  fetchSectionById: vi.fn(),
  createSection: vi.fn(),
  updateSection: vi.fn(),
  deleteSection: vi.fn(),
  fetchSubjects: vi.fn(),
  fetchSubjectById: vi.fn(),
  createSubject: vi.fn(),
  updateSubject: vi.fn(),
  deleteSubject: vi.fn(),
  fetchTeacherAssignments: vi.fn(),
  createTeacherAssignment: vi.fn(),
  deleteTeacherAssignment: vi.fn(),
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

describe('useAcademics React Query Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('useAcademicSessions should fetch sessions', async () => {
    academicsApi.fetchAcademicSessions.mockResolvedValueOnce({ sessions: [{ id: 'ses1' }] });
    const { result } = renderHook(() => useAcademicSessions(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data.sessions).toHaveLength(1);
  });

  it('useSetCurrentSession should mutate', async () => {
    academicsApi.setAcademicSessionCurrent.mockResolvedValueOnce({ id: 'ses1', isCurrent: true });
    const { result } = renderHook(() => useSetCurrentSession(), { wrapper: createWrapper() });

    await result.current.mutateAsync('ses1');
    expect(academicsApi.setAcademicSessionCurrent).toHaveBeenCalledWith('ses1');
  });

  it('useCreateClass should mutate', async () => {
    academicsApi.createClass.mockResolvedValueOnce({ id: 'c1' });
    const { result } = renderHook(() => useCreateClass(), { wrapper: createWrapper() });

    await result.current.mutateAsync({ name: 'Grade 11' });
    expect(academicsApi.createClass).toHaveBeenCalledWith({ name: 'Grade 11' });
  });

  it('useCreateTeacherAssignment should mutate', async () => {
    academicsApi.createTeacherAssignment.mockResolvedValueOnce({ id: 'a1' });
    const { result } = renderHook(() => useCreateTeacherAssignment(), { wrapper: createWrapper() });

    await result.current.mutateAsync({ teacherId: 't1' });
    expect(academicsApi.createTeacherAssignment).toHaveBeenCalledWith({ teacherId: 't1' });
  });
});
