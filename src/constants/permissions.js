/**
 * Granular permission constants for RBAC.
 * Each permission is a string in the format "resource:action".
 * Role-permission mapping is defined separately to allow
 * per-school customization in future phases.
 */
export const PERMISSIONS = Object.freeze({
  // Schools
  SCHOOLS_READ: 'schools:read',
  SCHOOLS_CREATE: 'schools:create',
  SCHOOLS_UPDATE: 'schools:update',
  SCHOOLS_DELETE: 'schools:delete',
  SCHOOLS_MANAGE: 'schools:manage',

  // Users
  USERS_READ: 'users:read',
  USERS_CREATE: 'users:create',
  USERS_UPDATE: 'users:update',
  USERS_DELETE: 'users:delete',

  // Students
  STUDENTS_READ: 'students:read',
  STUDENTS_CREATE: 'students:create',
  STUDENTS_UPDATE: 'students:update',
  STUDENTS_DELETE: 'students:delete',
  STUDENTS_MANAGE: 'students:manage',

  // Teachers
  TEACHERS_READ: 'teachers:read',
  TEACHERS_CREATE: 'teachers:create',
  TEACHERS_UPDATE: 'teachers:update',
  TEACHERS_DELETE: 'teachers:delete',
  TEACHERS_MANAGE: 'teachers:manage',

  // Parents
  PARENTS_READ: 'parents:read',
  PARENTS_CREATE: 'parents:create',
  PARENTS_UPDATE: 'parents:update',
  PARENTS_DELETE: 'parents:delete',

  // Academic Sessions
  ACADEMIC_SESSIONS_READ: 'academic_sessions:read',
  ACADEMIC_SESSIONS_CREATE: 'academic_sessions:create',
  ACADEMIC_SESSIONS_UPDATE: 'academic_sessions:update',
  ACADEMIC_SESSIONS_DELETE: 'academic_sessions:delete',
  ACADEMIC_SESSIONS_MANAGE: 'academic_sessions:manage',

  // Classes
  CLASSES_READ: 'classes:read',
  CLASSES_CREATE: 'classes:create',
  CLASSES_UPDATE: 'classes:update',
  CLASSES_DELETE: 'classes:delete',

  // Sections
  SECTIONS_READ: 'sections:read',
  SECTIONS_CREATE: 'sections:create',
  SECTIONS_UPDATE: 'sections:update',
  SECTIONS_DELETE: 'sections:delete',

  // Subjects
  SUBJECTS_READ: 'subjects:read',
  SUBJECTS_CREATE: 'subjects:create',
  SUBJECTS_UPDATE: 'subjects:update',
  SUBJECTS_DELETE: 'subjects:delete',

  // Attendance
  ATTENDANCE_READ: 'attendance:read',
  ATTENDANCE_CREATE: 'attendance:create',
  ATTENDANCE_UPDATE: 'attendance:update',
  ATTENDANCE_DELETE: 'attendance:delete',
  ATTENDANCE_MANAGE: 'attendance:manage',
  ATTENDANCE_REPORT: 'attendance:report',

  // Leaves
  LEAVES_READ: 'leaves:read',
  LEAVES_CREATE: 'leaves:create',
  LEAVES_UPDATE: 'leaves:update',
  LEAVES_DELETE: 'leaves:delete',
  LEAVES_APPROVE: 'leaves:approve',
  LEAVES_REJECT: 'leaves:reject',
  LEAVES_MANAGE: 'leaves:manage',

  // Timetable
  TIMETABLE_READ: 'timetable:read',
  TIMETABLE_CREATE: 'timetable:create',
  TIMETABLE_UPDATE: 'timetable:update',
  TIMETABLE_DELETE: 'timetable:delete',

  // Assignments
  ASSIGNMENTS_READ: 'assignments:read',
  ASSIGNMENTS_CREATE: 'assignments:create',
  ASSIGNMENTS_UPDATE: 'assignments:update',
  ASSIGNMENTS_DELETE: 'assignments:delete',
  ASSIGNMENTS_GRADE: 'assignments:grade',

  // Quizzes
  QUIZZES_READ: 'quizzes:read',
  QUIZZES_CREATE: 'quizzes:create',
  QUIZZES_UPDATE: 'quizzes:update',
  QUIZZES_DELETE: 'quizzes:delete',
  QUIZZES_GRADE: 'quizzes:grade',

  // Exams
  EXAMS_READ: 'exams:read',
  EXAMS_CREATE: 'exams:create',
  EXAMS_UPDATE: 'exams:update',
  EXAMS_DELETE: 'exams:delete',
  EXAMS_PUBLISH: 'exams:publish',

  // Results
  RESULTS_READ: 'results:read',
  RESULTS_CREATE: 'results:create',
  RESULTS_UPDATE: 'results:update',
  RESULTS_PUBLISH: 'results:publish',
  RESULTS_LOCK: 'results:lock',

  // Fees
  FEES_READ: 'fees:read',
  FEES_CREATE: 'fees:create',
  FEES_UPDATE: 'fees:update',
  FEES_DELETE: 'fees:delete',
  FEES_MANAGE: 'fees:manage',

  // Payments
  PAYMENTS_READ: 'payments:read',
  PAYMENTS_CREATE: 'payments:create',

  // Notices
  NOTICES_READ: 'notices:read',
  NOTICES_CREATE: 'notices:create',
  NOTICES_UPDATE: 'notices:update',
  NOTICES_PUBLISH: 'notices:publish',
  NOTICES_DELETE: 'notices:delete',

  // Notifications
  NOTIFICATIONS_READ: 'notifications:read',
  NOTIFICATIONS_MANAGE: 'notifications:manage',

  // Messages
  MESSAGES_READ: 'messages:read',
  MESSAGES_CREATE: 'messages:create',
  MESSAGES_MANAGE: 'messages:manage',

  // Library
  LIBRARY_READ: 'library:read',
  LIBRARY_CREATE: 'library:create',
  LIBRARY_UPDATE: 'library:update',
  LIBRARY_ISSUE: 'library:issue',
  LIBRARY_RETURN: 'library:return',

  // Certificates
  CERTIFICATES_READ: 'certificates:read',
  CERTIFICATES_CREATE: 'certificates:create',
  CERTIFICATES_MANAGE: 'certificates:manage',

  // Reports
  REPORTS_READ: 'reports:read',
  REPORTS_GENERATE: 'reports:generate',

  // Audit Logs
  AUDIT_LOGS_READ: 'audit_logs:read',

  // AI
  AI_USE: 'ai:use',
  AI_MANAGE: 'ai:manage',

  // Subscriptions
  SUBSCRIPTIONS_READ: 'subscriptions:read',
  SUBSCRIPTIONS_MANAGE: 'subscriptions:manage',
});

