import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSchoolAnalytics, usePlatformAnalytics } from '../hooks/useDashboardData';
import * as dashboardApi from '../api/dashboard.api';

vi.mock('../api/dashboard.api', () => ({
  fetchSchoolAnalytics: vi.fn(),
  fetchPlatformAnalytics: vi.fn(),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useDashboardData Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('useSchoolAnalytics should fetch and return school analytics', async () => {
    const mockData = {
      demographics: { activeStudents: 500 },
      financials: { collectionRatePercentage: 92.5 },
    };
    dashboardApi.fetchSchoolAnalytics.mockResolvedValueOnce(mockData);

    const { result } = renderHook(() => useSchoolAnalytics(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockData);
  });

  it('usePlatformAnalytics should fetch and return platform analytics', async () => {
    const mockData = {
      schools: { totalSchools: 25 },
      users: { totalUsers: 1200 },
    };
    dashboardApi.fetchPlatformAnalytics.mockResolvedValueOnce(mockData);

    const { result } = renderHook(() => usePlatformAnalytics(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockData);
  });
});
