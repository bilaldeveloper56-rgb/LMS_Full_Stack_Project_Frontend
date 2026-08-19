import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createExam,
  fetchExams,
  fetchExamById,
  updateExam,
  deleteExam,
  publishExam,
  scheduleExamPaper,
} from '../api/exams.api';
import { useToast } from '@/components/feedback';
import { getErrorMessage } from '@/lib/utils';

export function useExams(params = {}, options = {}) {
  return useQuery({
    queryKey: ['exams', params],
    queryFn: () => fetchExams(params),
    staleTime: 60 * 1000,
    ...options,
  });
}

export function useExam(id, options = {}) {
  return useQuery({
    queryKey: ['exams', id],
    queryFn: () => fetchExamById(id),
    enabled: Boolean(id),
    staleTime: 60 * 1000,
    ...options,
  });
}

export function useCreateExam() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload) => createExam(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      toast.success('Exam created successfully');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

export function useUpdateExam() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, payload }) => updateExam(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      queryClient.invalidateQueries({ queryKey: ['exams', id] });
      toast.success('Exam updated successfully');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

export function useDeleteExam() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id) => deleteExam(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      toast.success('Exam deleted successfully');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

export function usePublishExam() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id) => publishExam(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      queryClient.invalidateQueries({ queryKey: ['exams', id] });
      toast.success('Exam schedule published');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

export function useScheduleExamPaper(examId) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload) => scheduleExamPaper(examId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams', examId] });
      toast.success('Exam paper scheduled successfully');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}
