import { Link } from 'react-router-dom';
import { GraduationCap, ArrowRight, BookOpen, Users, BarChart3, Shield } from 'lucide-react';

const FEATURES = [
  {
    icon: Users,
    title: 'Student Management',
    description: 'Complete student lifecycle from admission to graduation with enrollment tracking.',
  },
  {
    icon: BookOpen,
    title: 'Learning Management',
    description: 'Assignments, quizzes, exams, and results with automated grading workflows.',
  },
  {
    icon: BarChart3,
    title: 'Analytics & Reports',
    description: 'Real-time school analytics, attendance reports, and financial insights.',
  },
  {
    icon: Shield,
    title: 'Multi-Tenant & Secure',
    description: 'Complete tenant isolation, RBAC, and audit logging for every operation.',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface-muted flex flex-col">
      {/* Header */}
      <header className="bg-surface border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-text-inverted" />
            </div>
            <span className="text-lg font-semibold text-text-primary tracking-tight">
              EduManager
            </span>
          </div>
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-text-inverted bg-primary-600 rounded-md hover:bg-primary-700 transition-colors duration-[var(--transition-base)]"
          >
            Sign In
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="max-w-2xl">
            <h1 className="text-3xl sm:text-4xl font-bold text-text-primary tracking-tight leading-tight">
              School Administration,{' '}
              <span className="text-primary-600">Simplified</span>
            </h1>
            <p className="mt-4 text-base sm:text-lg text-text-secondary leading-relaxed max-w-xl">
              A comprehensive ERP and Learning Management System designed for modern
              educational institutions. Manage students, academics, fees, and
              communications — all from one platform.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-text-inverted bg-primary-600 rounded-md hover:bg-primary-700 shadow-sm transition-colors duration-[var(--transition-base)]"
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-text-primary bg-surface border border-border rounded-md hover:bg-surface-muted transition-colors duration-[var(--transition-base)]"
              >
                View Demo
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="border-t border-border bg-surface">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <h2 className="text-lg font-semibold text-text-primary mb-8">
              Built for Educational Excellence
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {FEATURES.map((feature) => (
                <div
                  key={feature.title}
                  className="p-5 rounded-lg border border-border-muted bg-surface hover:shadow-sm transition-shadow duration-[var(--transition-base)]"
                >
                  <div className="w-9 h-9 rounded-md bg-primary-50 flex items-center justify-center mb-3">
                    <feature.icon className="w-5 h-5 text-primary-600" />
                  </div>
                  <h3 className="text-sm font-semibold text-text-primary mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-text-muted leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-surface">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-xs text-text-muted text-center">
            &copy; {new Date().getFullYear()} EduManager. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
