import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from '@/config/api';
import { fetchSchoolAnalytics, fetchPlatformAnalytics } from '../api/dashboard.api';

vi.mock('@/config/api', () => ({
  default: {
    get: vi.fn(),
  },
}));

describe('Dashboard API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetchSchoolAnalytics should call GET /analytics/school with query filters', async () => {
    const mockData = {
      demographics: { totalStudents: 100, activeStudents: 95 },
      financials: { totalInvoiced: 50000, totalPaid: 45000 },
    };
    api.get.mockResolvedValueOnce({ data: { success: true, data: mockData } });

    const filters = { startDate: '2026-01-01', endDate: '2026-01-31' };
    const result = await fetchSchoolAnalytics(filters);

    expect(api.get).toHaveBeenCalledWith('/analytics/school', { params: filters });
    expect(result).toEqual(mockData);
  });

  it('fetchPlatformAnalytics should call GET /analytics/platform with query filters', async () => {
    const mockData = {
      schools: { totalSchools: 10, ACTIVE: 8 },
      users: { totalUsers: 500 },
    };
    api.get.mockResolvedValueOnce({ data: { success: true, data: mockData } });

    const filters = { startDate: '2026-01-01' };
    const result = await fetchPlatformAnalytics(filters);

    expect(api.get).toHaveBeenCalledWith('/analytics/platform', { params: filters });
    expect(result).toEqual(mockData);
  });
});
