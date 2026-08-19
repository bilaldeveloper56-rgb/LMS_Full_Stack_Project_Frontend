import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
import { useToast } from '@/components/feedback';
import { getErrorMessage } from '@/lib/utils';

export function useQuizzes(params = {}, options = {}) {
  return useQuery({
    queryKey: ['quizzes', params],
    queryFn: () => fetchQuizzes(params),
    staleTime: 60 * 1000,
    ...options,
  });
}

export function useQuiz(id, options = {}) {
  return useQuery({
    queryKey: ['quiz', id],
    queryFn: () => fetchQuizById(id),
    enabled: Boolean(id),
    staleTime: 60 * 1000,
    ...options,
  });
}

export function useQuizAttempts(quizId, options = {}) {
  return useQuery({
    queryKey: ['quiz-attempts', quizId],
    queryFn: async () => {
      // In this backend, attempts are linked per quiz
      return [];
    },
    enabled: Boolean(quizId),
    staleTime: 30 * 1000,
    ...options,
  });
}

export function useQuizAttempt(attemptId, options = {}) {
  return useQuery({
    queryKey: ['quiz-attempt', attemptId],
    queryFn: async () => null,
    enabled: Boolean(attemptId),
    ...options,
  });
}

export function useCreateQuiz() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload) => createQuiz(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      toast.success('Quiz created successfully');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

export function useUpdateQuiz(id) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload) => updateQuiz(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      queryClient.invalidateQueries({ queryKey: ['quiz', id] });
      toast.success('Quiz updated successfully');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

export function usePublishQuiz(id) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (targetId) => publishQuiz(targetId || id),
    onSuccess: (_, targetId) => {
      const effectiveId = targetId || id;
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      if (effectiveId) queryClient.invalidateQueries({ queryKey: ['quiz', effectiveId] });
      toast.success('Quiz published to students');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

export function useDeleteQuiz() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id) => deleteQuiz(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      toast.success('Quiz deleted successfully');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

export function useStartQuizAttempt(quizId) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: () => startQuizAttempt(quizId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz', quizId] });
      queryClient.invalidateQueries({ queryKey: ['quiz-attempts', quizId] });
      toast.success('Quiz attempt started. Good luck!');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

export function useSubmitQuizAttempt(quizId) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ attemptId, ...payload }) => submitQuizAttempt(attemptId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz', quizId] });
      queryClient.invalidateQueries({ queryKey: ['quiz-attempts', quizId] });
      toast.success('Quiz submitted successfully!');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

export function useGradeQuizAttempt(quizId) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ attemptId, ...payload }) => gradeQuizAttempt(attemptId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz-attempts', quizId] });
      queryClient.invalidateQueries({ queryKey: ['quiz', quizId] });
      toast.success('Quiz attempt graded successfully');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}
