import React from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Calendar,
  Megaphone,
  FileBarChart,
  ArrowRight,
  Library,
} from 'lucide-react';
import { useAuth } from '@/features/auth';
import { DashboardShell } from '../components/DashboardShell';
import { DashboardSection } from '../components/DashboardSection';
import { Card, Button } from '@/components/ui';

export function LibrarianDashboard() {
  const { user } = useAuth();
  const name = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'Librarian';

  const LIBRARIAN_MODULES = [
    {
      title: 'Book Catalog & Inventory',
      description: 'Manage titles, authors, ISBNs, and book availability',
      icon: BookOpen,
      path: '/library',
      color: 'bg-primary-50 text-primary-600',
    },
    {
      title: 'Academic Sessions',
      description: 'Review active institutional session periods',
      icon: Calendar,
      path: '/academic-sessions',
      color: 'bg-info-50 text-info-600',
    },
    {
      title: 'Institutional Notices',
      description: 'Access school-wide circulars and updates',
      icon: Megaphone,
      path: '/notices',
      color: 'bg-warning-50 text-warning-600',
    },
    {
      title: 'Library Reports',
      description: 'Generate issue and circulation summaries',
      icon: FileBarChart,
      path: '/reports',
      color: 'bg-success-50 text-success-600',
    },
  ];

  return (
    <DashboardShell
      title={`Welcome, ${name}`}
      subtitle="Library Portal — Manage catalog records, book issues, and returns"
      roleLabel="Librarian"
    >
      <DashboardSection
        title="Library Operations"
        subtitle="Quick access to book inventory and circulation modules"
        columns={2}
      >
        {LIBRARIAN_MODULES.map((mod) => {
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

export default LibrarianDashboard;
