import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchAcademicSessions,
  fetchAcademicSessionById,
  createAcademicSession,
  updateAcademicSession,
  changeAcademicSessionStatus,
  setAcademicSessionCurrent,
  deleteAcademicSession,
  fetchClasses,
  fetchClassById,
  createClass,
  updateClass,
  deleteClass,
  fetchSections,
  fetchSectionById,
  createSection,
  updateSection,
  deleteSection,
  fetchSubjects,
  fetchSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
  fetchTeacherAssignments,
  createTeacherAssignment,
  deleteTeacherAssignment,
} from '../api/academics.api';
import { useToast } from '@/components/feedback';
import { getErrorMessage } from '@/lib/utils';

/* ── Academic Sessions Hooks ── */

export function useAcademicSessions(params = {}, options = {}) {
  return useQuery({
    queryKey: ['academic-sessions', params],
    queryFn: () => fetchAcademicSessions(params),
    staleTime: 60 * 1000,
    ...options,
  });
}

export function useAcademicSession(id, options = {}) {
  return useQuery({
    queryKey: ['academic-session', id],
    queryFn: () => fetchAcademicSessionById(id),
    enabled: Boolean(id),
    staleTime: 60 * 1000,
    ...options,
  });
}

export function useCreateAcademicSession() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload) => createAcademicSession(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-sessions'] });
      toast.success('Academic session created successfully');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

export function useUpdateAcademicSession(id) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload) => updateAcademicSession(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['academic-session', id] });
      toast.success('Academic session updated successfully');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

export function useSetCurrentSession() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id) => setAcademicSessionCurrent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-sessions'] });
      toast.success('Active session updated successfully');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

export function useChangeSessionStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, status }) => changeAcademicSessionStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-sessions'] });
      toast.success('Session status updated');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

export function useDeleteAcademicSession() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id) => deleteAcademicSession(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-sessions'] });
      toast.success('Academic session deleted');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

/* ── Classes Hooks ── */

export function useClasses(params = {}, options = {}) {
  return useQuery({
    queryKey: ['classes', params],
    queryFn: () => fetchClasses(params),
    staleTime: 60 * 1000,
    ...options,
  });
}

export function useClass(id, options = {}) {
  return useQuery({
    queryKey: ['class', id],
    queryFn: () => fetchClassById(id),
    enabled: Boolean(id),
    staleTime: 60 * 1000,
    ...options,
  });
}

export function useCreateClass() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload) => createClass(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      toast.success('Class created successfully');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

export function useUpdateClass(id) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload) => updateClass(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      queryClient.invalidateQueries({ queryKey: ['class', id] });
      toast.success('Class updated successfully');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

export function useDeleteClass() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id) => deleteClass(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      toast.success('Class deleted');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

/* ── Sections Hooks ── */

export function useSections(params = {}, options = {}) {
  return useQuery({
    queryKey: ['sections', params],
    queryFn: () => fetchSections(params),
    staleTime: 60 * 1000,
    ...options,
  });
}

export function useSection(id, options = {}) {
  return useQuery({
    queryKey: ['section', id],
    queryFn: () => fetchSectionById(id),
    enabled: Boolean(id),
    staleTime: 60 * 1000,
    ...options,
  });
}

export function useCreateSection() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload) => createSection(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections'] });
      toast.success('Section created successfully');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

export function useUpdateSection(id) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload) => updateSection(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections'] });
      queryClient.invalidateQueries({ queryKey: ['section', id] });
      toast.success('Section updated successfully');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

export function useDeleteSection() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id) => deleteSection(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections'] });
      toast.success('Section deleted');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

/* ── Subjects Hooks ── */

export function useSubjects(params = {}, options = {}) {
  return useQuery({
    queryKey: ['subjects', params],
    queryFn: () => fetchSubjects(params),
    staleTime: 60 * 1000,
    ...options,
  });
}

export function useSubject(id, options = {}) {
  return useQuery({
    queryKey: ['subject', id],
    queryFn: () => fetchSubjectById(id),
    enabled: Boolean(id),
    staleTime: 60 * 1000,
    ...options,
  });
}

export function useCreateSubject() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload) => createSubject(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      toast.success('Subject created successfully');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

export function useUpdateSubject(id) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload) => updateSubject(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      queryClient.invalidateQueries({ queryKey: ['subject', id] });
      toast.success('Subject updated successfully');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

export function useDeleteSubject() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id) => deleteSubject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      toast.success('Subject deleted');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

/* ── Teacher Assignments Hooks ── */

export function useTeacherAssignmentsList(params = {}, options = {}) {
  return useQuery({
    queryKey: ['teacher-assignments-list', params],
    queryFn: () => fetchTeacherAssignments(params),
    staleTime: 60 * 1000,
    ...options,
  });
}

export function useCreateTeacherAssignment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload) => createTeacherAssignment(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-assignments-list'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-assignments'] });
      toast.success('Teacher assigned successfully');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

export function useDeleteTeacherAssignment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id) => deleteTeacherAssignment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-assignments-list'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-assignments'] });
      toast.success('Assignment removed successfully');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}
