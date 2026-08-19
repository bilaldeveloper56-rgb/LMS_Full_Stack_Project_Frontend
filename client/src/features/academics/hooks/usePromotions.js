import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchPromotionPreview,
  executeBulkPromotion,
  fetchPromotionHistory,
} from '../api/promotions.api';
import { useToast } from '@/components/feedback';
import { getErrorMessage } from '@/lib/utils';

export function usePromotionPreview(payload, options = {}) {
  const isEnabled = Boolean(
    payload?.sourceAcademicSessionId &&
    payload?.destinationAcademicSessionId &&
    payload?.sourceClassId &&
    payload?.sourceSectionId &&
    payload.sourceAcademicSessionId !== payload.destinationAcademicSessionId
  );

  return useQuery({
    queryKey: ['promotion-preview', payload],
    queryFn: () => fetchPromotionPreview(payload),
    enabled: isEnabled,
    staleTime: 30 * 1000,
    ...options,
  });
}

export function useExecuteBulkPromotion() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload) => executeBulkPromotion(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['promotion-preview'] });
      queryClient.invalidateQueries({ queryKey: ['promotion-history'] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      toast({
        title: 'Promotion Completed',
        description: `Successfully processed ${data.totalProcessed || 0} student(s) in batch ${data.batchId?.slice(0, 8)}...`,
        variant: 'success',
      });
    },
    onError: (error) => {
      toast({
        title: 'Promotion Failed',
        description: getErrorMessage(error, 'Could not complete student promotion'),
        variant: 'danger',
      });
    },
  });
}

export function usePromotionHistory(params = {}, options = {}) {
  return useQuery({
    queryKey: ['promotion-history', params],
    queryFn: () => fetchPromotionHistory(params),
    staleTime: 60 * 1000,
    ...options,
  });
}
