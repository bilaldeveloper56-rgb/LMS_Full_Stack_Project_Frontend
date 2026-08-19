import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from '@/config/api';
import {
  createAssignment,
  fetchAssignments,
  fetchAssignmentById,
  updateAssignment,
  deleteAssignment,
  publishAssignment,
  submitAssignment,
  fetchAssignmentSubmissions,
  gradeSubmission,
} from '../api/assignments.api';

vi.mock('@/config/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('Assignments API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('createAssignment should call POST /assignments', async () => {
    const payload = { title: 'Math HW 1', maxScore: 100 };
    api.post.mockResolvedValueOnce({
      data: { success: true, data: { assignment: { id: 'asgn1', ...payload } } },
    });

    const result = await createAssignment(payload);
    expect(api.post).toHaveBeenCalledWith('/assignments', payload);
    expect(result.id).toBe('asgn1');
  });

  it('fetchAssignments should call GET /assignments with query params', async () => {
    api.get.mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          assignments: [{ id: 'asgn1', title: 'Math HW 1' }],
          pagination: { page: 1, total: 1 },
        },
      },
    });

    const result = await fetchAssignments({ page: 1 });
    expect(api.get).toHaveBeenCalledWith('/assignments', { params: { page: 1 } });
    expect(result.assignments).toHaveLength(1);
  });

  it('fetchAssignmentById should call GET /assignments/:id', async () => {
    api.get.mockResolvedValueOnce({
      data: { success: true, data: { assignment: { id: 'asgn1', title: 'Math HW 1' } } },
    });

    const result = await fetchAssignmentById('asgn1');
    expect(api.get).toHaveBeenCalledWith('/assignments/asgn1');
    expect(result.title).toBe('Math HW 1');
  });

  it('publishAssignment, submitAssignment, and gradeSubmission should call proper endpoints', async () => {
    api.post.mockResolvedValueOnce({
      data: { success: true, data: { assignment: { id: 'asgn1', status: 'PUBLISHED' } } },
    });
    const resPublish = await publishAssignment('asgn1');
    expect(api.post).toHaveBeenCalledWith('/assignments/asgn1/publish');
    expect(resPublish.status).toBe('PUBLISHED');

    api.post.mockResolvedValueOnce({
      data: { success: true, data: { submission: { id: 'sub1', status: 'SUBMITTED' } } },
    });
    const resSubmit = await submitAssignment('asgn1', { submissionContent: 'Solved' });
    expect(api.post).toHaveBeenCalledWith('/assignments/asgn1/submit', { submissionContent: 'Solved' });
    expect(resSubmit.status).toBe('SUBMITTED');

    api.patch.mockResolvedValueOnce({
      data: { success: true, data: { submission: { id: 'sub1', score: 90 } } },
    });
    const resGrade = await gradeSubmission('sub1', { score: 90, feedback: 'Great job' });
    expect(api.patch).toHaveBeenCalledWith('/assignments/submissions/sub1/grade', {
      score: 90,
      feedback: 'Great job',
    });
    expect(resGrade.score).toBe(90);
  });

  it('deleteAssignment should call DELETE /assignments/:id', async () => {
    api.delete.mockResolvedValueOnce({ data: { success: true, message: 'Deleted' } });
    const resDelete = await deleteAssignment('asgn1');
    expect(api.delete).toHaveBeenCalledWith('/assignments/asgn1');
    expect(resDelete.success).toBe(true);
  });
});
