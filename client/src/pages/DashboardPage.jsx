import React from 'react';
import { useAuth } from '@/features/auth';
import { ROLES } from '@/constants';
import {
  SuperAdminDashboard,
  SchoolAdminDashboard,
  AccountantDashboard,
  TeacherDashboard,
  StudentDashboard,
  ParentDashboard,
  LibrarianDashboard,
  StaffDashboard,
  DashboardSkeleton,
  DashboardShell,
} from '@/features/dashboard';

/**
 * Main Application Dashboard Dispatcher.
 * Inspects the authenticated user's role and renders the dedicated live dashboard.
 */
export default function DashboardPage() {
  const { user, isLoading } = useAuth();

  if (isLoading || !user) {
    return (
      <DashboardShell title="Dashboard" subtitle="Loading metrics...">
        <DashboardSkeleton cardsCount={4} sectionsCount={2} />
      </DashboardShell>
    );
  }

  switch (user.role) {
    case ROLES.SUPER_ADMIN:
      return <SuperAdminDashboard />;

    case ROLES.SCHOOL_ADMIN:
      return <SchoolAdminDashboard />;

    case ROLES.ACCOUNTANT:
      return <AccountantDashboard />;

    case ROLES.TEACHER:
      return <TeacherDashboard />;

    case ROLES.STUDENT:
      return <StudentDashboard />;

    case ROLES.PARENT:
      return <ParentDashboard />;

    case ROLES.LIBRARIAN:
      return <LibrarianDashboard />;

    case ROLES.STAFF:
      return <StaffDashboard />;

    default:
      return <SchoolAdminDashboard />;
  }
}
