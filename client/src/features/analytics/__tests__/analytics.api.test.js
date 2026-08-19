import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from '@/config/api';
import { fetchSchoolAnalytics, fetchPlatformAnalytics } from '../api/analytics.api';

vi.mock('@/config/api', () => ({
  default: {
    get: vi.fn(),
  },
}));

describe('Analytics API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetchSchoolAnalytics should call /analytics/school with params', async () => {
    api.get.mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          demographics: { totalStudents: 100 },
          attendance: { attendanceRatePercentage: 92 },
        },
      },
    });

    const res = await fetchSchoolAnalytics({ academicSessionId: 'sess1' });
    expect(api.get).toHaveBeenCalledWith('/analytics/school', {
      params: { academicSessionId: 'sess1' },
    });
    expect(res.demographics.totalStudents).toBe(100);
  });

  it('fetchPlatformAnalytics should call /analytics/platform', async () => {
    api.get.mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          schools: { totalSchools: 5 },
          users: { totalUsers: 500 },
        },
      },
    });

    const res = await fetchPlatformAnalytics();
    expect(api.get).toHaveBeenCalledWith('/analytics/platform', { params: {} });
    expect(res.schools.totalSchools).toBe(5);
  });
});
