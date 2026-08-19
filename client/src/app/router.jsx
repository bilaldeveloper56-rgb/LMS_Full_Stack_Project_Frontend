import React, { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { AppLayout, AuthLayout, MinimalLayout } from '@/layouts';
import { AuthGuard } from '@/features/auth/components/AuthGuard';
import { GuestGuard } from '@/features/auth/components/GuestGuard';
import { PermissionGuard } from '@/components/authorization';
import { LoadingState } from '@/components/feedback';
import { PERMISSIONS } from '@/constants';

/**
 * Lazy-loaded page components for route-level code splitting.
 */
const LandingPage = lazy(() => import('@/pages/LandingPage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));
const ForbiddenPage = lazy(() => import('@/pages/ForbiddenPage'));

// Auth Pages
const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/features/auth/pages/RegisterPage'));
const AcceptInvitationPage = lazy(() => import('@/features/auth/pages/AcceptInvitationPage'));

// Students Pages
const StudentsPage = lazy(() => import('@/features/students/pages/StudentsPage'));
const CreateStudentPage = lazy(() => import('@/features/students/pages/CreateStudentPage'));
const StudentDetailsPage = lazy(() => import('@/features/students/pages/StudentDetailsPage'));
const EditStudentPage = lazy(() => import('@/features/students/pages/EditStudentPage'));

// Teachers Pages
const TeachersPage = lazy(() => import('@/features/teachers/pages/TeachersPage'));
const CreateTeacherPage = lazy(() => import('@/features/teachers/pages/CreateTeacherPage'));
const TeacherDetailsPage = lazy(() => import('@/features/teachers/pages/TeacherDetailsPage'));
const EditTeacherPage = lazy(() => import('@/features/teachers/pages/EditTeacherPage'));

// Parents Pages
const ParentsPage = lazy(() => import('@/features/parents/pages/ParentsPage'));
const CreateParentPage = lazy(() => import('@/features/parents/pages/CreateParentPage'));
const ParentDetailsPage = lazy(() => import('@/features/parents/pages/ParentDetailsPage'));
const EditParentPage = lazy(() => import('@/features/parents/pages/EditParentPage'));

// Academics Pages
const AcademicSessionsPage = lazy(() => import('@/features/academics/pages/AcademicSessionsPage'));
const ClassesPage = lazy(() => import('@/features/academics/pages/ClassesPage'));
const SubjectsPage = lazy(() => import('@/features/academics/pages/SubjectsPage'));
const StudentPromotionPage = lazy(() => import('@/features/academics/pages/StudentPromotionPage'));

// Attendance Pages
const DailyAttendancePage = lazy(() => import('@/features/attendance/pages/DailyAttendancePage'));
const AttendanceReportPage = lazy(() => import('@/features/attendance/pages/AttendanceReportPage'));

// Leaves Pages
const LeavesDirectoryPage = lazy(() => import('@/features/leaves/pages/LeavesDirectoryPage'));
const MyLeavesPage = lazy(() => import('@/features/leaves/pages/MyLeavesPage'));

// Timetable Pages
const TimetablePage = lazy(() => import('@/features/timetable/pages/TimetablePage'));

// Assignments Pages
const AssignmentsPage = lazy(() => import('@/features/assignments/pages/AssignmentsPage'));
const CreateAssignmentPage = lazy(() => import('@/features/assignments/pages/CreateAssignmentPage'));
const AssignmentDetailsPage = lazy(() => import('@/features/assignments/pages/AssignmentDetailsPage'));
const EditAssignmentPage = lazy(() => import('@/features/assignments/pages/EditAssignmentPage'));

// Quizzes Pages
const QuizzesPage = lazy(() => import('@/features/quizzes/pages/QuizzesPage'));
const CreateQuizPage = lazy(() => import('@/features/quizzes/pages/CreateQuizPage'));
const QuizDetailsPage = lazy(() => import('@/features/quizzes/pages/QuizDetailsPage'));
const EditQuizPage = lazy(() => import('@/features/quizzes/pages/EditQuizPage'));
const TakeQuizPage = lazy(() => import('@/features/quizzes/pages/TakeQuizPage'));

// Notifications & Messaging Pages
const NotificationsPage = lazy(() => import('@/features/notifications/pages/NotificationsPage'));
const MessagesPage = lazy(() => import('@/features/messaging/pages/MessagesPage'));

// Exams & Results Pages
const ExamsPage = lazy(() => import('@/features/exams/pages/ExamsPage'));
const CreateExamPage = lazy(() => import('@/features/exams/pages/CreateExamPage'));
const ExamDetailsPage = lazy(() => import('@/features/exams/pages/ExamDetailsPage'));
const EditExamPage = lazy(() => import('@/features/exams/pages/EditExamPage'));
const ResultsPage = lazy(() => import('@/features/results/pages/ResultsPage'));
const StudentReportCardPage = lazy(() => import('@/features/results/pages/StudentReportCardPage'));

// Fees Pages
const FeesDashboardPage = lazy(() => import('@/features/fees/pages/FeesDashboardPage'));
const FeeInvoiceDetailsPage = lazy(() => import('@/features/fees/pages/FeeInvoiceDetailsPage'));

// Notices Pages
const NoticesPage = lazy(() => import('@/features/notices/pages/NoticesPage'));
const CreateNoticePage = lazy(() => import('@/features/notices/pages/CreateNoticePage'));
const NoticeDetailsPage = lazy(() => import('@/features/notices/pages/NoticeDetailsPage'));
const EditNoticePage = lazy(() => import('@/features/notices/pages/EditNoticePage'));

// Reports, Audit & Analytics Pages
const ReportsPage = lazy(() => import('@/features/reports/pages/ReportsPage'));
const AuditLogsPage = lazy(() => import('@/features/auditLogs/pages/AuditLogsPage'));
const AnalyticsPage = lazy(() => import('@/features/analytics/pages/AnalyticsPage'));

// Schools Pages
const SchoolsPage = lazy(() => import('@/features/schools/pages/SchoolsPage'));
const CreateSchoolPage = lazy(() => import('@/features/schools/pages/CreateSchoolPage'));
const SchoolDetailsPage = lazy(() => import('@/features/schools/pages/SchoolDetailsPage'));
const EditSchoolPage = lazy(() => import('@/features/schools/pages/EditSchoolPage'));

/**
 * Route Suspense fallback wrapper.
 */
function SuspenseWrap({ children }) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px] p-8">
          <LoadingState message="Loading page..." />
        </div>
      }
    >
      {children}
    </Suspense>
  );
}

