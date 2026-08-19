import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from '@/config/api';
import {
  createGradingScale,
  fetchGradingScales,
  recordMarks,
  bulkRecordMarks,
  fetchStudentReportCard,
  fetchSectionResults,
  lockSectionResults,
  unlockSectionResults,
  publishSectionResults,
} from '../api/results.api';

vi.mock('@/config/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('Results API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('createGradingScale should call POST /results/grading-scales', async () => {
    const payload = { name: 'Standard Scale', grades: [] };
    api.post.mockResolvedValueOnce({
      data: {
        success: true,
        data: { scale: { id: 'gs1', name: 'Standard Scale' } },
      },
    });

    const result = await createGradingScale(payload);
    expect(api.post).toHaveBeenCalledWith('/results/grading-scales', payload);
    expect(result.id).toBe('gs1');
  });

  it('fetchGradingScales should call GET /results/grading-scales', async () => {
    api.get.mockResolvedValueOnce({
      data: {
        success: true,
        data: { scales: [{ id: 'gs1', name: 'Standard Scale' }] },
      },
    });

    const result = await fetchGradingScales();
    expect(api.get).toHaveBeenCalledWith('/results/grading-scales');
    expect(result).toHaveLength(1);
  });

  it('recordMarks and bulkRecordMarks should call POST /results/marks endpoints', async () => {
    api.post.mockResolvedValueOnce({
      data: {
        success: true,
        data: { result: { id: 'r1', marksObtained: 85 } },
      },
    });

    const resSingle = await recordMarks({ examId: 'e1', examPaperId: 'p1', studentId: 's1', marksObtained: 85 });
    expect(api.post).toHaveBeenCalledWith('/results/marks', { examId: 'e1', examPaperId: 'p1', studentId: 's1', marksObtained: 85 });
    expect(resSingle.marksObtained).toBe(85);

    api.post.mockResolvedValueOnce({
      data: {
        success: true,
        data: { results: [{ id: 'r1', marksObtained: 85 }] },
      },
    });

    const resBulk = await bulkRecordMarks({ examId: 'e1', examPaperId: 'p1', records: [] });
    expect(api.post).toHaveBeenCalledWith('/results/marks/bulk', { examId: 'e1', examPaperId: 'p1', records: [] });
    expect(resBulk).toHaveLength(1);
  });

  it('fetchStudentReportCard should call GET /results/student/:studentId', async () => {
    api.get.mockResolvedValueOnce({
      data: {
        success: true,
        data: { student: { id: 's1' }, summary: { gpa: 3.8 } },
      },
    });

    const result = await fetchStudentReportCard('s1', { examId: 'e1' });
    expect(api.get).toHaveBeenCalledWith('/results/student/s1', { params: { examId: 'e1' } });
    expect(result.summary.gpa).toBe(3.8);
  });

  it('lockSectionResults, unlockSectionResults, and publishSectionResults should call respective endpoints', async () => {
    api.post.mockResolvedValue({ data: { success: true } });

    await lockSectionResults('e1', 'sec1');
    expect(api.post).toHaveBeenCalledWith('/results/exam/e1/section/sec1/lock');

    await unlockSectionResults('e1', 'sec1');
    expect(api.post).toHaveBeenCalledWith('/results/exam/e1/section/sec1/unlock');

    await publishSectionResults('e1', 'sec1');
    expect(api.post).toHaveBeenCalledWith('/results/exam/e1/section/sec1/publish');
  });
});
