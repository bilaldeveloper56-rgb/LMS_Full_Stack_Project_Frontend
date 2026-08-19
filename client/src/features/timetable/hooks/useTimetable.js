import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchTimetableSlots,
  fetchSectionTimetable,
  fetchTeacherTimetable,
  fetchTimetableById,
  createTimetableSlot,
  updateTimetableSlot,
  deleteTimetableSlot,
} from '../api/timetable.api';
import { useToast } from '@/components/feedback';
import { getErrorMessage } from '@/lib/utils';

export function useTimetableSlots(params = {}, options = {}) {
  return useQuery({
    queryKey: ['timetable-slots', params],
    queryFn: () => fetchTimetableSlots(params),
    staleTime: 60 * 1000,
    ...options,
  });
}

export function useSectionTimetable(sectionId, options = {}) {
  return useQuery({
    queryKey: ['section-timetable', sectionId],
    queryFn: () => fetchSectionTimetable(sectionId),
    enabled: Boolean(sectionId),
    staleTime: 60 * 1000,
    ...options,
  });
}

export function useTeacherTimetable(teacherId, options = {}) {
  return useQuery({
    queryKey: ['teacher-timetable', teacherId],
    queryFn: () => fetchTeacherTimetable(teacherId),
    enabled: Boolean(teacherId),
    staleTime: 60 * 1000,
    ...options,
  });
}

export function useTimetableSlot(id, options = {}) {
  return useQuery({
    queryKey: ['timetable-slot', id],
    queryFn: () => fetchTimetableById(id),
    enabled: Boolean(id),
    staleTime: 60 * 1000,
    ...options,
  });
}

export function useCreateTimetableSlot() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload) => createTimetableSlot(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetable-slots'] });
      queryClient.invalidateQueries({ queryKey: ['section-timetable'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-timetable'] });
      toast.success('Timetable period scheduled successfully');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

export function useUpdateTimetableSlot(id) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload) => updateTimetableSlot(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetable-slots'] });
      queryClient.invalidateQueries({ queryKey: ['section-timetable'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-timetable'] });
      queryClient.invalidateQueries({ queryKey: ['timetable-slot', id] });
      toast.success('Timetable period updated');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

export function useDeleteTimetableSlot() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id) => deleteTimetableSlot(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetable-slots'] });
      queryClient.invalidateQueries({ queryKey: ['section-timetable'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-timetable'] });
      toast.success('Timetable period removed');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}
