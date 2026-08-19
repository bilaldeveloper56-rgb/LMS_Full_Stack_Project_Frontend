import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@/components/feedback';
import {
  useSchools,
  useSchool,
  useCreateSchool,
  useChangeSchoolStatus,
  useResendAdminInvitation,
} from '../hooks/useSchools';
import * as schoolsApi from '../api/schools.api';

vi.mock('../api/schools.api', () => ({
  fetchSchools: vi.fn(),
  fetchSchoolStats: vi.fn(),
  fetchSchoolById: vi.fn(),
  fetchMySchool: vi.fn(),
  createSchool: vi.fn(),
  updateSchool: vi.fn(),
  changeSchoolStatus: vi.fn(),
  resendAdminInvitation: vi.fn(),
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

describe('useSchools React Query Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('useSchools and useSchool should query schools', async () => {
    schoolsApi.fetchSchools.mockResolvedValue({
      schools: [{ id: 's1', name: 'Springfield' }],
      pagination: { page: 1, total: 1 },
    });
    schoolsApi.fetchSchoolById.mockResolvedValue({ id: 's1', name: 'Springfield' });

    const { result: listHook } = renderHook(() => useSchools(), { wrapper: createWrapper() });
    await waitFor(() => expect(listHook.current.isSuccess).toBe(true));
    expect(listHook.current.data.schools).toHaveLength(1);

    const { result: singleHook } = renderHook(() => useSchool('s1'), { wrapper: createWrapper() });
    await waitFor(() => expect(singleHook.current.isSuccess).toBe(true));
    expect(singleHook.current.data.name).toBe('Springfield');
  });

  it('useCreateSchool, useChangeSchoolStatus, useResendAdminInvitation should mutate', async () => {
    schoolsApi.createSchool.mockResolvedValue({ school: { id: 's1' } });
    schoolsApi.changeSchoolStatus.mockResolvedValue({ id: 's1', status: 'ACTIVE' });
    schoolsApi.resendAdminInvitation.mockResolvedValue({ success: true });

    const { result: createHook } = renderHook(() => useCreateSchool(), { wrapper: createWrapper() });
    await createHook.current.mutateAsync({ school: { name: 'New' }, admin: {} });
    expect(schoolsApi.createSchool).toHaveBeenCalled();

    const { result: statusHook } = renderHook(() => useChangeSchoolStatus(), { wrapper: createWrapper() });
    await statusHook.current.mutateAsync({ id: 's1', payload: { status: 'ACTIVE' } });
    expect(schoolsApi.changeSchoolStatus).toHaveBeenCalledWith('s1', { status: 'ACTIVE' });

    const { result: inviteHook } = renderHook(() => useResendAdminInvitation(), { wrapper: createWrapper() });
    await inviteHook.current.mutateAsync('s1');
    expect(schoolsApi.resendAdminInvitation).toHaveBeenCalledWith('s1');
  });
});
