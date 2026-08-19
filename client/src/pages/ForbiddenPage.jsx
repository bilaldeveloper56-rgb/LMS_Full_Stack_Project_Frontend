import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui';

export function ForbiddenPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-surface-muted flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-xl bg-danger-50 border border-danger-200 shadow-xs flex items-center justify-center mx-auto mb-6">
          <ShieldAlert className="w-8 h-8 text-danger-600" />
        </div>

        <h1 className="text-4xl font-bold text-text-primary tracking-tight">
          403
        </h1>

        <h2 className="mt-2 text-lg font-semibold text-text-primary">
          Access Denied
        </h2>

        <p className="mt-2 text-sm text-text-secondary leading-relaxed">
          You do not have the required permissions or role access to view this resource. If you believe this is an error, please contact your institutional administrator.
        </p>

        <div className="mt-8 flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="md"
            onClick={() => navigate(-1)}
            leftIcon={ArrowLeft}
          >
            Go Back
          </Button>

          <Link to="/dashboard">
            <Button
              variant="primary"
              size="md"
              leftIcon={Home}
            >
              Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ForbiddenPage;
