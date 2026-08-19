import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchParents,
  fetchParentById,
  fetchParentChildren,
  createParent,
  updateParent,
  deleteParent,
  linkStudentParent,
  unlinkStudentParent,
} from '../api/parents.api';
import { useToast } from '@/components/feedback';
import { getErrorMessage } from '@/lib/utils';

/**
 * Hook to fetch paginated parents with search.
 */
export function useParents(params = {}, options = {}) {
  return useQuery({
    queryKey: ['parents', params],
    queryFn: () => fetchParents(params),
    staleTime: 60 * 1000,
    ...options,
  });
}

/**
 * Hook to fetch a single parent by ID.
 */
export function useParent(id, options = {}) {
  return useQuery({
    queryKey: ['parent', id],
    queryFn: () => fetchParentById(id),
    enabled: Boolean(id),
    staleTime: 60 * 1000,
    ...options,
  });
}

/**
 * Hook to fetch linked children for a parent.
 */
export function useParentChildren(id, options = {}) {
  return useQuery({
    queryKey: ['parent-children', id],
    queryFn: () => fetchParentChildren(id),
    enabled: Boolean(id),
    staleTime: 60 * 1000,
    ...options,
  });
}

/**
 * Hook to create a parent.
 */
export function useCreateParent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload) => createParent(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parents'] });
      toast.success('Parent / Guardian registered successfully');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

/**
 * Hook to update an existing parent.
 */
export function useUpdateParent(id) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload) => updateParent(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parents'] });
      queryClient.invalidateQueries({ queryKey: ['parent', id] });
      toast.success('Parent details updated successfully');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

/**
 * Hook to soft-delete a parent.
 */
export function useDeleteParent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id) => deleteParent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parents'] });
      toast.success('Parent record removed successfully');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

/**
 * Hook to link a student child to a parent.
 */
export function useLinkChild(parentId) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload) => linkStudentParent({ ...payload, parentId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parent-children', parentId] });
      queryClient.invalidateQueries({ queryKey: ['student-profile'] });
      toast.success('Student linked to parent successfully');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

/**
 * Hook to unlink/remove student-parent relationship.
 */
export function useUnlinkChild(parentId) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (linkId) => unlinkStudentParent(linkId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parent-children', parentId] });
      queryClient.invalidateQueries({ queryKey: ['student-profile'] });
      toast.success('Student unlinked successfully');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}
