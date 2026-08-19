import React from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  CreditCard,
  CheckSquare,
  FileText,
  Megaphone,
  Clock,
  ArrowRight,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '@/features/auth';
import { DashboardShell } from '../components/DashboardShell';
import { DashboardSection } from '../components/DashboardSection';
import { Card, Button } from '@/components/ui';

export function ParentDashboard() {
  const { user } = useAuth();
  const parentName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'Parent';

  const PARENT_MODULES = [
    {
      title: 'Child Attendance',
      description: 'Track real-time classroom attendance and view leave requests',
      icon: CheckSquare,
      path: '/attendance',
      color: 'bg-success-50 text-success-600',
    },
    {
      title: 'Fee Invoices & Payments',
      description: 'Review fee breakdowns, outstanding dues, and receipts',
      icon: CreditCard,
      path: '/fees',
      color: 'bg-danger-50 text-danger-600',
    },
    {
      title: 'Assignments & Homework',
      description: 'Monitor daily homework tasks and teacher feedback',
      icon: FileText,
      path: '/assignments',
      color: 'bg-primary-50 text-primary-600',
    },
    {
      title: 'Class Schedule',
      description: 'View child weekly timetable, subject periods, and teachers',
      icon: Clock,
      path: '/timetable',
      color: 'bg-info-50 text-info-600',
    },
    {
      title: 'School Circulars & Notices',
      description: 'Stay updated on institutional announcements and events',
      icon: Megaphone,
      path: '/notices',
      color: 'bg-warning-50 text-warning-600',
    },
  ];

  return (
    <DashboardShell
      title={`Welcome, ${parentName}`}
      subtitle="Parent Portal — Track your child's academic progress, attendance, and fee invoices"
      roleLabel="Parent"
    >
      <DashboardSection
        title="Family Academic Overview"
        subtitle="Quick access to student progress monitoring and fee management"
        columns={3}
      >
        {PARENT_MODULES.map((mod) => {
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
                    View Details
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

export default ParentDashboard;
