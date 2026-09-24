import React from 'react';
import { RouterProvider } from 'react-router-dom';
import Providers from './providers';
import router from './router';
import { useTenant } from '@/features/tenant/tenant.context';
import { TenantNotFoundPage } from '@/features/tenant/pages/TenantNotFoundPage';
import { LoadingState } from '@/components/feedback';

function AppContent() {
  const { tenant, isNotFound, isLoading } = useTenant();

  React.useEffect(() => {
    if (tenant?.name) {
      document.title = `${tenant.name} | LMSPrime`;
    } else {
      document.title = 'LMSPrime';
    }
  }, [tenant?.name]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen p-8 bg-surface-muted">
        <LoadingState message="Connecting to school portal..." />
      </div>
    );
  }

  if (isNotFound) {
    return <TenantNotFoundPage />;
  }

  return <RouterProvider router={router} />;
}

/**
 * Root application component.
 * Wraps the router with all required providers.
 */
export default function App() {
  return (
    <Providers>
      <AppContent />
    </Providers>
  );
}
