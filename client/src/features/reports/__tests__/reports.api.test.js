import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from '@/config/api';
import {
  fetchStudentRosterReport,
  fetchAttendanceReport,
  fetchFeeDefaultersReport,
  fetchAcademicReportCard,
} from '../api/reports.api';

vi.mock('@/config/api', () => ({
  default: {
    get: vi.fn(),
  },
}));

describe('Reports API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetchStudentRosterReport should call /reports/student-roster with params', async () => {
    api.get.mockResolvedValueOnce({
      data: {
        success: true,
        data: [{ studentId: 's1', admissionNumber: 'ADM-001' }],
        pagination: { page: 1, total: 1 },
      },
    });

    const res = await fetchStudentRosterReport({ page: 1 });
    expect(api.get).toHaveBeenCalledWith('/reports/student-roster', { params: { page: 1 } });
    expect(res.roster).toHaveLength(1);
    expect(res.pagination.total).toBe(1);
  });

  it('fetchAttendanceReport should call /reports/attendance', async () => {
    api.get.mockResolvedValueOnce({
      data: {
        success: true,
        data: [{ studentId: 's1', totalDays: 20, presentDays: 18, attendancePercentage: 90 }],
        pagination: { page: 1, total: 1 },
      },
    });

    const res = await fetchAttendanceReport({ classId: 'c1' });
    expect(api.get).toHaveBeenCalledWith('/reports/attendance', { params: { classId: 'c1' } });
    expect(res.reports[0].presentDays).toBe(18);
  });

  it('fetchFeeDefaultersReport should call /reports/fee-defaulters', async () => {
    api.get.mockResolvedValueOnce({
      data: {
        success: true,
        data: [{ invoiceId: 'inv1', balanceAmount: 1000, daysOverdue: 5 }],
        pagination: { page: 1, total: 1 },
      },
    });

    const res = await fetchFeeDefaultersReport({ minBalance: 500 });
    expect(api.get).toHaveBeenCalledWith('/reports/fee-defaulters', { params: { minBalance: 500 } });
    expect(res.defaulters[0].balanceAmount).toBe(1000);
  });

  it('fetchAcademicReportCard should call /reports/report-card', async () => {
    api.get.mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          student: { admissionNumber: 'ADM-001' },
          performance: { cumulativePercentage: 88, overallStatus: 'PASSED' },
          results: [],
        },
      },
    });

    const res = await fetchAcademicReportCard({ studentId: 's1' });
    expect(api.get).toHaveBeenCalledWith('/reports/report-card', { params: { studentId: 's1' } });
    expect(res.performance.overallStatus).toBe('PASSED');
  });
});
