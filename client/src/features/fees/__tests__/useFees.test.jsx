import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@/components/feedback';
import {
  useFeeCategories,
  useCreateFeeCategory,
  useInvoices,
  useGenerateInvoices,
  useRecordPayment,
  useFinancialSummary,
} from '../hooks/useFees';
import * as feeApi from '../api/fees.api';

vi.mock('../api/fees.api', () => ({
  fetchFeeCategories: vi.fn(),
  createFeeCategory: vi.fn(),
  fetchFeeStructures: vi.fn(),
  createFeeStructure: vi.fn(),
  fetchFeeConcessions: vi.fn(),
  createFeeConcession: vi.fn(),
  generateInvoices: vi.fn(),
  fetchInvoices: vi.fn(),
  fetchInvoiceById: vi.fn(),
  recordPayment: vi.fn(),
  fetchPayments: vi.fn(),
  fetchFeeDefaulters: vi.fn(),
  fetchFinancialSummary: vi.fn(),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>{children}</ToastProvider>
    </QueryClientProvider>
  );
};

describe('useFees React Query Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('useFeeCategories, useInvoices, and useFinancialSummary should fetch data', async () => {
    feeApi.fetchFeeCategories.mockResolvedValue([{ id: 'c1', name: 'Tuition' }]);
    feeApi.fetchInvoices.mockResolvedValue({
      invoices: [{ id: 'inv1', invoiceNumber: 'INV-001' }],
      pagination: { page: 1, total: 1 },
    });
    feeApi.fetchFinancialSummary.mockResolvedValue({
      summary: { totalInvoiced: 10000, totalPaid: 8000 },
    });

    const { result: catHook } = renderHook(() => useFeeCategories(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(catHook.current.isSuccess).toBe(true));
    expect(catHook.current.data).toHaveLength(1);

    const { result: invHook } = renderHook(() => useInvoices(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(invHook.current.isSuccess).toBe(true));
    expect(invHook.current.data.invoices).toHaveLength(1);

    const { result: sumHook } = renderHook(() => useFinancialSummary(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(sumHook.current.isSuccess).toBe(true));
    expect(sumHook.current.data.summary.totalInvoiced).toBe(10000);
  });

  it('useCreateFeeCategory, useGenerateInvoices, and useRecordPayment should trigger mutations', async () => {
    feeApi.createFeeCategory.mockResolvedValue({ id: 'c1' });
    feeApi.generateInvoices.mockResolvedValue({ count: 5 });
    feeApi.recordPayment.mockResolvedValue({ payment: { id: 'p1' } });

    const { result: createCatHook } = renderHook(() => useCreateFeeCategory(), {
      wrapper: createWrapper(),
    });
    await createCatHook.current.mutateAsync({ name: 'Lab Fee' });
    expect(feeApi.createFeeCategory).toHaveBeenCalledWith({ name: 'Lab Fee' });

    const { result: genHook } = renderHook(() => useGenerateInvoices(), {
      wrapper: createWrapper(),
    });
    await genHook.current.mutateAsync({ title: 'Nov Fee' });
    expect(feeApi.generateInvoices).toHaveBeenCalled();

    const { result: payHook } = renderHook(() => useRecordPayment(), {
      wrapper: createWrapper(),
    });
    await payHook.current.mutateAsync({ invoiceId: 'inv1', amountPaid: 100 });
    expect(feeApi.recordPayment).toHaveBeenCalledWith({ invoiceId: 'inv1', amountPaid: 100 });
  });
});
