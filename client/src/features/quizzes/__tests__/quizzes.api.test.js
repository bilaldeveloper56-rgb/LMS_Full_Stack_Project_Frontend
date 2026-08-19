import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from '@/config/api';
import {
  createQuiz,
  fetchQuizzes,
  fetchQuizById,
  updateQuiz,
  deleteQuiz,
  publishQuiz,
  startQuizAttempt,
  submitQuizAttempt,
  gradeQuizAttempt,
} from '../api/quizzes.api';

vi.mock('@/config/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('Quizzes API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('createQuiz should call POST /quizzes', async () => {
    const payload = { title: 'Science Quiz', durationMinutes: 30 };
    api.post.mockResolvedValueOnce({
      data: { success: true, data: { quiz: { id: 'quiz1', ...payload } } },
    });

    const result = await createQuiz(payload);
    expect(api.post).toHaveBeenCalledWith('/quizzes', payload);
    expect(result.id).toBe('quiz1');
  });

  it('fetchQuizzes should call GET /quizzes with query params', async () => {
    api.get.mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          quizzes: [{ id: 'quiz1', title: 'Science Quiz' }],
          pagination: { page: 1, total: 1 },
        },
      },
    });

    const result = await fetchQuizzes({ page: 1 });
    expect(api.get).toHaveBeenCalledWith('/quizzes', { params: { page: 1 } });
    expect(result.quizzes).toHaveLength(1);
  });

  it('fetchQuizById should call GET /quizzes/:id', async () => {
    api.get.mockResolvedValueOnce({
      data: { success: true, data: { quiz: { id: 'quiz1', title: 'Science Quiz' } } },
    });

    const result = await fetchQuizById('quiz1');
    expect(api.get).toHaveBeenCalledWith('/quizzes/quiz1');
    expect(result.title).toBe('Science Quiz');
  });

  it('publishQuiz, startQuizAttempt, submitQuizAttempt, and gradeQuizAttempt should call proper endpoints', async () => {
    api.post.mockResolvedValueOnce({
      data: { success: true, data: { quiz: { id: 'quiz1', status: 'PUBLISHED' } } },
    });
    const resPublish = await publishQuiz('quiz1');
    expect(api.post).toHaveBeenCalledWith('/quizzes/quiz1/publish');
    expect(resPublish.status).toBe('PUBLISHED');

    api.post.mockResolvedValueOnce({
      data: { success: true, data: { attempt: { id: 'att1', status: 'IN_PROGRESS' } } },
    });
    const resStart = await startQuizAttempt('quiz1');
    expect(api.post).toHaveBeenCalledWith('/quizzes/quiz1/start');
    expect(resStart.id).toBe('att1');

    api.post.mockResolvedValueOnce({
      data: { success: true, data: { attempt: { id: 'att1', status: 'EVALUATED' } } },
    });
    const resSubmit = await submitQuizAttempt('att1', { answers: [] });
    expect(api.post).toHaveBeenCalledWith('/quizzes/attempts/att1/submit', { answers: [] });
    expect(resSubmit.status).toBe('EVALUATED');

    api.patch.mockResolvedValueOnce({
      data: { success: true, data: { attempt: { id: 'att1', status: 'EVALUATED', totalScore: 10 } } },
    });
    const resGrade = await gradeQuizAttempt('att1', { answers: [{ questionId: 'q1', marksAwarded: 5 }] });
    expect(api.patch).toHaveBeenCalledWith('/quizzes/attempts/att1/grade', {
      answers: [{ questionId: 'q1', marksAwarded: 5 }],
    });
    expect(resGrade.totalScore).toBe(10);
  });

  it('deleteQuiz should call DELETE /quizzes/:id', async () => {
    api.delete.mockResolvedValueOnce({ data: { success: true, message: 'Deleted' } });
    const resDelete = await deleteQuiz('quiz1');
    expect(api.delete).toHaveBeenCalledWith('/quizzes/quiz1');
    expect(resDelete.success).toBe(true);
  });
});
