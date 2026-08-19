import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchNotices,
  fetchNoticeById,
  createNotice,
  updateNotice,
  deleteNotice,
  publishNotice,
} from '../api/notices.api';
import { useToast } from '@/components/feedback';
import { getErrorMessage } from '@/lib/utils';

export function useNotices(params = {}, options = {}) {
  return useQuery({
    queryKey: ['notices', params],
    queryFn: () => fetchNotices(params),
    staleTime: 60 * 1000,
    ...options,
  });
}

export function useNotice(id, options = {}) {
  return useQuery({
    queryKey: ['notices', id],
    queryFn: () => fetchNoticeById(id),
    enabled: Boolean(id),
    staleTime: 60 * 1000,
    ...options,
  });
}

export function useCreateNotice() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload) => createNotice(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notices'] });
      toast.success('Notice announcement created successfully');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

export function useUpdateNotice() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, payload }) => updateNotice(id, payload),
    onSuccess: (data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['notices'] });
      queryClient.invalidateQueries({ queryKey: ['notices', vars.id] });
      toast.success('Notice updated successfully');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

export function useDeleteNotice() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id) => deleteNotice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notices'] });
      toast.success('Notice deleted');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

export function usePublishNotice() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id) => publishNotice(id),
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: ['notices'] });
      queryClient.invalidateQueries({ queryKey: ['notices', id] });
      toast.success('Notice published to target audience');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}