/**
 * Application Router with route-level code splitting.
 */
const router = createBrowserRouter([
  /* ── Public Landing Route ── */
  {
    path: '/',
    element: (
      <SuspenseWrap>
        <LandingPage />
      </SuspenseWrap>
    ),
  },

  /* ── Guest-Only Auth Routes ── */
  {
    element: (
      <GuestGuard>
        <AuthLayout />
      </GuestGuard>
    ),
    children: [
      {
        path: '/login',
        element: (
          <SuspenseWrap>
            <LoginPage />
          </SuspenseWrap>
        ),
      },
      {
        path: '/register',
        element: (
          <SuspenseWrap>
            <RegisterPage />
          </SuspenseWrap>
        ),
      },
    ],
  },

  /* ── Public Invitation Acceptance Route ── */
  {
    element: <AuthLayout />,
    children: [
      {
        path: '/accept-invitation',
        element: (
          <SuspenseWrap>
            <AcceptInvitationPage />
          </SuspenseWrap>
        ),
      },
    ],
  },

  /* ── Protected Application Routes ── */
  {
    element: (
      <AuthGuard>
        <AppLayout />
      </AuthGuard>
    ),
    children: [
      {
        path: '/dashboard',
        element: (
          <SuspenseWrap>
            <DashboardPage />
          </SuspenseWrap>
        ),
      },

      /* Students Module */
      {
        path: '/students',
        element: (
          <PermissionGuard permission={PERMISSIONS.STUDENTS_READ}>
            <SuspenseWrap>
              <StudentsPage />
            </SuspenseWrap>
          </PermissionGuard>
        ),
      },
      {
        path: '/students/new',
        element: (
          <PermissionGuard permission={PERMISSIONS.STUDENTS_CREATE}>
            <SuspenseWrap>
              <CreateStudentPage />
            </SuspenseWrap>
          </PermissionGuard>
        ),
      },
      {
        path: '/students/:id',
        element: (
          <PermissionGuard permission={PERMISSIONS.STUDENTS_READ}>
            <SuspenseWrap>
              <StudentDetailsPage />
            </SuspenseWrap>
          </PermissionGuard>
        ),
      },
      {
        path: '/students/:id/edit',
        element: (
          <PermissionGuard permission={PERMISSIONS.STUDENTS_UPDATE}>
            <SuspenseWrap>
              <EditStudentPage />
            </SuspenseWrap>
          </PermissionGuard>
        ),
      },

      /* Teachers Module */
      {
        path: '/teachers',
        element: (
          <PermissionGuard permission={PERMISSIONS.TEACHERS_READ}>
            <SuspenseWrap>
              <TeachersPage />
            </SuspenseWrap>
          </PermissionGuard>
        ),
      },
      {
        path: '/teachers/new',
        element: (
          <PermissionGuard permission={PERMISSIONS.TEACHERS_CREATE}>
            <SuspenseWrap>
              <CreateTeacherPage />
            </SuspenseWrap>
          </PermissionGuard>
        ),
      },
      {
        path: '/teachers/:id',
        element: (
          <PermissionGuard permission={PERMISSIONS.TEACHERS_READ}>
            <SuspenseWrap>
              <TeacherDetailsPage />
            </SuspenseWrap>
          </PermissionGuard>
        ),
      },
      {
        path: '/teachers/:id/edit',
        element: (
          <PermissionGuard permission={PERMISSIONS.TEACHERS_UPDATE}>
            <SuspenseWrap>
              <EditTeacherPage />
            </SuspenseWrap>
          </PermissionGuard>
        ),
      },

      /* Parents Module */
      {
        path: '/parents',
        element: (
          <PermissionGuard permission={PERMISSIONS.PARENTS_READ}>
            <SuspenseWrap>
              <ParentsPage />
            </SuspenseWrap>
          </PermissionGuard>
        ),
      },
      {
        path: '/parents/new',
        element: (
          <PermissionGuard permission={PERMISSIONS.PARENTS_CREATE}>
            <SuspenseWrap>
              <CreateParentPage />
            </SuspenseWrap>
          </PermissionGuard>
        ),
      },
      {
        path: '/parents/:id',
        element: (
          <PermissionGuard permission={PERMISSIONS.PARENTS_READ}>
            <SuspenseWrap>
              <ParentDetailsPage />
            </SuspenseWrap>
          </PermissionGuard>
        ),
      },
      {
        path: '/parents/:id/edit',
        element: (
          <PermissionGuard permission={PERMISSIONS.PARENTS_UPDATE}>
            <SuspenseWrap>
              <EditParentPage />
            </SuspenseWrap>
          </PermissionGuard>
        ),
      },

      /* Academics Module */
      {
        path: '/academic-sessions',
        element: (
          <PermissionGuard permission={PERMISSIONS.ACADEMIC_SESSIONS_READ}>
            <SuspenseWrap>
              <AcademicSessionsPage />
            </SuspenseWrap>
          </PermissionGuard>
        ),
      },
      {
        path: '/classes',
        element: (
          <PermissionGuard permission={PERMISSIONS.CLASSES_READ}>
            <SuspenseWrap>
              <ClassesPage />
            </SuspenseWrap>
          </PermissionGuard>
        ),
      },
      {
        path: '/subjects',
        element: (
          <PermissionGuard permission={PERMISSIONS.SUBJECTS_READ}>
            <SuspenseWrap>
              <SubjectsPage />
            </SuspenseWrap>
          </PermissionGuard>
        ),
      },
      {
        path: '/academics/promotions',
        element: (
          <PermissionGuard permission={PERMISSIONS.PROMOTIONS_READ}>
            <SuspenseWrap>
              <StudentPromotionPage />
            </SuspenseWrap>
          </PermissionGuard>
        ),
      },

      /* Attendance Module */
      {
        path: '/attendance',
        element: (
          <PermissionGuard permission={PERMISSIONS.ATTENDANCE_READ}>
            <SuspenseWrap>
              <DailyAttendancePage />
            </SuspenseWrap>
          </PermissionGuard>
        ),
      },
      {
        path: '/attendance/reports',
        element: (
          <PermissionGuard permission={PERMISSIONS.ATTENDANCE_REPORT}>
            <SuspenseWrap>
              <AttendanceReportPage />
            </SuspenseWrap>
          </PermissionGuard>
        ),
      },

      /* Leaves Module */
      {
        path: '/leaves',
        element: (
          <PermissionGuard permission={PERMISSIONS.LEAVES_READ}>
            <SuspenseWrap>
              <LeavesDirectoryPage />
            </SuspenseWrap>
          </PermissionGuard>
        ),
      },
      {
        path: '/leaves/my',
        element: (
          <PermissionGuard permission={PERMISSIONS.LEAVES_READ}>
            <SuspenseWrap>
              <MyLeavesPage />
            </SuspenseWrap>
          </PermissionGuard>
        ),
      },

      /* Timetable Module */
      {
        path: '/timetable',
        element: (
          <PermissionGuard permission={PERMISSIONS.TIMETABLE_READ}>
            <SuspenseWrap>
              <TimetablePage />
            </SuspenseWrap>
          </PermissionGuard>
        ),
      },

      /* Assignments Module */
      {
        path: '/assignments',
        element: (
          <PermissionGuard permission={PERMISSIONS.ASSIGNMENTS_READ}>
            <SuspenseWrap>
              <AssignmentsPage />
            </SuspenseWrap>
          </PermissionGuard>
        ),
      },
      {
        path: '/assignments/new',
        element: (
          <PermissionGuard permission={PERMISSIONS.ASSIGNMENTS_CREATE}>
            <SuspenseWrap>
              <CreateAssignmentPage />
            </SuspenseWrap>
          </PermissionGuard>
        ),
      },
      {
        path: '/assignments/:id',
        element: (
          <PermissionGuard permission={PERMISSIONS.ASSIGNMENTS_READ}>
            <SuspenseWrap>
              <AssignmentDetailsPage />
            </SuspenseWrap>
          </PermissionGuard>
        ),
      },
      {
        path: '/assignments/:id/edit',
        element: (
          <PermissionGuard permission={PERMISSIONS.ASSIGNMENTS_UPDATE}>
            <SuspenseWrap>
              <EditAssignmentPage />
            </SuspenseWrap>
          </PermissionGuard>
        ),
      },

      /* Quizzes Module */
      {
        path: '/quizzes',
        element: (
          <PermissionGuard permission={PERMISSIONS.QUIZZES_READ}>
            <SuspenseWrap>
              <QuizzesPage />
            </SuspenseWrap>
          </PermissionGuard>
        ),
      },
      {
        path: '/quizzes/new',
        element: (
          <PermissionGuard permission={PERMISSIONS.QUIZZES_CREATE}>
            <SuspenseWrap>
              <CreateQuizPage />
            </SuspenseWrap>
          </PermissionGuard>
        ),
      },
      {
        path: '/quizzes/:id',
        element: (
          <PermissionGuard permission={PERMISSIONS.QUIZZES_READ}>
            <SuspenseWrap>
              <QuizDetailsPage />
            </SuspenseWrap>
          </PermissionGuard>
        ),
      },
      {
        path: '/quizzes/:id/edit',
        element: (
          <PermissionGuard permission={PERMISSIONS.QUIZZES_UPDATE}>
            <SuspenseWrap>
              <EditQuizPage />
            </SuspenseWrap>
          </PermissionGuard>
        ),
      },
      {
        path: '/quizzes/:id/take',
        element: (
          <PermissionGuard permission={PERMISSIONS.QUIZZES_READ}>
            <SuspenseWrap>
              <TakeQuizPage />
            </SuspenseWrap>
          </PermissionGuard>
        ),
      },

      /* Notifications Module */
      {
        path: '/notifications',
        element: (
          <PermissionGuard permission={PERMISSIONS.NOTIFICATIONS_READ}>
            <SuspenseWrap>
              <NotificationsPage />
            </SuspenseWrap>
          </PermissionGuard>
        ),
      },

      /* Messaging Module */
      {
        path: '/messages',
        element: (
          <PermissionGuard permission={PERMISSIONS.MESSAGES_READ}>
            <SuspenseWrap>
              <MessagesPage />
            </SuspenseWrap>
          </PermissionGuard>
        ),
      },

      /* Examinations Module */
      {
        path: '/exams',
        element: (
          <PermissionGuard permission={PERMISSIONS.EXAMS_READ}>
            <SuspenseWrap>
              <ExamsPage />
            </SuspenseWrap>
          </PermissionGuard>
        ),
      },
      {
        path: '/exams/new',
        element: (
          <PermissionGuard permission={PERMISSIONS.EXAMS_CREATE}>
            <SuspenseWrap>
              <CreateExamPage />
            </SuspenseWrap>
          </PermissionGuard>
        ),
      },
      {
        path: '/exams/:id',
        element: (
          <PermissionGuard permission={PERMISSIONS.EXAMS_READ}>
            <SuspenseWrap>
              <ExamDetailsPage />
            </SuspenseWrap>
          </PermissionGuard>
        ),
      },
      {
        path: '/exams/:id/edit',
        element: (
          <PermissionGuard permission={PERMISSIONS.EXAMS_UPDATE}>
            <SuspenseWrap>
              <EditExamPage />
            </SuspenseWrap>
          </PermissionGuard>
        ),
      },

      /* Results & Grading Module */
      {
        path: '/results',
        element: (
          <PermissionGuard permission={PERMISSIONS.RESULTS_READ}>
            <SuspenseWrap>
              <ResultsPage />
            </SuspenseWrap>
          </PermissionGuard>
        ),
      },
      {
        path: '/results/students/:studentId',
        element: (
          <PermissionGuard permission={PERMISSIONS.RESULTS_READ}>
            <SuspenseWrap>
              <StudentReportCardPage />
            </SuspenseWrap>
          </PermissionGuard>
        ),
      },

      /* Fees & Invoicing Module */
      {
        path: '/fees',
        element: (
          <PermissionGuard permission={PERMISSIONS.FEES_READ}>
            <SuspenseWrap>
              <FeesDashboardPage />
            </SuspenseWrap>
          </PermissionGuard>
        ),
      },
      {
        path: '/fees/invoices/:id',
        element: (
          <PermissionGuard permission={PERMISSIONS.FEES_READ}>
            <SuspenseWrap>
              <FeeInvoiceDetailsPage />
            </SuspenseWrap>
          </PermissionGuard>
        ),
      },

      /* Notices & Announcements Module */
      {
        path: '/notices',
        element: (
          <PermissionGuard permission={PERMISSIONS.NOTICES_READ}>
            <SuspenseWrap>
              <NoticesPage />
            </SuspenseWrap>
          </PermissionGuard>
        ),
      },
      {
        path: '/notices/new',
        element: (
          <PermissionGuard permission={PERMISSIONS.NOTICES_CREATE}>
            <SuspenseWrap>
              <CreateNoticePage />
            </SuspenseWrap>
          </PermissionGuard>
        ),
      },
      {
        path: '/notices/:id',
        element: (
          <PermissionGuard permission={PERMISSIONS.NOTICES_READ}>
            <SuspenseWrap>
              <NoticeDetailsPage />
            </SuspenseWrap>
          </PermissionGuard>
        ),
      },
      {
        path: '/notices/:id/edit',
        element: (
          <PermissionGuard permission={PERMISSIONS.NOTICES_UPDATE}>
            <SuspenseWrap>
              <EditNoticePage />
            </SuspenseWrap>
          </PermissionGuard>
        ),
      },

      /* Institutional Reports Module */
      {
        path: '/reports',
        element: (
          <PermissionGuard permission={PERMISSIONS.REPORTS_READ}>
            <SuspenseWrap>
              <ReportsPage />
            </SuspenseWrap>
          </PermissionGuard>
        ),
      },

      /* Audit Logs & Security Compliance Ledger */
      {
        path: '/audit-logs',
        element: (
          <PermissionGuard permission={PERMISSIONS.AUDIT_LOGS_READ}>
            <SuspenseWrap>
              <AuditLogsPage />
            </SuspenseWrap>
          </PermissionGuard>
        ),
      },

      /* Institutional Analytics & BI Dashboard */
      {
        path: '/analytics',
        element: (
          <PermissionGuard permission={PERMISSIONS.REPORTS_READ}>
            <SuspenseWrap>
              <AnalyticsPage />
            </SuspenseWrap>
          </PermissionGuard>
        ),
      },

      /* Multi-Tenant SaaS School Management (Super Admin) */
      {
        path: '/schools',
        element: (
          <PermissionGuard permission={PERMISSIONS.SCHOOLS_READ}>
            <SuspenseWrap>
              <SchoolsPage />
            </SuspenseWrap>
          </PermissionGuard>
        ),
      },
      {
        path: '/schools/new',
        element: (
          <PermissionGuard permission={PERMISSIONS.SCHOOLS_CREATE}>
            <SuspenseWrap>
              <CreateSchoolPage />
            </SuspenseWrap>
          </PermissionGuard>
        ),
      },
      {
        path: '/schools/:id',
        element: (
          <PermissionGuard permission={PERMISSIONS.SCHOOLS_READ}>
            <SuspenseWrap>
              <SchoolDetailsPage />
            </SuspenseWrap>
          </PermissionGuard>
        ),
      },
      {
        path: '/schools/:id/edit',
        element: (
          <PermissionGuard permission={PERMISSIONS.SCHOOLS_UPDATE}>
            <SuspenseWrap>
              <EditSchoolPage />
            </SuspenseWrap>
          </PermissionGuard>
        ),
      },
    ],
  },

  /* ── Access Denied (403) & Fallback (404) Routes ── */
  {
    element: <MinimalLayout />,
    children: [
      {
        path: '/403',
        element: (
          <SuspenseWrap>
            <ForbiddenPage />
          </SuspenseWrap>
        ),
      },
      {
        path: '*',
        element: (
          <SuspenseWrap>
            <NotFoundPage />
          </SuspenseWrap>
        ),
      },
    ],
  },
]);

export default router;
