import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { TeacherDashboard } from '../pages/TeacherDashboard';
import { StudentDashboard } from '../pages/StudentDashboard';
import { ParentDashboard } from '../pages/ParentDashboard';
import { LibrarianDashboard } from '../pages/LibrarianDashboard';
import { StaffDashboard } from '../pages/StaffDashboard';
import * as authContextModule from '@/features/auth/auth.context';
import { ROLES } from '@/constants';

describe('Role-Specific Dashboard Portals', () => {
  it('TeacherDashboard renders faculty workspace modules', () => {
    vi.spyOn(authContextModule, 'useAuth').mockReturnValue({
      user: { id: 't1', firstName: 'Jane', lastName: 'Doe', role: ROLES.TEACHER },
      isAuthenticated: true,
      isLoading: false,
    });

    render(
      <MemoryRouter>
        <TeacherDashboard />
      </MemoryRouter>
    );

    expect(screen.getByText(/Welcome back, Jane Doe/i)).toBeInTheDocument();
    expect(screen.getByText('Classes & Sections')).toBeInTheDocument();
    expect(screen.getByText('Daily Attendance')).toBeInTheDocument();
    expect(screen.getByText('Assignments & Homework')).toBeInTheDocument();
  });

  it('StudentDashboard renders student learning center modules', () => {
    vi.spyOn(authContextModule, 'useAuth').mockReturnValue({
      user: { id: 's1', firstName: 'Tommy', role: ROLES.STUDENT },
      isAuthenticated: true,
      isLoading: false,
    });

    render(
      <MemoryRouter>
        <StudentDashboard />
      </MemoryRouter>
    );

    expect(screen.getByText(/Welcome, Tommy/i)).toBeInTheDocument();
    expect(screen.getByText('My Assignments')).toBeInTheDocument();
    expect(screen.getByText('Quizzes & Tests')).toBeInTheDocument();
  });

  it('ParentDashboard renders family overview modules', () => {
    vi.spyOn(authContextModule, 'useAuth').mockReturnValue({
      user: { id: 'p1', firstName: 'Robert', role: ROLES.PARENT },
      isAuthenticated: true,
      isLoading: false,
    });

    render(
      <MemoryRouter>
        <ParentDashboard />
      </MemoryRouter>
    );

    expect(screen.getByText(/Welcome, Robert/i)).toBeInTheDocument();
    expect(screen.getByText('Child Attendance')).toBeInTheDocument();
    expect(screen.getByText('Fee Invoices & Payments')).toBeInTheDocument();
  });

  it('LibrarianDashboard renders library operations modules', () => {
    vi.spyOn(authContextModule, 'useAuth').mockReturnValue({
      user: { id: 'l1', firstName: 'Emily', role: ROLES.LIBRARIAN },
      isAuthenticated: true,
      isLoading: false,
    });

    render(
      <MemoryRouter>
        <LibrarianDashboard />
      </MemoryRouter>
    );

    expect(screen.getByText(/Welcome, Emily/i)).toBeInTheDocument();
    expect(screen.getByText('Book Catalog & Inventory')).toBeInTheDocument();
  });

  it('StaffDashboard renders staff support modules', () => {
    vi.spyOn(authContextModule, 'useAuth').mockReturnValue({
      user: { id: 'st1', firstName: 'Mark', role: ROLES.STAFF },
      isAuthenticated: true,
      isLoading: false,
    });

    render(
      <MemoryRouter>
        <StaffDashboard />
      </MemoryRouter>
    );

    expect(screen.getByText(/Welcome, Mark/i)).toBeInTheDocument();
    expect(screen.getByText('School Circulars & Notices')).toBeInTheDocument();
  });
});
