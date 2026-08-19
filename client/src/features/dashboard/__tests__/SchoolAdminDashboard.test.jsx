import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SchoolAdminDashboard } from '../pages/SchoolAdminDashboard';
import * as dashboardApi from '../api/dashboard.api';

vi.mock('../api/dashboard.api', () => ({
  fetchSchoolAnalytics: vi.fn(),
  fetchPlatformAnalytics: vi.fn(),
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

describe('SchoolAdminDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render live institutional KPIs for demographics, attendance, financials, and LMS', async () => {
    const mockSchoolData = {
      demographics: {
        totalStudents: 1250,
        activeStudents: 1200,
        maleStudents: 600,
        femaleStudents: 600,
        otherStudents: 0,
      },
      academicStructure: {
        totalTeachers: 80,
        totalClasses: 30,
        totalSections: 60,
        studentTeacherRatio: 15,
      },
      attendance: {
        PRESENT: 1140,
        ABSENT: 60,
        totalRecords: 1200,
        attendanceRatePercentage: 95.0,
      },
      financials: {
        totalInvoiced: 500000,
        totalPaid: 425000,
        totalBalance: 75000,
        collectionRatePercentage: 85.0,
        unpaidInvoices: 40,
      },
      academic: {
        totalAssignments: 150,
        totalSubmissions: 1400,
        totalResultsPublished: 1100,
        passRatePercentage: 92.5,
        averageGradePercentage: 81.4,
        averageGpa: 3.4,
      },
    };

    dashboardApi.fetchSchoolAnalytics.mockResolvedValueOnce(mockSchoolData);

    renderWithQuery(<SchoolAdminDashboard />);

    expect(await screen.findByText('1,200')).toBeInTheDocument(); // Active Students
    expect(screen.getByText('80')).toBeInTheDocument(); // Active Faculty
    expect(screen.getByText('95%')).toBeInTheDocument(); // Attendance Rate
    expect(screen.getByText('85%')).toBeInTheDocument(); // Collection Rate
    expect(screen.getByText('92.5%')).toBeInTheDocument(); // Pass Rate
    expect(screen.getByText('Institutional Dashboard')).toBeInTheDocument();
  });

  it('should handle error state and allow retry', async () => {
    dashboardApi.fetchSchoolAnalytics.mockRejectedValueOnce(new Error('Server unavailable'));

    renderWithQuery(<SchoolAdminDashboard />);

    expect(await screen.findByText('Failed to load school analytics')).toBeInTheDocument();
    expect(screen.getByText('Server unavailable')).toBeInTheDocument();

    dashboardApi.fetchSchoolAnalytics.mockResolvedValueOnce({
      demographics: { activeStudents: 50, totalStudents: 50 },
      academicStructure: { totalTeachers: 5 },
      attendance: { attendanceRatePercentage: 90 },
      financials: { totalInvoiced: 10000, totalPaid: 9000 },
      academic: { passRatePercentage: 80 },
    });

    const retryButton = screen.getByRole('button', { name: /Try again/i });
    fireEvent.click(retryButton);

    expect(await screen.findByText('Student Enrollment & Staff')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();
  });
});
