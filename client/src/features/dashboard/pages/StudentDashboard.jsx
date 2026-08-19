import React from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  CheckSquare,
  FileText,
  HelpCircle,
  Clock,
  CreditCard,
  Megaphone,
  ArrowRight,
  GraduationCap,
} from 'lucide-react';
import { useAuth } from '@/features/auth';
import { DashboardShell } from '../components/DashboardShell';
import { DashboardSection } from '../components/DashboardSection';
import { Card, Button } from '@/components/ui';

export function StudentDashboard() {
  const { user } = useAuth();
  const studentName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'Student';

  const STUDENT_MODULES = [
    {
      title: 'My Assignments',
      description: 'View active homework, submit tasks, and check grades',
      icon: FileText,
      path: '/assignments',
      color: 'bg-primary-50 text-primary-600',
    },
    {
      title: 'Quizzes & Tests',
      description: 'Take published class quizzes and view test scores',
      icon: HelpCircle,
      path: '/quizzes',
      color: 'bg-warning-50 text-warning-600',
    },
    {
      title: 'Class Timetable',
      description: 'Check daily schedule, subject periods, and teachers',
      icon: Clock,
      path: '/timetable',
      color: 'bg-info-50 text-info-600',
    },
    {
      title: 'Attendance Record',
      description: 'Review your monthly attendance history and leaves',
      icon: CheckSquare,
      path: '/attendance',
      color: 'bg-success-50 text-success-600',
    },
    {
      title: 'School Fees',
      description: 'Check invoice balance and payment receipts',
      icon: CreditCard,
      path: '/fees',
      color: 'bg-danger-50 text-danger-600',
    },
    {
      title: 'Announcements',
      description: 'Stay updated with institutional news and circulars',
      icon: Megaphone,
      path: '/notices',
      color: 'bg-neutral-100 text-text-primary',
    },
  ];

  return (
    <DashboardShell
      title={`Welcome, ${studentName}`}
      subtitle="Student Portal — Access your courses, assignments, schedule, and attendance"
      roleLabel="Student"
    >
      <DashboardSection
        title="Student Learning Center"
        subtitle="Quick access to your academic modules and daily schedule"
        columns={3}
      >
        {STUDENT_MODULES.map((mod) => {
          const Icon = mod.icon;
          return (
            <Card key={mod.title} className="p-5 flex flex-col justify-between hover:border-primary-500/40 transition-colors duration-150">
              <div>
                <div className={`w-10 h-10 rounded-lg ${mod.color} flex items-center justify-center mb-3`}>
                  <Icon className="w-5 h-5" aria-hidden="true" />
                </div>
                <h3 className="font-semibold text-text-primary text-base">
                  {mod.title}
                </h3>
                <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                  {mod.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-border">
                <Link to={mod.path}>
                  <Button variant="outline" size="sm" className="w-full justify-between cursor-pointer" rightIcon={ArrowRight}>
                    Open
                  </Button>
                </Link>
              </div>
            </Card>
          );
        })}
      </DashboardSection>
    </DashboardShell>
  );
}

export default StudentDashboard;
