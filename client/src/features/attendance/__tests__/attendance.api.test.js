import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from '@/config/api';
import {
  createAttendance,
  bulkMarkAttendance,
  fetchAttendanceList,
  fetchStudentAttendance,
  fetchAttendanceSummaryReport,
  correctAttendance,
  deleteAttendance,
} from '../api/attendance.api';

vi.mock('@/config/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('Attendance API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('createAttendance should call POST /attendance', async () => {
    const payload = { studentId: 's1', status: 'PRESENT', date: '2026-09-01' };
    api.post.mockResolvedValueOnce({ data: { success: true, data: { id: 'att1', ...payload } } });

    const result = await createAttendance(payload);
    expect(api.post).toHaveBeenCalledWith('/attendance', payload);
    expect(result.id).toBe('att1');
  });

  it('bulkMarkAttendance should call POST /attendance/bulk', async () => {
    const payload = { sectionId: 'sec1', records: [{ studentId: 's1', status: 'PRESENT' }] };
    api.post.mockResolvedValueOnce({ data: { success: true, data: { count: 1 } } });

    const result = await bulkMarkAttendance(payload);
    expect(api.post).toHaveBeenCalledWith('/attendance/bulk', payload);
    expect(result.count).toBe(1);
  });

  it('fetchAttendanceList should call GET /attendance with query params', async () => {
    api.get.mockResolvedValueOnce({
      data: { success: true, data: [{ id: 'att1' }], pagination: { page: 1, total: 1 } },
    });

    const result = await fetchAttendanceList({ sectionId: 'sec1' });
    expect(api.get).toHaveBeenCalledWith('/attendance', { params: { sectionId: 'sec1' } });
    expect(result.records).toHaveLength(1);
  });

  it('fetchAttendanceSummaryReport should call GET /attendance/reports/summary', async () => {
    api.get.mockResolvedValueOnce({ data: { success: true, data: { present: 95, absent: 5 } } });

    const result = await fetchAttendanceSummaryReport({ classId: 'c1' });
    expect(api.get).toHaveBeenCalledWith('/attendance/reports/summary', { params: { classId: 'c1' } });
    expect(result.present).toBe(95);
  });

  it('correctAttendance should call PATCH /attendance/:id/correct', async () => {
    const payload = { status: 'EXCUSED', correctionReason: 'Doctor note provided' };
    api.patch.mockResolvedValueOnce({ data: { success: true, data: { id: 'att1', ...payload } } });

    const result = await correctAttendance('att1', payload);
    expect(api.patch).toHaveBeenCalledWith('/attendance/att1/correct', payload);
    expect(result.status).toBe('EXCUSED');
  });

  it('deleteAttendance should call DELETE /attendance/:id', async () => {
    api.delete.mockResolvedValueOnce({ data: { success: true } });
    const result = await deleteAttendance('att1');
    expect(api.delete).toHaveBeenCalledWith('/attendance/att1');
    expect(result.success).toBe(true);
  });
});
