import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from '@/config/api';
import {
  createExam,
  fetchExams,
  fetchExamById,
  updateExam,
  deleteExam,
  publishExam,
  scheduleExamPaper,
} from '../api/exams.api';

vi.mock('@/config/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('Exams API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('createExam should call POST /exams', async () => {
    const payload = { name: 'Mid Term 2026', startDate: '2026-10-01', endDate: '2026-10-15' };
    api.post.mockResolvedValueOnce({
      data: {
        success: true,
        data: { exam: { id: 'e1', name: 'Mid Term 2026' } },
      },
    });

    const result = await createExam(payload);
    expect(api.post).toHaveBeenCalledWith('/exams', payload);
    expect(result.id).toBe('e1');
  });

  it('fetchExams should call GET /exams with params', async () => {
    api.get.mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          exams: [{ id: 'e1', name: 'Mid Term 2026' }],
          pagination: { page: 1, total: 1 },
        },
      },
    });

    const result = await fetchExams({ page: 1 });
    expect(api.get).toHaveBeenCalledWith('/exams', { params: { page: 1 } });
    expect(result.exams).toHaveLength(1);
  });

  it('fetchExamById should call GET /exams/:id', async () => {
    api.get.mockResolvedValueOnce({
      data: {
        success: true,
        data: { exam: { id: 'e1', name: 'Mid Term 2026', papers: [] } },
      },
    });

    const result = await fetchExamById('e1');
    expect(api.get).toHaveBeenCalledWith('/exams/e1');
    expect(result.id).toBe('e1');
  });

  it('updateExam should call PATCH /exams/:id', async () => {
    const payload = { name: 'Updated Term' };
    api.patch.mockResolvedValueOnce({
      data: {
        success: true,
        data: { exam: { id: 'e1', name: 'Updated Term' } },
      },
    });

    const result = await updateExam('e1', payload);
    expect(api.patch).toHaveBeenCalledWith('/exams/e1', payload);
    expect(result.name).toBe('Updated Term');
  });

  it('publishExam should call POST /exams/:id/publish', async () => {
    api.post.mockResolvedValueOnce({
      data: {
        success: true,
        data: { exam: { id: 'e1', isPublished: true } },
      },
    });

    const result = await publishExam('e1');
    expect(api.post).toHaveBeenCalledWith('/exams/e1/publish');
    expect(result.isPublished).toBe(true);
  });

  it('scheduleExamPaper should call POST /exams/:id/papers', async () => {
    const payload = { classId: 'c1', subjectId: 's1', date: '2026-10-05', startTime: '09:00', endTime: '12:00' };
    api.post.mockResolvedValueOnce({
      data: {
        success: true,
        data: { paper: { id: 'p1', totalMarks: 100 } },
      },
    });

    const result = await scheduleExamPaper('e1', payload);
    expect(api.post).toHaveBeenCalledWith('/exams/e1/papers', payload);
    expect(result.id).toBe('p1');
  });
});
