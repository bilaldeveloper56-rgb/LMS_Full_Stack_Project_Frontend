import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui';

export function RegisterPage() {
  return (
    <div className="text-center space-y-4">
      <div className="w-12 h-12 rounded-full bg-info-50 text-info-600 flex items-center justify-center mx-auto">
        <ShieldCheck className="h-6 w-6" />
      </div>

      <h2 className="text-xl font-bold text-text-primary tracking-tight">
        Institutional Access
      </h2>

      <p className="text-sm text-text-secondary leading-relaxed">
        EduManager is a multi-tenant institutional platform. User accounts for students, teachers, parents, and administrative staff are issued directly by your school administrator.
      </p>

      <p className="text-xs text-text-muted">
        If you received an invitation email, please follow the activation link provided in the message.
      </p>

      <div className="pt-4">
        <Link to="/login">
          <Button variant="outline" size="md" className="w-full justify-center" leftIcon={ArrowLeft}>
            Back to Sign In
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default RegisterPage;
