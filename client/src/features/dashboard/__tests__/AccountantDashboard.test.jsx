import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AccountantDashboard } from '../pages/AccountantDashboard';
import * as dashboardApi from '../api/dashboard.api';

vi.mock('../api/dashboard.api', () => ({
  fetchSchoolAnalytics: vi.fn(),
}));

const renderWithQuery = (ui) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>
  );
};

describe('AccountantDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render financial collection KPIs and invoice breakdowns', async () => {
    const mockFinancialData = {
      financials: {
        totalInvoiced: 300000,
        totalPaid: 270000,
        totalBalance: 30000,
        totalDiscount: 5000,
        totalInvoices: 300,
        paidInvoices: 260,
        unpaidInvoices: 25,
        partiallyPaidInvoices: 15,
        collectionRatePercentage: 90.0,
      },
    };

    dashboardApi.fetchSchoolAnalytics.mockResolvedValueOnce(mockFinancialData);

    renderWithQuery(<AccountantDashboard />);

    expect(await screen.findByText('90%')).toBeInTheDocument(); // Wait for data to render
    expect(screen.getByText('Financial & Accounts Dashboard')).toBeInTheDocument();
    expect(screen.getByText('260')).toBeInTheDocument(); // Fully Paid
    expect(screen.getByText('15')).toBeInTheDocument(); // Partially Paid
    expect(screen.getByText('25')).toBeInTheDocument(); // Unpaid
    expect(screen.getByText('Manage Fees')).toBeInTheDocument();
  });
});
