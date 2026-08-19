import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@/components/feedback';
import { FeesDashboardPage } from '../pages/FeesDashboardPage';
import * as feeApi from '../api/fees.api';
import * as authContextModule from '@/features/auth/auth.context';
import { ROLES, PERMISSIONS } from '@/constants';

vi.mock('../api/fees.api', () => ({
  fetchFeeCategories: vi.fn().mockResolvedValue([]),
  createFeeCategory: vi.fn(),
  fetchFeeStructures: vi.fn().mockResolvedValue([]),
  createFeeStructure: vi.fn(),
  fetchFeeConcessions: vi.fn().mockResolvedValue([]),
  createFeeConcession: vi.fn(),
  generateInvoices: vi.fn(),
  fetchInvoices: vi.fn(),
  fetchInvoiceById: vi.fn(),
  recordPayment: vi.fn(),
  fetchPayments: vi.fn().mockResolvedValue({ payments: [], pagination: { page: 1, total: 0 } }),
  fetchFeeDefaulters: vi.fn(),
  fetchFinancialSummary: vi.fn(),
}));

const renderWithProviders = (ui) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <MemoryRouter>{ui}</MemoryRouter>
      </ToastProvider>
    </QueryClientProvider>
  );
};

describe('FeesDashboardPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(authContextModule, 'useAuth').mockReturnValue({
      user: {
        id: 'u1',
        role: ROLES.SCHOOL_ADMIN,
        permissions: [
          PERMISSIONS.FEES_READ,
          PERMISSIONS.FEES_CREATE,
          PERMISSIONS.FEES_MANAGE,
          PERMISSIONS.PAYMENTS_CREATE,
        ],
      },
      isAuthenticated: true,
      isLoading: false,
    });

    feeApi.fetchFinancialSummary.mockResolvedValue({
      summary: {
        totalInvoiced: 75000,
        totalPaid: 50000,
        totalOutstanding: 25000,
      },
    });

    feeApi.fetchFeeDefaulters.mockResolvedValue([
      {
        _id: 'def1',
        id: 'def1',
        invoiceNumber: 'INV-2026-00099',
        studentId: { _id: 's1', firstName: 'John', lastName: 'Doe' },
        classId: { _id: 'c1', name: 'Grade 10' },
        balanceAmount: 1200,
        dueDate: '2026-08-01T00:00:00.000Z',
      },
    ]);

    feeApi.fetchInvoices.mockResolvedValue({
      invoices: [
        {
          _id: 'inv1',
          id: 'inv1',
          invoiceNumber: 'INV-2026-00001',
          title: 'Term 1 Tuition Fee',
          studentId: { _id: 's1', firstName: 'John', lastName: 'Doe' },
          classId: { _id: 'c1', name: 'Grade 10' },
          totalAmount: 2000,
          balanceAmount: 500,
          status: 'PARTIALLY_PAID',
          dueDate: '2026-10-31T00:00:00.000Z',
        },
      ],
      pagination: { page: 1, limit: 15, total: 1, totalPages: 1 },
    });
  });

  it('should render fees dashboard, financial cards, invoices table, and switch to defaulters tab', async () => {
    renderWithProviders(<FeesDashboardPage />);

    expect(await screen.findByText('Fee Management & Accounts')).toBeInTheDocument();
    expect(await screen.findByText('₨75,000')).toBeInTheDocument(); // Total Invoiced
    expect(screen.getByText('₨50,000')).toBeInTheDocument(); // Total Collected
    expect(screen.getByText('₨25,000')).toBeInTheDocument(); // Total Outstanding

    // Invoices list item
    expect(await screen.findByText('INV-2026-00001')).toBeInTheDocument();
    expect(screen.getByText('Term 1 Tuition Fee')).toBeInTheDocument();

    // Switch to Defaulters Tab
    const defaultersTab = screen.getByText(/Overdue Defaulters/i);
    fireEvent.click(defaultersTab);

    expect(await screen.findByText('INV-2026-00099')).toBeInTheDocument();
    expect(screen.getByText('₨1,200')).toBeInTheDocument();
  });
});
