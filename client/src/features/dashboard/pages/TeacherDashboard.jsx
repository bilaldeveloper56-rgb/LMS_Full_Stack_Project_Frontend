import React from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Calendar,
  CheckSquare,
  FileText,
  HelpCircle,
  Clock,
  ArrowRight,
  School,
} from 'lucide-react';
import { useAuth } from '@/features/auth';
import { DashboardShell } from '../components/DashboardShell';
import { DashboardSection } from '../components/DashboardSection';
import { Card, Button } from '@/components/ui';

export function TeacherDashboard() {
  const { user } = useAuth();
  const teacherName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'Teacher';

  const QUICK_ACTIONS = [
    {
      title: 'Classes & Sections',
      description: 'View assigned student cohorts and class rosters',
      icon: School,
      path: '/classes',
      color: 'bg-primary-50 text-primary-600',
    },
    {
      title: 'Daily Attendance',
      description: 'Record and verify student classroom attendance',
      icon: CheckSquare,
      path: '/attendance',
      color: 'bg-success-50 text-success-600',
    },
    {
      title: 'Assignments & Homework',
      description: 'Create, distribute, and grade student assignments',
      icon: FileText,
      path: '/assignments',
      color: 'bg-info-50 text-info-600',
    },
    {
      title: 'Quizzes & Assessments',
      description: 'Manage question banks and student quiz submissions',
      icon: HelpCircle,
      path: '/quizzes',
      color: 'bg-warning-50 text-warning-600',
    },
    {
      title: 'Class Timetable',
      description: 'Review your scheduled weekly teaching periods',
      icon: Clock,
      path: '/timetable',
      color: 'bg-primary-50 text-primary-600',
    },
    {
      title: 'Subject Curriculum',
      description: 'Access assigned subject syllabus and materials',
      icon: BookOpen,
      path: '/subjects',
      color: 'bg-info-50 text-info-600',
    },
  ];

  return (
    <DashboardShell
      title={`Welcome back, ${teacherName}`}
      subtitle="Faculty portal — Manage your classes, attendance, assignments, and curriculum"
      roleLabel="Teacher"
    >
      {/* 1. Quick Workspace Actions */}
      <DashboardSection
        title="Teaching Workspace"
        subtitle="Quick access to your primary instructional modules"
        columns={3}
      >
        {QUICK_ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <Card key={action.title} className="p-5 flex flex-col justify-between hover:border-primary-500/40 transition-colors duration-150">
              <div>
                <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center mb-3`}>
                  <Icon className="w-5 h-5" aria-hidden="true" />
                </div>
                <h3 className="font-semibold text-text-primary text-base">
                  {action.title}
                </h3>
                <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                  {action.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-border">
                <Link to={action.path}>
                  <Button variant="outline" size="sm" className="w-full justify-between cursor-pointer" rightIcon={ArrowRight}>
                    Open Module
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

export default TeacherDashboard;
