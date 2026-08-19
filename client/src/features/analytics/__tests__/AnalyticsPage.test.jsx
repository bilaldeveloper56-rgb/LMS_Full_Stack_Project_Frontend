import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@/components/feedback';
import { AnalyticsPage } from '../pages/AnalyticsPage';
import * as analyticsApi from '../api/analytics.api';
import * as authContextModule from '@/features/auth/auth.context';
import { ROLES, PERMISSIONS } from '@/constants';

vi.mock('../api/analytics.api', () => ({
  fetchSchoolAnalytics: vi.fn(),
  fetchPlatformAnalytics: vi.fn(),
}));

vi.mock('@/features/academics', () => ({
  useAcademicSessions: () => ({ data: [{ _id: 'sess1', name: '2026-2027' }], isLoading: false }),
  useClasses: () => ({ data: [{ _id: 'c1', name: 'Grade 10' }], isLoading: false }),
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

describe('AnalyticsPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(authContextModule, 'useAuth').mockReturnValue({
      user: {
        id: 'u1',
        role: ROLES.SCHOOL_ADMIN,
        permissions: [PERMISSIONS.REPORTS_READ],
      },
      isAuthenticated: true,
      isLoading: false,
    });

    analyticsApi.fetchSchoolAnalytics.mockResolvedValue({
      demographics: {
        totalStudents: 150,
        activeStudents: 145,
        maleStudents: 80,
        femaleStudents: 65,
        otherStudents: 0,
      },
      academicStructure: {
        totalTeachers: 10,
        totalClasses: 6,
        totalSections: 12,
        studentTeacherRatio: 14.5,
      },
      attendance: {
        PRESENT: 1200,
        ABSENT: 50,
        LATE: 30,
        totalRecords: 1280,
        attendanceRatePercentage: 93.75,
      },
      financials: {
        totalInvoiced: 50000,
        totalPaid: 45000,
        totalBalance: 5000,
        totalInvoices: 100,
        paidInvoices: 90,
        unpaidInvoices: 10,
        partiallyPaidInvoices: 0,
        collectionRatePercentage: 90.0,
      },
      academic: {
        totalAssignments: 25,
        totalSubmissions: 240,
        totalResultsPublished: 150,
        passRatePercentage: 93.33,
        averageGradePercentage: 82.5,
        averageGpa: 3.45,
      },
    });
  });

  it('should render executive analytics KPIs, demographic bars, and attendance metrics', async () => {
    renderWithProviders(<AnalyticsPage />);

    expect(await screen.findByText('Executive Analytics & Institutional BI')).toBeInTheDocument();
    expect(await screen.findByText('Active Students')).toBeInTheDocument();
    expect(screen.getByText('145')).toBeInTheDocument();
    expect(screen.getByText('14.5:1')).toBeInTheDocument();
    expect(screen.getAllByText('93.75%').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('90%').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('93.33%').length).toBeGreaterThanOrEqual(1);

    const refreshBtn = screen.getByRole('button', { name: /Refresh Data/i });
    fireEvent.click(refreshBtn);
    expect(analyticsApi.fetchSchoolAnalytics).toHaveBeenCalled();
  });
});
