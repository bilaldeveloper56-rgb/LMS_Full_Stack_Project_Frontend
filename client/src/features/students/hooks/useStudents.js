import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchStudents,
  fetchStudentById,
  fetchStudentProfile,
  fetchStudentAcademic,
  createStudent,
  updateStudent,
  deleteStudent,
  uploadStudentAvatar,
  fetchClasses,
  fetchSections,
  fetchAcademicSessions,
} from '../api/students.api';
import { useToast } from '@/components/feedback';
import { getErrorMessage } from '@/lib/utils';

/**
 * Hook to fetch paginated students with filters.
 */
export function useStudents(params = {}, options = {}) {
  return useQuery({
    queryKey: ['students', params],
    queryFn: () => fetchStudents(params),
    staleTime: 60 * 1000, // 1 minute
    ...options,
  });
}

/**
 * Hook to fetch a single student by ID.
 */
export function useStudent(id, options = {}) {
  return useQuery({
    queryKey: ['student', id],
    queryFn: () => fetchStudentById(id),
    enabled: Boolean(id),
    staleTime: 60 * 1000,
    ...options,
  });
}

/**
 * Hook to fetch comprehensive student profile with parents.
 */
export function useStudentProfile(id, options = {}) {
  return useQuery({
    queryKey: ['student-profile', id],
    queryFn: () => fetchStudentProfile(id),
    enabled: Boolean(id),
    staleTime: 60 * 1000,
    ...options,
  });
}

/**
 * Hook to fetch student academic record.
 */
export function useStudentAcademic(id, options = {}) {
  return useQuery({
    queryKey: ['student-academic', id],
    queryFn: () => fetchStudentAcademic(id),
    enabled: Boolean(id),
    staleTime: 60 * 1000,
    ...options,
  });
}

/**
 * Hook to fetch academic options (sessions, classes, sections) for form selects.
 */
export function useAcademicOptions(selectedSessionId = null, selectedClassId = null) {
  // Support both useAcademicOptions(sessionId, classId) and legacy useAcademicOptions(classId)
  const isSingleArg = selectedClassId === null;
  const effectiveSessionId = isSingleArg ? null : selectedSessionId;
  const effectiveClassId = isSingleArg ? selectedSessionId : selectedClassId;

  const sessionsQuery = useQuery({
    queryKey: ['academic-sessions', 'options'],
    queryFn: () => fetchAcademicSessions({ limit: 100 }),
    staleTime: 5 * 60 * 1000,
  });

  const classesQuery = useQuery({
    queryKey: ['classes', 'options', effectiveSessionId],
    queryFn: () =>
      fetchClasses(effectiveSessionId ? { academicSessionId: effectiveSessionId, limit: 100 } : { limit: 100 }),
    staleTime: 5 * 60 * 1000,
  });

  const sectionsQuery = useQuery({
    queryKey: ['sections', 'options', effectiveClassId],
    queryFn: () => fetchSections({ classId: effectiveClassId, limit: 100 }),
    enabled: Boolean(effectiveClassId),
    staleTime: 5 * 60 * 1000,
  });

  return {
    sessions: sessionsQuery.data || [],
    classes: classesQuery.data || [],
    sections: effectiveClassId ? (sectionsQuery.data || []) : [],
    isLoading: sessionsQuery.isLoading || classesQuery.isLoading,
    isLoadingSessions: sessionsQuery.isLoading,
    isLoadingClasses: classesQuery.isLoading || classesQuery.isFetching,
    isLoadingSections: Boolean(effectiveClassId) && (sectionsQuery.isLoading || sectionsQuery.isFetching),
    isSectionsError: sectionsQuery.isError,
    refetchSections: sectionsQuery.refetch,
    refetchClasses: classesQuery.refetch,
  };
}

/**
 * Hook to create a student.
 */
export function useCreateStudent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload) => createStudent(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success('Student registered successfully');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

/**
 * Hook to update an existing student.
 */
export function useUpdateStudent(id) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload) => updateStudent(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['student', id] });
      queryClient.invalidateQueries({ queryKey: ['student-profile', id] });
      queryClient.invalidateQueries({ queryKey: ['student-academic', id] });
      toast.success('Student updated successfully');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

/**
 * Hook to soft-delete a student.
 */
export function useDeleteStudent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id) => deleteStudent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success('Student removed successfully');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

/**
 * Hook to upload an avatar.
 */
export function useUploadAvatar() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (file) => uploadStudentAvatar(file),
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}
