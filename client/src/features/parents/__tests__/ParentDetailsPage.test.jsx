import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@/components/feedback';
import { ParentDetailsPage } from '../pages/ParentDetailsPage';
import * as parentsApi from '../api/parents.api';
import * as authContextModule from '@/features/auth/auth.context';
import { ROLES, PERMISSIONS } from '@/constants';

vi.mock('../api/parents.api', () => ({
  fetchParentById: vi.fn(),
  fetchParentChildren: vi.fn(),
  deleteParent: vi.fn(),
  linkStudentParent: vi.fn(),
  unlinkStudentParent: vi.fn(),
}));

vi.mock('@/features/students/api/students.api', () => ({
  fetchStudents: vi.fn().mockResolvedValue({ students: [] }),
}));

const renderWithProviders = (initialEntry = '/parents/p1') => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <MemoryRouter initialEntries={[initialEntry]}>
          <Routes>
            <Route path="/parents/:id" element={<ParentDetailsPage />} />
            <Route path="/parents" element={<div>Parents Directory List</div>} />
          </Routes>
        </MemoryRouter>
      </ToastProvider>
    </QueryClientProvider>
  );
};

describe('ParentDetailsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(authContextModule, 'useAuth').mockReturnValue({
      user: { id: 'adm', role: ROLES.SCHOOL_ADMIN, permissions: [PERMISSIONS.PARENTS_READ, PERMISSIONS.PARENTS_UPDATE, PERMISSIONS.PARENTS_DELETE] },
      isAuthenticated: true,
      isLoading: false,
    });
  });

  it('should render parent profile and linked children', async () => {
    const mockParent = {
      _id: 'p1',
      firstName: 'Bruce',
      lastName: 'Wayne',
      email: 'bruce@wayne.com',
      phone: '555-0000',
      occupation: 'Industrialist',
    };

    const mockChildren = [
      {
        _id: 'link1',
        relationshipType: 'FATHER',
        isPrimary: true,
        student: {
          _id: 's1',
          firstName: 'Damian',
          lastName: 'Wayne',
          admissionNumber: 'ADM-ROBIN',
          classId: { name: 'Grade 9' },
          sectionId: { name: 'A' },
        },
      },
    ];

    parentsApi.fetchParentById.mockResolvedValue(mockParent);
    parentsApi.fetchParentChildren.mockResolvedValue(mockChildren);

    renderWithProviders('/parents/p1');

    expect(await screen.findByRole('heading', { level: 1, name: /Bruce Wayne/i })).toBeInTheDocument();
    expect(screen.getAllByText('Industrialist')[0]).toBeInTheDocument();
    expect(screen.getByText('Damian Wayne')).toBeInTheDocument();
    expect(screen.getByText('Adm #: ADM-ROBIN')).toBeInTheDocument();
    expect(screen.getByText('Link Student')).toBeInTheDocument();
  });

  it('should trigger unlink child confirmation and call unlinkStudentParent', async () => {
    const mockParent = {
      _id: 'p1',
      firstName: 'Bruce',
      lastName: 'Wayne',
      phone: '555-0000',
    };

    const mockChildren = [
      {
        _id: 'link1',
        relationshipType: 'FATHER',
        student: {
          _id: 's1',
          firstName: 'Damian',
          lastName: 'Wayne',
        },
      },
    ];

    parentsApi.fetchParentById.mockResolvedValue(mockParent);
    parentsApi.fetchParentChildren.mockResolvedValue(mockChildren);
    parentsApi.unlinkStudentParent.mockResolvedValue({ success: true });

    renderWithProviders('/parents/p1');

    expect(await screen.findByRole('heading', { level: 1, name: /Bruce Wayne/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Unlink Damian Wayne/i }));
    expect(screen.getByText('Confirm Student Unlinking')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Confirm Unlink/i }));

    await waitFor(() => {
      expect(parentsApi.unlinkStudentParent).toHaveBeenCalledWith('link1');
    });
  });
});