/**
 * All valid permission values as a Set for O(1) lookups.
 */
export const PERMISSION_VALUES = Object.freeze(Object.values(PERMISSIONS));
export const PERMISSION_SET = Object.freeze(new Set(PERMISSION_VALUES));

/**
 * Default permission sets for each role.
 * Schools can override these per-user via the User.permissions array (future phase).
 *
 * SUPER_ADMIN: All permissions (platform-wide).
 * SCHOOL_ADMIN: Full school management (no platform-level operations).
 * TEACHER: Teaching, academic, and assigned resources.
 * STUDENT: Own academic information and permitted student features.
 * PARENT: Linked children's information.
 * ACCOUNTANT: Financial resources and appropriate reports.
 * LIBRARIAN: Library management and related student information.
 * STAFF: Minimal permissions, expanded via custom overrides.
 */
export const DEFAULT_ROLE_PERMISSIONS = Object.freeze({
  SUPER_ADMIN: PERMISSION_VALUES,

  SCHOOL_ADMIN: [
    // Schools (own school only)
    PERMISSIONS.SCHOOLS_READ,
    PERMISSIONS.SCHOOLS_UPDATE,

    // Users
    PERMISSIONS.USERS_READ,
    PERMISSIONS.USERS_CREATE,
    PERMISSIONS.USERS_UPDATE,
    PERMISSIONS.USERS_DELETE,

    // Students
    PERMISSIONS.STUDENTS_READ,
    PERMISSIONS.STUDENTS_CREATE,
    PERMISSIONS.STUDENTS_UPDATE,
    PERMISSIONS.STUDENTS_DELETE,
    PERMISSIONS.STUDENTS_MANAGE,

    // Teachers
    PERMISSIONS.TEACHERS_READ,
    PERMISSIONS.TEACHERS_CREATE,
    PERMISSIONS.TEACHERS_UPDATE,
    PERMISSIONS.TEACHERS_DELETE,
    PERMISSIONS.TEACHERS_MANAGE,

    // Parents
    PERMISSIONS.PARENTS_READ,
    PERMISSIONS.PARENTS_CREATE,
    PERMISSIONS.PARENTS_UPDATE,
    PERMISSIONS.PARENTS_DELETE,

    // Academic Sessions
    PERMISSIONS.ACADEMIC_SESSIONS_READ,
    PERMISSIONS.ACADEMIC_SESSIONS_CREATE,
    PERMISSIONS.ACADEMIC_SESSIONS_UPDATE,
    PERMISSIONS.ACADEMIC_SESSIONS_DELETE,
    PERMISSIONS.ACADEMIC_SESSIONS_MANAGE,

    // Classes
    PERMISSIONS.CLASSES_READ,
    PERMISSIONS.CLASSES_CREATE,
    PERMISSIONS.CLASSES_UPDATE,
    PERMISSIONS.CLASSES_DELETE,

    // Sections
    PERMISSIONS.SECTIONS_READ,
    PERMISSIONS.SECTIONS_CREATE,
    PERMISSIONS.SECTIONS_UPDATE,
    PERMISSIONS.SECTIONS_DELETE,

    // Subjects
    PERMISSIONS.SUBJECTS_READ,
    PERMISSIONS.SUBJECTS_CREATE,
    PERMISSIONS.SUBJECTS_UPDATE,
    PERMISSIONS.SUBJECTS_DELETE,

    // Attendance
    PERMISSIONS.ATTENDANCE_READ,
    PERMISSIONS.ATTENDANCE_CREATE,
    PERMISSIONS.ATTENDANCE_UPDATE,
    PERMISSIONS.ATTENDANCE_DELETE,
    PERMISSIONS.ATTENDANCE_MANAGE,
    PERMISSIONS.ATTENDANCE_REPORT,

    // Leaves
    PERMISSIONS.LEAVES_READ,
    PERMISSIONS.LEAVES_CREATE,
    PERMISSIONS.LEAVES_UPDATE,
    PERMISSIONS.LEAVES_DELETE,
    PERMISSIONS.LEAVES_APPROVE,
    PERMISSIONS.LEAVES_REJECT,
    PERMISSIONS.LEAVES_MANAGE,

    // Timetable
    PERMISSIONS.TIMETABLE_READ,
    PERMISSIONS.TIMETABLE_CREATE,
    PERMISSIONS.TIMETABLE_UPDATE,
    PERMISSIONS.TIMETABLE_DELETE,

    // Assignments
    PERMISSIONS.ASSIGNMENTS_READ,
    PERMISSIONS.ASSIGNMENTS_CREATE,
    PERMISSIONS.ASSIGNMENTS_UPDATE,
    PERMISSIONS.ASSIGNMENTS_DELETE,
    PERMISSIONS.ASSIGNMENTS_GRADE,

    // Quizzes
    PERMISSIONS.QUIZZES_READ,
    PERMISSIONS.QUIZZES_CREATE,
    PERMISSIONS.QUIZZES_UPDATE,
    PERMISSIONS.QUIZZES_DELETE,
    PERMISSIONS.QUIZZES_GRADE,

    // Exams
    PERMISSIONS.EXAMS_READ,
    PERMISSIONS.EXAMS_CREATE,
    PERMISSIONS.EXAMS_UPDATE,
    PERMISSIONS.EXAMS_DELETE,
    PERMISSIONS.EXAMS_PUBLISH,

    // Results
    PERMISSIONS.RESULTS_READ,
    PERMISSIONS.RESULTS_CREATE,
    PERMISSIONS.RESULTS_UPDATE,
    PERMISSIONS.RESULTS_PUBLISH,
    PERMISSIONS.RESULTS_LOCK,

    // Fees
    PERMISSIONS.FEES_READ,
    PERMISSIONS.FEES_CREATE,
    PERMISSIONS.FEES_UPDATE,
    PERMISSIONS.FEES_DELETE,
    PERMISSIONS.FEES_MANAGE,

    // Payments
    PERMISSIONS.PAYMENTS_READ,
    PERMISSIONS.PAYMENTS_CREATE,

    // Notices
    PERMISSIONS.NOTICES_READ,
    PERMISSIONS.NOTICES_CREATE,
    PERMISSIONS.NOTICES_UPDATE,
    PERMISSIONS.NOTICES_PUBLISH,
    PERMISSIONS.NOTICES_DELETE,

    // Notifications
    PERMISSIONS.NOTIFICATIONS_READ,
    PERMISSIONS.NOTIFICATIONS_MANAGE,

    // Messages
    PERMISSIONS.MESSAGES_READ,
    PERMISSIONS.MESSAGES_CREATE,
    PERMISSIONS.MESSAGES_MANAGE,

    // Library
    PERMISSIONS.LIBRARY_READ,
    PERMISSIONS.LIBRARY_CREATE,
    PERMISSIONS.LIBRARY_UPDATE,
    PERMISSIONS.LIBRARY_ISSUE,
    PERMISSIONS.LIBRARY_RETURN,

    // Certificates
    PERMISSIONS.CERTIFICATES_READ,
    PERMISSIONS.CERTIFICATES_CREATE,
    PERMISSIONS.CERTIFICATES_MANAGE,

    // Reports
    PERMISSIONS.REPORTS_READ,
    PERMISSIONS.REPORTS_GENERATE,

    // Audit Logs
    PERMISSIONS.AUDIT_LOGS_READ,

    // AI
    PERMISSIONS.AI_USE,
    PERMISSIONS.AI_MANAGE,
  ],

  TEACHER: [
    // Academic Sessions (read-only)
    PERMISSIONS.ACADEMIC_SESSIONS_READ,

    // Students (read-only for assigned classes)
    PERMISSIONS.STUDENTS_READ,

    // Classes & Sections & Subjects (read-only)
    PERMISSIONS.CLASSES_READ,
    PERMISSIONS.SECTIONS_READ,
    PERMISSIONS.SUBJECTS_READ,

    // Attendance (manage for assigned classes)
    PERMISSIONS.ATTENDANCE_READ,
    PERMISSIONS.ATTENDANCE_CREATE,
    PERMISSIONS.ATTENDANCE_UPDATE,
    PERMISSIONS.ATTENDANCE_REPORT,

    // Leaves (own leaves)
    PERMISSIONS.LEAVES_READ,
    PERMISSIONS.LEAVES_CREATE,
    PERMISSIONS.LEAVES_UPDATE,

    // Timetable (read own)
    PERMISSIONS.TIMETABLE_READ,

    // Assignments (own subjects)
    PERMISSIONS.ASSIGNMENTS_READ,
    PERMISSIONS.ASSIGNMENTS_CREATE,
    PERMISSIONS.ASSIGNMENTS_UPDATE,
    PERMISSIONS.ASSIGNMENTS_DELETE,
    PERMISSIONS.ASSIGNMENTS_GRADE,

    // Quizzes (own subjects)
    PERMISSIONS.QUIZZES_READ,
    PERMISSIONS.QUIZZES_CREATE,
    PERMISSIONS.QUIZZES_UPDATE,
    PERMISSIONS.QUIZZES_DELETE,
    PERMISSIONS.QUIZZES_GRADE,

    // Exams (read + grade)
    PERMISSIONS.EXAMS_READ,

    // Results (own classes)
    PERMISSIONS.RESULTS_READ,
    PERMISSIONS.RESULTS_CREATE,
    PERMISSIONS.RESULTS_UPDATE,

    // Notices (read)
    PERMISSIONS.NOTICES_READ,

    // Notifications & Messages
    PERMISSIONS.NOTIFICATIONS_READ,
    PERMISSIONS.MESSAGES_READ,
    PERMISSIONS.MESSAGES_CREATE,

    // Library (read)
    PERMISSIONS.LIBRARY_READ,

    // AI
    PERMISSIONS.AI_USE,
  ],

  STUDENT: [
    // Academic Sessions (read-only)
    PERMISSIONS.ACADEMIC_SESSIONS_READ,

    // Own student data
    PERMISSIONS.STUDENTS_READ,

    // Classes & Sections & Subjects (read own)
    PERMISSIONS.CLASSES_READ,
    PERMISSIONS.SECTIONS_READ,
    PERMISSIONS.SUBJECTS_READ,

    // Attendance (read own)
    PERMISSIONS.ATTENDANCE_READ,

    // Leaves (own)
    PERMISSIONS.LEAVES_READ,
    PERMISSIONS.LEAVES_CREATE,
    PERMISSIONS.LEAVES_UPDATE,

    // Timetable (read own)
    PERMISSIONS.TIMETABLE_READ,

    // Assignments (read + submit)
    PERMISSIONS.ASSIGNMENTS_READ,

    // Quizzes (read + take)
    PERMISSIONS.QUIZZES_READ,

    // Exams (read)
    PERMISSIONS.EXAMS_READ,

    // Results (read own)
    PERMISSIONS.RESULTS_READ,

    // Fees & Payments (read own)
    PERMISSIONS.FEES_READ,
    PERMISSIONS.PAYMENTS_READ,

    // Notices (read)
    PERMISSIONS.NOTICES_READ,

    // Notifications & Messages
    PERMISSIONS.NOTIFICATIONS_READ,
    PERMISSIONS.MESSAGES_READ,
    PERMISSIONS.MESSAGES_CREATE,

    // Library (read)
    PERMISSIONS.LIBRARY_READ,

    // Certificates (read own)
    PERMISSIONS.CERTIFICATES_READ,

    // AI
    PERMISSIONS.AI_USE,
  ],

  PARENT: [
    // Academic Sessions (read-only)
    PERMISSIONS.ACADEMIC_SESSIONS_READ,

    // Linked children's data
    PERMISSIONS.STUDENTS_READ,

    // Attendance (read children)
    PERMISSIONS.ATTENDANCE_READ,

    // Leaves (read children)
    PERMISSIONS.LEAVES_READ,

    // Assignments (read children)
    PERMISSIONS.ASSIGNMENTS_READ,

    // Quizzes (read children)
    PERMISSIONS.QUIZZES_READ,

    // Exams (read children)
    PERMISSIONS.EXAMS_READ,

    // Results (read children)
    PERMISSIONS.RESULTS_READ,

    // Fees & Payments (read + pay children)
    PERMISSIONS.FEES_READ,
    PERMISSIONS.PAYMENTS_READ,
    PERMISSIONS.PAYMENTS_CREATE,

    // Notices (read)
    PERMISSIONS.NOTICES_READ,

    // Notifications & Messages
    PERMISSIONS.NOTIFICATIONS_READ,
    PERMISSIONS.MESSAGES_READ,
    PERMISSIONS.MESSAGES_CREATE,

    // Certificates (read children)
    PERMISSIONS.CERTIFICATES_READ,

    // Timetable (read children)
    PERMISSIONS.TIMETABLE_READ,
  ],

  ACCOUNTANT: [
    // Academic Sessions (read-only)
    PERMISSIONS.ACADEMIC_SESSIONS_READ,

    // Students (read for billing context)
    PERMISSIONS.STUDENTS_READ,

    // Classes (read for fee-structure context)
    PERMISSIONS.CLASSES_READ,

    // Fees
    PERMISSIONS.FEES_READ,
    PERMISSIONS.FEES_CREATE,
    PERMISSIONS.FEES_UPDATE,
    PERMISSIONS.FEES_DELETE,
    PERMISSIONS.FEES_MANAGE,

    // Payments
    PERMISSIONS.PAYMENTS_READ,
    PERMISSIONS.PAYMENTS_CREATE,

    // Reports
    PERMISSIONS.REPORTS_READ,
    PERMISSIONS.REPORTS_GENERATE,

    // Notices (read)
    PERMISSIONS.NOTICES_READ,

    // Notifications
    PERMISSIONS.NOTIFICATIONS_READ,
    PERMISSIONS.MESSAGES_READ,

    // Certificates (fee-related, e.g. receipt generation)
    PERMISSIONS.CERTIFICATES_READ,
  ],

  LIBRARIAN: [
    // Academic Sessions (read-only)
    PERMISSIONS.ACADEMIC_SESSIONS_READ,

    // Students (read for issue/return context)
    PERMISSIONS.STUDENTS_READ,

    // Library
    PERMISSIONS.LIBRARY_READ,
    PERMISSIONS.LIBRARY_CREATE,
    PERMISSIONS.LIBRARY_UPDATE,
    PERMISSIONS.LIBRARY_ISSUE,
    PERMISSIONS.LIBRARY_RETURN,

    // Reports (library reports)
    PERMISSIONS.REPORTS_READ,

    // Notices (read)
    PERMISSIONS.NOTICES_READ,

    // Notifications & Messages
    PERMISSIONS.NOTIFICATIONS_READ,
    PERMISSIONS.MESSAGES_READ,
  ],

  STAFF: [
    // Academic Sessions (read-only)
    PERMISSIONS.ACADEMIC_SESSIONS_READ,

    // Minimal read-only baseline
    PERMISSIONS.STUDENTS_READ,
    PERMISSIONS.NOTICES_READ,
    PERMISSIONS.NOTIFICATIONS_READ,
    PERMISSIONS.MESSAGES_READ,
    PERMISSIONS.MESSAGES_CREATE,
  ],
});

