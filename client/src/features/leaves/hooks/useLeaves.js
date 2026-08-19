import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchLeaves,
  fetchMyLeaves,
  fetchStudentLeaves,
  fetchTeacherLeaves,
  fetchLeaveById,
  createLeave,
  updateLeave,
  cancelLeave,
  approveLeave,
  rejectLeave,
  deleteLeave,
} from '../api/leaves.api';
import { useToast } from '@/components/feedback';
import { getErrorMessage } from '@/lib/utils';

export function useLeaves(params = {}, options = {}) {
  return useQuery({
    queryKey: ['leaves', params],
    queryFn: () => fetchLeaves(params),
    staleTime: 60 * 1000,
    ...options,
  });
}

export function useMyLeaves(params = {}, options = {}) {
  return useQuery({
    queryKey: ['my-leaves', params],
    queryFn: () => fetchMyLeaves(params),
    staleTime: 60 * 1000,
    ...options,
  });
}

export function useStudentLeaves(studentId, params = {}, options = {}) {
  return useQuery({
    queryKey: ['student-leaves', studentId, params],
    queryFn: () => fetchStudentLeaves(studentId, params),
    enabled: Boolean(studentId),
    staleTime: 60 * 1000,
    ...options,
  });
}

export function useTeacherLeaves(teacherId, params = {}, options = {}) {
  return useQuery({
    queryKey: ['teacher-leaves', teacherId, params],
    queryFn: () => fetchTeacherLeaves(teacherId, params),
    enabled: Boolean(teacherId),
    staleTime: 60 * 1000,
    ...options,
  });
}

export function useLeave(id, options = {}) {
  return useQuery({
    queryKey: ['leave', id],
    queryFn: () => fetchLeaveById(id),
    enabled: Boolean(id),
    staleTime: 60 * 1000,
    ...options,
  });
}

export function useCreateLeave() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload) => createLeave(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaves'] });
      queryClient.invalidateQueries({ queryKey: ['my-leaves'] });
      toast.success('Leave application submitted successfully');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

export function useUpdateLeave(id) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload) => updateLeave(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaves'] });
      queryClient.invalidateQueries({ queryKey: ['my-leaves'] });
      queryClient.invalidateQueries({ queryKey: ['leave', id] });
      toast.success('Leave application updated');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

export function useCancelLeave() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id) => cancelLeave(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaves'] });
      queryClient.invalidateQueries({ queryKey: ['my-leaves'] });
      toast.success('Leave application cancelled');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

export function useApproveLeave() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id) => approveLeave(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaves'] });
      queryClient.invalidateQueries({ queryKey: ['my-leaves'] });
      toast.success('Leave application approved');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

export function useRejectLeave() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, ...payload }) => rejectLeave(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaves'] });
      queryClient.invalidateQueries({ queryKey: ['my-leaves'] });
      toast.success('Leave application rejected');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

export function useDeleteLeave() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id) => deleteLeave(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaves'] });
      queryClient.invalidateQueries({ queryKey: ['my-leaves'] });
      toast.success('Leave application removed');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}
