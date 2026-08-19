import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchTeachers,
  fetchTeacherById,
  fetchTeacherAssignments,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  uploadTeacherAvatar,
} from '../api/teachers.api';
import { useToast } from '@/components/feedback';
import { getErrorMessage } from '@/lib/utils';

/**
 * Hook to fetch paginated teachers with filters.
 */
export function useTeachers(params = {}, options = {}) {
  return useQuery({
    queryKey: ['teachers', params],
    queryFn: () => fetchTeachers(params),
    staleTime: 60 * 1000,
    ...options,
  });
}

/**
 * Hook to fetch a single teacher by ID.
 */
export function useTeacher(id, options = {}) {
  return useQuery({
    queryKey: ['teacher', id],
    queryFn: () => fetchTeacherById(id),
    enabled: Boolean(id),
    staleTime: 60 * 1000,
    ...options,
  });
}

/**
 * Hook to fetch assignments for a specific teacher.
 */
export function useTeacherAssignments(teacherId, options = {}) {
  return useQuery({
    queryKey: ['teacher-assignments', teacherId],
    queryFn: () => fetchTeacherAssignments(teacherId),
    enabled: Boolean(teacherId),
    staleTime: 60 * 1000,
    ...options,
  });
}

/**
 * Hook to create a teacher.
 */
export function useCreateTeacher() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload) => createTeacher(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      toast.success(
        data?.invitation?.sent
          ? 'Teacher registered and invitation email sent successfully'
          : 'Teacher registered successfully'
      );
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

/**
 * Hook to update an existing teacher.
 */
export function useUpdateTeacher(id) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload) => updateTeacher(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      queryClient.invalidateQueries({ queryKey: ['teacher', id] });
      toast.success('Teacher updated successfully');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

/**
 * Hook to soft-delete a teacher.
 */
export function useDeleteTeacher() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id) => deleteTeacher(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      toast.success('Teacher removed successfully');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

/**
 * Hook to upload teacher avatar.
 */
export function useUploadTeacherAvatar() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (file) => uploadTeacherAvatar(file),
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}
