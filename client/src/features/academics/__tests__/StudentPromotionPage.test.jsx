import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@/components/feedback';
import { StudentPromotionPage } from '../pages/StudentPromotionPage';
import * as academicsApi from '../api/academics.api';
import * as promotionsApi from '../api/promotions.api';
import * as authContextModule from '@/features/auth/auth.context';
import { ROLES, PERMISSIONS } from '@/constants';

vi.mock('../api/academics.api', () => ({
  fetchAcademicSessions: vi.fn().mockResolvedValue({
    sessions: [
      { id: 'sess1', name: '2026-2027', status: 'ACTIVE', isCurrent: true },
      { id: 'sess2', name: '2027-2028', status: 'UPCOMING', isCurrent: false },
    ],
    pagination: { page: 1, total: 2 },
  }),
  fetchClasses: vi.fn().mockResolvedValue({
    classes: [
      { id: 'c1', name: 'Class 7', code: 'C7' },
      { id: 'c2', name: 'Class 8', code: 'C8' },
    ],
    pagination: { page: 1, total: 2 },
  }),
  fetchSections: vi.fn().mockResolvedValue({
    sections: [
      { id: 's1', name: 'Section A', code: 'A', capacity: 40 },
      { id: 's2', name: 'Section B', code: 'B', capacity: 40 },
    ],
    pagination: { page: 1, total: 2 },
  }),
}));

vi.mock('../api/promotions.api', () => ({
  fetchPromotionPreview: vi.fn().mockResolvedValue({
    sourceSession: { id: 'sess1', name: '2026-2027' },
    destinationSession: { id: 'sess2', name: '2027-2028' },
    sourceClass: { id: 'c1', name: 'Class 7' },
    sourceSection: { id: 's1', name: 'Section A' },
    destinationClass: { id: 'c2', name: 'Class 8' },
    destinationSection: { id: 's1', name: 'Section A', capacity: 40, currentEnrolled: 0 },
    totalCandidates: 2,
    candidates: [
      {
        studentId: 'st1',
        admissionNumber: 'ADM-001',
        firstName: 'Ahmed',
        lastName: 'Khan',
        currentRollNumber: '01',
        resultsSummary: { hasResults: true, averagePercentage: 85, suggestedStatus: 'PROMOTED' },
        warnings: [],
      },
      {
        studentId: 'st2',
        admissionNumber: 'ADM-002',
        firstName: 'Bilal',
        lastName: 'Ahmed',
        currentRollNumber: '02',
        resultsSummary: { hasResults: true, averagePercentage: 35, suggestedStatus: 'RETAINED' },
        warnings: [],
      },
    ],
  }),
  executeBulkPromotion: vi.fn().mockResolvedValue({
    batchId: 'batch-test-123',
    totalProcessed: 2,
    counts: { promoted: 1, retained: 1, graduated: 0 },
  }),
  fetchPromotionHistory: vi.fn().mockResolvedValue({
    history: [],
    pagination: { page: 1, total: 0, totalPages: 1 },
  }),
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

describe('StudentPromotionPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(authContextModule, 'useAuth').mockReturnValue({
      user: {
        id: 'admin1',
        role: ROLES.SCHOOL_ADMIN,
        permissions: [
          PERMISSIONS.PROMOTIONS_READ,
          PERMISSIONS.PROMOTIONS_CREATE,
          PERMISSIONS.ACADEMIC_SESSIONS_READ,
          PERMISSIONS.CLASSES_READ,
          PERMISSIONS.SECTIONS_READ,
        ],
      },
      isAuthenticated: true,
      isLoading: false,
    });
  });

  it('should render the Promotion page with tabs and context selectors', async () => {
    renderWithProviders(<StudentPromotionPage />);

    expect(screen.getByText('Student Academic Promotion System')).toBeInTheDocument();
    expect(screen.getByText('Promote Cohort')).toBeInTheDocument();
    expect(screen.getByText('Promotion Audit History')).toBeInTheDocument();
    expect(screen.getByText('1. Select Academic Session & Cohort')).toBeInTheDocument();
  });
});
