import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from '@/config/api';
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

vi.mock('@/config/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('Fees API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetchFeeCategories and createFeeCategory should call /fees/categories', async () => {
    api.get.mockResolvedValueOnce({
      data: {
        success: true,
        data: { categories: [{ id: 'cat1', name: 'Tuition' }] },
      },
    });

    const categories = await fetchFeeCategories();
    expect(api.get).toHaveBeenCalledWith('/fees/categories');
    expect(categories).toHaveLength(1);

    api.post.mockResolvedValueOnce({
      data: {
        success: true,
        data: { category: { id: 'cat1', name: 'Tuition' } },
      },
    });

    const created = await createFeeCategory({ name: 'Tuition' });
    expect(api.post).toHaveBeenCalledWith('/fees/categories', { name: 'Tuition' });
    expect(created.id).toBe('cat1');
  });

  it('generateInvoices, fetchInvoices, and fetchInvoiceById should call invoice endpoints', async () => {
    api.post.mockResolvedValueOnce({
      data: {
        success: true,
        data: { invoices: [{ id: 'inv1' }], count: 1 },
      },
    });

    const genRes = await generateInvoices({ title: 'Oct Tuition' });
    expect(api.post).toHaveBeenCalledWith('/fees/invoices/generate', { title: 'Oct Tuition' });
    expect(genRes.count).toBe(1);

    api.get.mockResolvedValueOnce({
      data: {
        success: true,
        data: [{ id: 'inv1', invoiceNumber: 'INV-001' }],
        pagination: { page: 1, total: 1 },
      },
    });

    const listRes = await fetchInvoices({ page: 1 });
    expect(api.get).toHaveBeenCalledWith('/fees/invoices', { params: { page: 1 } });
    expect(listRes.invoices).toHaveLength(1);

    api.get.mockResolvedValueOnce({
      data: {
        success: true,
        data: { invoice: { id: 'inv1', invoiceNumber: 'INV-001' } },
      },
    });

    const singleInv = await fetchInvoiceById('inv1');
    expect(api.get).toHaveBeenCalledWith('/fees/invoices/inv1');
    expect(singleInv.invoiceNumber).toBe('INV-001');
  });

  it('recordPayment and fetchPayments should call payments endpoints', async () => {
    api.post.mockResolvedValueOnce({
      data: {
        success: true,
        data: { payment: { id: 'pay1', amountPaid: 500 }, invoice: { id: 'inv1', balanceAmount: 0 } },
      },
    });

    const payRes = await recordPayment({ invoiceId: 'inv1', amountPaid: 500 });
    expect(api.post).toHaveBeenCalledWith('/fees/payments', { invoiceId: 'inv1', amountPaid: 500 });
    expect(payRes.payment.amountPaid).toBe(500);

    api.get.mockResolvedValueOnce({
      data: {
        success: true,
        data: [{ id: 'pay1', amountPaid: 500 }],
        pagination: { page: 1, total: 1 },
      },
    });

    const listPay = await fetchPayments({ page: 1 });
    expect(api.get).toHaveBeenCalledWith('/fees/payments', { params: { page: 1 } });
    expect(listPay.payments).toHaveLength(1);
  });

  it('fetchFeeDefaulters and fetchFinancialSummary should call reports endpoints', async () => {
    api.get.mockResolvedValueOnce({
      data: {
        success: true,
        data: { defaulters: [{ id: 'inv1', balanceAmount: 1000 }] },
      },
    });

    const defaulters = await fetchFeeDefaulters();
    expect(api.get).toHaveBeenCalledWith('/fees/defaulters');
    expect(defaulters).toHaveLength(1);

    api.get.mockResolvedValueOnce({
      data: {
        success: true,
        data: { summary: { totalInvoiced: 50000, totalPaid: 40000 } },
      },
    });

    const summaryRes = await fetchFinancialSummary();
    expect(api.get).toHaveBeenCalledWith('/fees/reports/summary');
    expect(summaryRes.summary.totalInvoiced).toBe(50000);
  });
});
