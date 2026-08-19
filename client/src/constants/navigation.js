import { ROLES } from './roles';
import { PERMISSIONS } from './permissions';

/**
 * Role-aware and permission-aware sidebar navigation definition.
 *
 * Each group and item can optionally declare:
 * - `roles`: Array of roles allowed to view this item.
 * - `permissions`: Single permission string or array of permissions.
 * - `requireAll`: If true, requires all listed permissions. Defaults to false (any).
 * - `hideForRoles`: Array of roles explicitly excluded.
 */
export const NAV_GROUPS = Object.freeze([
  {
    label: 'Overview',
    items: [
      {
        label: 'Dashboard',
        path: '/dashboard',
        icon: 'LayoutDashboard',
      },
    ],
  },
  {
    label: 'Administration',
    roles: [ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN],
    items: [
      {
        label: 'Schools',
        path: '/schools',
        icon: 'School',
        roles: [ROLES.SUPER_ADMIN],
        permissions: [PERMISSIONS.SCHOOLS_READ],
      },
      {
        label: 'Users',
        path: '/users',
        icon: 'Users',
        permissions: [PERMISSIONS.USERS_READ],
      },
    ],
  },
  {
    label: 'People',
    items: [
      {
        label: 'Students',
        path: '/students',
        icon: 'GraduationCap',
        permissions: [PERMISSIONS.STUDENTS_READ],
      },
      {
        label: 'Teachers',
        path: '/teachers',
        icon: 'Users',
        permissions: [PERMISSIONS.TEACHERS_READ],
      },
      {
        label: 'Parents',
        path: '/parents',
        icon: 'UserCheck',
        permissions: [PERMISSIONS.PARENTS_READ],
      },
    ],
  },
  {
    label: 'Academics',
    items: [
      {
        label: 'Sessions',
        path: '/academic-sessions',
        icon: 'Calendar',
        permissions: [PERMISSIONS.ACADEMIC_SESSIONS_READ],
      },
      {
        label: 'Classes',
        path: '/classes',
        icon: 'School',
        permissions: [PERMISSIONS.CLASSES_READ],
      },
      {
        label: 'Subjects',
        path: '/subjects',
        icon: 'BookOpen',
        permissions: [PERMISSIONS.SUBJECTS_READ],
      },
      {
        label: 'Timetable',
        path: '/timetable',
        icon: 'Clock',
        permissions: [PERMISSIONS.TIMETABLE_READ],
      },
      {
        label: 'Promotions',
        path: '/academics/promotions',
        icon: 'TrendingUp',
        permissions: [PERMISSIONS.PROMOTIONS_READ],
      },
    ],
  },
  {
    label: 'Learning',
    items: [
      {
        label: 'Assignments',
        path: '/assignments',
        icon: 'FileText',
        permissions: [PERMISSIONS.ASSIGNMENTS_READ],
      },
      {
        label: 'Quizzes',
        path: '/quizzes',
        icon: 'HelpCircle',
        permissions: [PERMISSIONS.QUIZZES_READ],
      },
      {
        label: 'Exams',
        path: '/exams',
        icon: 'ClipboardList',
        permissions: [PERMISSIONS.EXAMS_READ],
      },
      {
        label: 'Results',
        path: '/results',
        icon: 'BarChart3',
        permissions: [PERMISSIONS.RESULTS_READ],
      },
    ],
  },
  {
    label: 'Management',
    items: [
      {
        label: 'Attendance',
        path: '/attendance',
        icon: 'CheckSquare',
        permissions: [PERMISSIONS.ATTENDANCE_READ],
      },
      {
        label: 'Leaves',
        path: '/leaves',
        icon: 'CalendarOff',
        permissions: [PERMISSIONS.LEAVES_READ],
      },
      {
        label: 'Fees',
        path: '/fees',
        icon: 'CreditCard',
        permissions: [PERMISSIONS.FEES_READ],
      },
    ],
  },
  {
    label: 'Communication',
    items: [
      {
        label: 'Notices',
        path: '/notices',
        icon: 'Megaphone',
        permissions: [PERMISSIONS.NOTICES_READ],
      },
      {
        label: 'Messages',
        path: '/messages',
        icon: 'MessageSquare',
        permissions: [PERMISSIONS.MESSAGES_READ],
      },
    ],
  },
  {
    label: 'Insights',
    items: [
      {
        label: 'Analytics',
        path: '/analytics',
        icon: 'TrendingUp',
        roles: [ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN],
        permissions: [PERMISSIONS.REPORTS_READ],
      },
      {
        label: 'Reports',
        path: '/reports',
        icon: 'FileBarChart',
        permissions: [PERMISSIONS.REPORTS_READ],
      },
      {
        label: 'Audit Logs',
        path: '/audit-logs',
        icon: 'Shield',
        permissions: [PERMISSIONS.AUDIT_LOGS_READ],
      },
    ],
  },
]);
