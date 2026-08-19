import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
import { useToast } from '@/components/feedback';
import { getErrorMessage } from '@/lib/utils';

export function useGradingScales(options = {}) {
  return useQuery({
    queryKey: ['grading-scales'],
    queryFn: () => fetchGradingScales(),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

export function useCreateGradingScale() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload) => createGradingScale(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grading-scales'] });
      toast.success('Grading scale created successfully');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

export function useRecordMarks() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload) => recordMarks(payload),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['section-results', vars.examId] });
      queryClient.invalidateQueries({ queryKey: ['student-report-card', vars.studentId] });
      toast.success('Marks recorded');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

export function useBulkRecordMarks() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload) => bulkRecordMarks(payload),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['section-results', vars.examId] });
      queryClient.invalidateQueries({ queryKey: ['student-report-card'] });
      toast.success('Marks successfully saved for all students');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

export function useStudentReportCard(studentId, params = {}, options = {}) {
  return useQuery({
    queryKey: ['student-report-card', studentId, params],
    queryFn: () => fetchStudentReportCard(studentId, params),
    enabled: Boolean(studentId),
    staleTime: 60 * 1000,
    ...options,
  });
}

export function useSectionResults(examId, sectionId, params = {}, options = {}) {
  return useQuery({
    queryKey: ['section-results', examId, sectionId, params],
    queryFn: () => fetchSectionResults(examId, sectionId, params),
    enabled: Boolean(examId && sectionId),
    staleTime: 30 * 1000,
    ...options,
  });
}

export function useLockSectionResults() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ examId, sectionId }) => lockSectionResults(examId, sectionId),
    onSuccess: (_, { examId, sectionId }) => {
      queryClient.invalidateQueries({ queryKey: ['section-results', examId, sectionId] });
      toast.success('Section results locked');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

export function useUnlockSectionResults() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ examId, sectionId }) => unlockSectionResults(examId, sectionId),
    onSuccess: (_, { examId, sectionId }) => {
      queryClient.invalidateQueries({ queryKey: ['section-results', examId, sectionId] });
      toast.success('Section results unlocked for editing');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

export function usePublishSectionResults() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ examId, sectionId }) => publishSectionResults(examId, sectionId),
    onSuccess: (_, { examId, sectionId }) => {
      queryClient.invalidateQueries({ queryKey: ['section-results', examId, sectionId] });
      queryClient.invalidateQueries({ queryKey: ['student-report-card'] });
      toast.success('Section results published to students and parents');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}