/**
 * Fields that must never be mass-assigned from client request bodies.
 * Used by sanitizeBody middleware to prevent privilege escalation.
 */
export const PROTECTED_FIELDS = Object.freeze([
  'role',
  'schoolId',
  'permissions',
  'status',
  'isDeleted',
  'createdBy',
  'updatedBy',
  'deletedAt',
  'deletedBy',
  'emailVerified',
  'emailVerificationToken',
  'emailVerificationExpires',
  'passwordResetToken',
  'passwordResetExpires',
  'invitationToken',
  'invitationExpires',
  'invitedBy',
  'invitedAt',
  'passwordHash',
  'passwordChangedAt',
  'lastLoginAt',
  'approvedBy',
  'approvedAt',
  'rejectedBy',
  'rejectedAt',
  'correctedBy',
  'correctedAt',
  'cancelledAt',
  'applicantUserId',
  'score',
  'gradedBy',
  'gradedAt',
  'isLocked',
  'lockedBy',
  'lockedAt',
  'isPublished',
  'publishedBy',
  'publishedAt',
  'isCorrect',
  'marksAwarded',
  'totalScore',
  'isPassed',
  'invoiceNumber',
  'receiptNumber',
  'paidAmount',
  'balanceAmount',
  'totalAmount',
  'subtotal',
  'totalDiscount',
  'totalFine',
  'receivedBy',
  'isRead',
  'readAt',
  '_id',
  '__v',
]);
