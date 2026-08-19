import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSchoolAnalytics, usePlatformAnalytics } from '../hooks/useAnalytics';
import * as analyticsApi from '../api/analytics.api';

vi.mock('../api/analytics.api', () => ({
  fetchSchoolAnalytics: vi.fn(),
  fetchPlatformAnalytics: vi.fn(),
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

describe('useAnalytics React Query Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('useSchoolAnalytics should query analytics endpoint with cleaned params', async () => {
    analyticsApi.fetchSchoolAnalytics.mockResolvedValue({
      demographics: { totalStudents: 150 },
      financials: { collectionRatePercentage: 90 },
    });

    const { result } = renderHook(() => useSchoolAnalytics({ classId: 'c1', startDate: '' }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(analyticsApi.fetchSchoolAnalytics).toHaveBeenCalledWith({ classId: 'c1' });
    expect(result.current.data.demographics.totalStudents).toBe(150);
  });

  it('usePlatformAnalytics should query platform analytics', async () => {
    analyticsApi.fetchPlatformAnalytics.mockResolvedValue({
      schools: { totalSchools: 10 },
    });

    const { result } = renderHook(() => usePlatformAnalytics(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data.schools.totalSchools).toBe(10);
  });
});
