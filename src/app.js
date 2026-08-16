import express from 'express';
import applySecurityMiddleware from './middlewares/securityMiddleware.js';
import requestId from './utils/requestId.js';
import requestLogger from './middlewares/requestLogger.js';
import notFoundHandler from './middlewares/notFoundHandler.js';
import errorHandler from './middlewares/errorHandler.js';
import healthRoutes from './modules/health/health.routes.js';
import authRoutes from './modules/auth/auth.routes.js';
import schoolRoutes from './modules/schools/school.routes.js';
import academicSessionRoutes from './modules/academics/academicSession.routes.js';
import classRoutes from './modules/academics/class.routes.js';
import sectionRoutes from './modules/academics/section.routes.js';
import subjectRoutes from './modules/academics/subject.routes.js';
import teacherAssignmentRoutes from './modules/academics/teacherAssignment.routes.js';
import teacherRoutes from './modules/teachers/teacher.routes.js';
import parentRoutes from './modules/parents/parent.routes.js';
import studentParentRoutes from './modules/parents/studentParent.routes.js';
import studentRoutes from './modules/students/student.routes.js';
import enrollmentRoutes from './modules/students/enrollment.routes.js';
import attendanceRoutes from './modules/attendance/attendance.routes.js';
import leaveRoutes from './modules/leaves/leave.routes.js';
import timetableRoutes from './modules/timetable/timetable.routes.js';
import assignmentRoutes from './modules/assignments/assignment.routes.js';
import quizRoutes from './modules/quizzes/quiz.routes.js';
import examRoutes from './modules/exams/exam.routes.js';
import resultRoutes from './modules/results/result.routes.js';
import feeRoutes from './modules/fees/fee.routes.js';
import noticeRoutes from './modules/notices/notice.routes.js';
import notificationRoutes from './modules/notifications/notification.routes.js';
import messageRoutes from './modules/messages/message.routes.js';
import uploadRoutes from './modules/uploads/upload.routes.js';
import analyticsRoutes from './modules/analytics/analytics.routes.js';
import reportsRoutes from './modules/reports/reports.routes.js';
import auditRoutes from './modules/audit/audit.routes.js';
import { setupSwagger } from './docs/swagger.js';

const app = express();

// --- Security & Parsing Middleware ---
applySecurityMiddleware(app);

// --- Request Tracking ---
app.use(requestId);

// --- Request Logging ---
app.use(requestLogger);

// --- API Documentation ---
setupSwagger(app);

// --- Health Check (outside /api/v1 — no auth needed) ---
app.use(healthRoutes);

// --- API Routes (v1) ---
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/schools', schoolRoutes);
app.use('/api/v1/academic-sessions', academicSessionRoutes);
app.use('/api/v1/classes', classRoutes);
app.use('/api/v1/sections', sectionRoutes);
app.use('/api/v1/subjects', subjectRoutes);
app.use('/api/v1/teacher-assignments', teacherAssignmentRoutes);
app.use('/api/v1/teachers', teacherRoutes);
app.use('/api/v1/parents', parentRoutes);
app.use('/api/v1/student-parent-links', studentParentRoutes);
app.use('/api/v1/students', studentRoutes);
app.use('/api/v1/enrollments', enrollmentRoutes);
app.use('/api/v1/attendance', attendanceRoutes);
app.use('/api/v1/leaves', leaveRoutes);
app.use('/api/v1/timetable', timetableRoutes);
app.use('/api/v1/assignments', assignmentRoutes);
app.use('/api/v1/quizzes', quizRoutes);
app.use('/api/v1/exams', examRoutes);
app.use('/api/v1/results', resultRoutes);
app.use('/api/v1/fees', feeRoutes);
app.use('/api/v1/notices', noticeRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/messages', messageRoutes);
app.use('/api/v1/uploads', uploadRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/reports', reportsRoutes);
app.use('/api/v1/audit-logs', auditRoutes);

// --- 404 Handler (must be after all routes) ---
app.use(notFoundHandler);

// --- Global Error Handler (must be last) ---
app.use(errorHandler);

export default app;
