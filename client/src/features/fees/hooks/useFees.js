import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchFeeCategories,
  createFeeCategory,
  fetchFeeStructures,
  createFeeStructure,
  fetchFeeConcessions,
  createFeeConcession,
  generateInvoices,
  fetchInvoices,
  fetchInvoiceById,
  recordPayment,
  fetchPayments,
  fetchFeeDefaulters,
  fetchFinancialSummary,
} from '../api/fees.api';
import { useToast } from '@/components/feedback';
import { getErrorMessage } from '@/lib/utils';

export function useFeeCategories(options = {}) {
  return useQuery({
    queryKey: ['fee-categories'],
    queryFn: () => fetchFeeCategories(),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

export function useCreateFeeCategory() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload) => createFeeCategory(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee-categories'] });
      toast.success('Fee category created');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

export function useFeeStructures(params = {}, options = {}) {
  return useQuery({
    queryKey: ['fee-structures', params],
    queryFn: () => fetchFeeStructures(params),
    staleTime: 2 * 60 * 1000,
    ...options,
  });
}

export function useCreateFeeStructure() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload) => createFeeStructure(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee-structures'] });
      toast.success('Fee structure created');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

export function useFeeConcessions(options = {}) {
  return useQuery({
    queryKey: ['fee-concessions'],
    queryFn: () => fetchFeeConcessions(),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

export function useCreateFeeConcession() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload) => createFeeConcession(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee-concessions'] });
      toast.success('Fee concession policy created');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

export function useGenerateInvoices() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload) => generateInvoices(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['fee-invoices'] });
      queryClient.invalidateQueries({ queryKey: ['fee-financial-summary'] });
      queryClient.invalidateQueries({ queryKey: ['fee-defaulters'] });
      toast.success(`Generated ${data?.count || 1} fee invoice(s) successfully`);
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

export function useInvoices(params = {}, options = {}) {
  return useQuery({
    queryKey: ['fee-invoices', params],
    queryFn: () => fetchInvoices(params),
    staleTime: 60 * 1000,
    ...options,
  });
}

export function useInvoice(id, options = {}) {
  return useQuery({
    queryKey: ['fee-invoices', id],
    queryFn: () => fetchInvoiceById(id),
    enabled: Boolean(id),
    staleTime: 60 * 1000,
    ...options,
  });
}

export function useRecordPayment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload) => recordPayment(payload),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['fee-invoices'] });
      queryClient.invalidateQueries({ queryKey: ['fee-invoices', vars.invoiceId] });
      queryClient.invalidateQueries({ queryKey: ['fee-payments'] });
      queryClient.invalidateQueries({ queryKey: ['fee-financial-summary'] });
      queryClient.invalidateQueries({ queryKey: ['fee-defaulters'] });
      toast.success('Payment recorded successfully');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

export function usePayments(params = {}, options = {}) {
  return useQuery({
    queryKey: ['fee-payments', params],
    queryFn: () => fetchPayments(params),
    staleTime: 60 * 1000,
    ...options,
  });
}

export function useFeeDefaulters(options = {}) {
  return useQuery({
    queryKey: ['fee-defaulters'],
    queryFn: () => fetchFeeDefaulters(),
    staleTime: 2 * 60 * 1000,
    ...options,
  });
}

export function useFinancialSummary(options = {}) {
  return useQuery({
    queryKey: ['fee-financial-summary'],
    queryFn: () => fetchFinancialSummary(),
    staleTime: 2 * 60 * 1000,
    ...options,
  });
}
