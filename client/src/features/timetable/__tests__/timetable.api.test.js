import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from '@/config/api';
import {
  createTimetableSlot,
  fetchSectionTimetable,
  fetchTeacherTimetable,
  updateTimetableSlot,
  deleteTimetableSlot,
} from '../api/timetable.api';

vi.mock('@/config/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('Timetable API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('createTimetableSlot should call POST /timetable', async () => {
    const payload = { dayOfWeek: 'MONDAY', periodNumber: 1, startTime: '08:00', endTime: '08:45' };
    api.post.mockResolvedValueOnce({ data: { success: true, data: { id: 'tt1', ...payload } } });

    const result = await createTimetableSlot(payload);
    expect(api.post).toHaveBeenCalledWith('/timetable', payload);
    expect(result.id).toBe('tt1');
  });

  it('fetchSectionTimetable and fetchTeacherTimetable should call grid endpoints', async () => {
    api.get.mockResolvedValueOnce({ data: { success: true, data: [{ id: 'tt1' }] } });
    const res1 = await fetchSectionTimetable('sec1');
    expect(api.get).toHaveBeenCalledWith('/timetable/section/sec1');
    expect(res1).toHaveLength(1);

    api.get.mockResolvedValueOnce({ data: { success: true, data: [{ id: 'tt2' }] } });
    const res2 = await fetchTeacherTimetable('teach1');
    expect(api.get).toHaveBeenCalledWith('/timetable/teacher/teach1');
    expect(res2).toHaveLength(1);
  });

  it('updateTimetableSlot and deleteTimetableSlot should call proper methods', async () => {
    api.patch.mockResolvedValueOnce({ data: { success: true, data: { id: 'tt1', room: '101' } } });
    const resUpdate = await updateTimetableSlot('tt1', { room: '101' });
    expect(api.patch).toHaveBeenCalledWith('/timetable/tt1', { room: '101' });
    expect(resUpdate.room).toBe('101');

    api.delete.mockResolvedValueOnce({ data: { success: true } });
    const resDelete = await deleteTimetableSlot('tt1');
    expect(api.delete).toHaveBeenCalledWith('/timetable/tt1');
    expect(resDelete.success).toBe(true);
  });
});
