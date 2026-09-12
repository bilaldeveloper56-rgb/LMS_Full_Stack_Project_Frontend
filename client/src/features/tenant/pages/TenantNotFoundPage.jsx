import React from 'react';
import { School, ArrowRight, Home } from 'lucide-react';
import { Button } from '@/components/ui';

export function TenantNotFoundPage() {
  const platformUrl = 'https://app.lmsprime.online';

  return (
    <div className="min-h-screen bg-surface-muted flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-md w-full bg-surface border border-border shadow-md rounded-2xl p-8 text-center space-y-6">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-danger-50 text-danger-600 flex items-center justify-center shadow-xs">
          <School className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            School Not Found
          </h1>
          <p className="text-sm text-text-secondary leading-relaxed">
            The school URL you entered does not exist or is no longer available on the LMSPrime network.
          </p>
        </div>

        <div className="pt-2 flex flex-col gap-3">
          <a href={platformUrl} className="w-full">
            <Button
              variant="primary"
              size="md"
              className="w-full justify-center"
              rightIcon={ArrowRight}
            >
              Go to LMSPrime Platform
            </Button>
          </a>

          <a href="/" className="w-full">
            <Button
              variant="outline"
              size="md"
              className="w-full justify-center text-text-secondary"
              leftIcon={Home}
            >
              Try Reloading
            </Button>
          </a>
        </div>

        <div className="pt-4 border-t border-border text-xs text-text-muted">
          Looking for your institution's portal? Contact your school administrator to verify your school's official subdomain address.
        </div>
      </div>
    </div>
  );
}

export default TenantNotFoundPage;
