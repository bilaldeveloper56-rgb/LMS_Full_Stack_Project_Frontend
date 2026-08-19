import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchAssignments,
  fetchAssignmentById,
  fetchAssignmentSubmissions,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  publishAssignment,
  submitAssignment,
  gradeSubmission,
} from '../api/assignments.api';
import { useToast } from '@/components/feedback';
import { getErrorMessage } from '@/lib/utils';

export function useAssignments(params = {}, options = {}) {
  return useQuery({
    queryKey: ['assignments', params],
    queryFn: () => fetchAssignments(params),
    staleTime: 60 * 1000,
    ...options,
  });
}

export function useAssignment(id, options = {}) {
  return useQuery({
    queryKey: ['assignment', id],
    queryFn: () => fetchAssignmentById(id),
    enabled: Boolean(id),
    staleTime: 60 * 1000,
    ...options,
  });
}

export function useAssignmentSubmissions(assignmentId, options = {}) {
  return useQuery({
    queryKey: ['assignment-submissions', assignmentId],
    queryFn: () => fetchAssignmentSubmissions(assignmentId),
    enabled: Boolean(assignmentId),
    staleTime: 30 * 1000,
    ...options,
  });
}

export function useCreateAssignment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload) => createAssignment(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      toast.success('Assignment created successfully');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

export function useUpdateAssignment(id) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload) => updateAssignment(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      queryClient.invalidateQueries({ queryKey: ['assignment', id] });
      toast.success('Assignment updated successfully');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

export function usePublishAssignment(id) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (targetId) => publishAssignment(targetId || id),
    onSuccess: (_, targetId) => {
      const effectiveId = targetId || id;
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      if (effectiveId) queryClient.invalidateQueries({ queryKey: ['assignment', effectiveId] });
      toast.success('Assignment published to students');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

export function useDeleteAssignment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id) => deleteAssignment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      toast.success('Assignment removed successfully');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

export function useSubmitAssignment(assignmentId) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload) => submitAssignment(assignmentId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignment', assignmentId] });
      queryClient.invalidateQueries({ queryKey: ['assignment-submissions', assignmentId] });
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      toast.success('Your assignment has been submitted successfully');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

export function useGradeSubmission(assignmentId) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ submissionId, ...payload }) => gradeSubmission(submissionId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignment-submissions', assignmentId] });
      queryClient.invalidateQueries({ queryKey: ['assignment', assignmentId] });
      toast.success('Submission graded successfully');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}
