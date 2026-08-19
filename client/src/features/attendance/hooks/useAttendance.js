import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchAttendanceList,
  fetchAttendanceById,
  fetchStudentAttendance,
  fetchSectionAttendance,
  fetchClassAttendance,
  fetchAttendanceSummaryReport,
  fetchStudentAttendanceReport,
  fetchSectionAttendanceReport,
  createAttendance,
  bulkMarkAttendance,
  updateAttendance,
  correctAttendance,
  deleteAttendance,
} from '../api/attendance.api';
import { useToast } from '@/components/feedback';
import { getErrorMessage } from '@/lib/utils';

export function useAttendanceList(params = {}, options = {}) {
  return useQuery({
    queryKey: ['attendance-list', params],
    queryFn: () => fetchAttendanceList(params),
    staleTime: 60 * 1000,
    ...options,
  });
}

export function useAttendanceRecord(id, options = {}) {
  return useQuery({
    queryKey: ['attendance-record', id],
    queryFn: () => fetchAttendanceById(id),
    enabled: Boolean(id),
    staleTime: 60 * 1000,
    ...options,
  });
}

export function useStudentAttendance(studentId, params = {}, options = {}) {
  return useQuery({
    queryKey: ['student-attendance', studentId, params],
    queryFn: () => fetchStudentAttendance(studentId, params),
    enabled: Boolean(studentId),
    staleTime: 60 * 1000,
    ...options,
  });
}

export function useSectionAttendance(sectionId, params = {}, options = {}) {
  return useQuery({
    queryKey: ['section-attendance', sectionId, params],
    queryFn: () => fetchSectionAttendance(sectionId, params),
    enabled: Boolean(sectionId),
    staleTime: 60 * 1000,
    ...options,
  });
}

export function useClassAttendance(classId, params = {}, options = {}) {
  return useQuery({
    queryKey: ['class-attendance', classId, params],
    queryFn: () => fetchClassAttendance(classId, params),
    enabled: Boolean(classId),
    staleTime: 60 * 1000,
    ...options,
  });
}

export function useAttendanceSummaryReport(params = {}, options = {}) {
  return useQuery({
    queryKey: ['attendance-summary-report', params],
    queryFn: () => fetchAttendanceSummaryReport(params),
    staleTime: 60 * 1000,
    ...options,
  });
}

export function useStudentAttendanceReport(studentId, params = {}, options = {}) {
  return useQuery({
    queryKey: ['student-attendance-report', studentId, params],
    queryFn: () => fetchStudentAttendanceReport(studentId, params),
    enabled: Boolean(studentId),
    staleTime: 60 * 1000,
    ...options,
  });
}

export function useSectionAttendanceReport(sectionId, params = {}, options = {}) {
  return useQuery({
    queryKey: ['section-attendance-report', sectionId, params],
    queryFn: () => fetchSectionAttendanceReport(sectionId, params),
    enabled: Boolean(sectionId),
    staleTime: 60 * 1000,
    ...options,
  });
}

export function useMarkAttendance() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload) => createAttendance(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance-list'] });
      queryClient.invalidateQueries({ queryKey: ['attendance-summary-report'] });
      toast.success('Attendance recorded successfully');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

export function useBulkMarkAttendance() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload) => bulkMarkAttendance(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance-list'] });
      queryClient.invalidateQueries({ queryKey: ['section-attendance'] });
      queryClient.invalidateQueries({ queryKey: ['attendance-summary-report'] });
      toast.success('Section attendance marked successfully');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

export function useUpdateAttendance(id) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload) => updateAttendance(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance-list'] });
      queryClient.invalidateQueries({ queryKey: ['attendance-record', id] });
      queryClient.invalidateQueries({ queryKey: ['attendance-summary-report'] });
      toast.success('Attendance updated successfully');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

export function useCorrectAttendance() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, ...payload }) => correctAttendance(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance-list'] });
      queryClient.invalidateQueries({ queryKey: ['attendance-summary-report'] });
      toast.success('Attendance correction submitted');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

export function useDeleteAttendance() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id) => deleteAttendance(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance-list'] });
      queryClient.invalidateQueries({ queryKey: ['attendance-summary-report'] });
      toast.success('Attendance record removed');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}
