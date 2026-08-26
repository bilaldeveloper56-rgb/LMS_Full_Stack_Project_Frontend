import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchSchools,
  fetchSchoolStats,
  fetchSchoolById,
  fetchMySchool,
  createSchool,
  updateSchool,
  changeSchoolStatus,
  resendAdminInvitation,
  acceptInvitation,
  deleteSchool,
} from '../api/schools.api';
import { useToast } from '@/components/feedback';
import { getErrorMessage } from '@/lib/utils';

export function useSchools(params = {}, options = {}) {
  return useQuery({
    queryKey: ['schools', params],
    queryFn: () => fetchSchools(params),
    staleTime: 60 * 1000,
    ...options,
  });
}

export function useSchoolStats(options = {}) {
  return useQuery({
    queryKey: ['schools', 'stats'],
    queryFn: () => fetchSchoolStats(),
    staleTime: 60 * 1000,
    ...options,
  });
}

export function useSchool(id, options = {}) {
  return useQuery({
    queryKey: ['schools', id],
    queryFn: () => fetchSchoolById(id),
    enabled: Boolean(id),
    staleTime: 60 * 1000,
    ...options,
  });
}

export function useMySchool(options = {}) {
  return useQuery({
    queryKey: ['schools', 'my-school'],
    queryFn: () => fetchMySchool(),
    staleTime: 60 * 1000,
    ...options,
  });
}

export function useCreateSchool() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload) => createSchool(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['schools'] });
      const invite = data?.invitation;
      if (invite && !invite.sent) {
        toast.warning('School created successfully. Invitation email could not be delivered.');
      } else {
        toast.success('School created successfully. Invitation email sent successfully.');
      }
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

export function useUpdateSchool() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, payload }) => updateSchool(id, payload),
    onSuccess: (data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['schools'] });
      queryClient.invalidateQueries({ queryKey: ['schools', vars.id] });
      toast.success('School profile updated successfully');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

export function useChangeSchoolStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, payload }) => changeSchoolStatus(id, payload),
    onSuccess: (data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['schools'] });
      queryClient.invalidateQueries({ queryKey: ['schools', vars.id] });
      toast.success(`School status updated to ${vars.payload.status}`);
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

export function useResendAdminInvitation() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id) => resendAdminInvitation(id),
    onSuccess: (data) => {
      const invite = data?.invitation || data?.data?.invitation;
      if (invite && !invite.sent) {
        toast.warning('Invitation token refreshed, but email could not be delivered.');
      } else {
        toast.success('Administrator invitation email resent successfully.');
      }
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

export function useAcceptInvitation() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload) => acceptInvitation(payload),
    onSuccess: (data) => {
      toast.success(data?.message || 'Account activated successfully. You can now log in.');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

export function useDeleteSchool() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id) => deleteSchool(id),
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: ['schools'] });
      queryClient.invalidateQueries({ queryKey: ['schools', 'stats'] });
      queryClient.removeQueries({ queryKey: ['schools', id] });
      toast.success(data?.message || 'School deleted successfully');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}
