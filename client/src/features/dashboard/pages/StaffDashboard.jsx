import React from 'react';
import { Link } from 'react-router-dom';
import {
  Megaphone,
  MessageSquare,
  GraduationCap,
  Calendar,
  ArrowRight,
  Briefcase,
} from 'lucide-react';
import { useAuth } from '@/features/auth';
import { DashboardShell } from '../components/DashboardShell';
import { DashboardSection } from '../components/DashboardSection';
import { Card, Button } from '@/components/ui';

export function StaffDashboard() {
  const { user } = useAuth();
  const name = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'Staff';

  const STAFF_MODULES = [
    {
      title: 'School Circulars & Notices',
      description: 'Review institutional announcements and notifications',
      icon: Megaphone,
      path: '/notices',
      color: 'bg-primary-50 text-primary-600',
    },
    {
      title: 'Internal Messages',
      description: 'Communicate with administrative and faculty staff',
      icon: MessageSquare,
      path: '/messages',
      color: 'bg-info-50 text-info-600',
    },
    {
      title: 'Student Directory',
      description: 'Look up student records and contact information',
      icon: GraduationCap,
      path: '/students',
      color: 'bg-success-50 text-success-600',
    },
    {
      title: 'Academic Calendar',
      description: 'Check active terms, holidays, and school sessions',
      icon: Calendar,
      path: '/academic-sessions',
      color: 'bg-warning-50 text-warning-600',
    },
  ];

  return (
    <DashboardShell
      title={`Welcome, ${name}`}
      subtitle="Staff Portal — Institutional communications, directory, and administrative support"
      roleLabel="Staff"
    >
      <DashboardSection
        title="Staff Workspace"
        subtitle="Quick access to communication and student directory modules"
        columns={2}
      >
        {STAFF_MODULES.map((mod) => {
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

export default StaffDashboard;
