import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider, ErrorBoundary } from '@/components/feedback';
import { TenantProvider } from '@/features/tenant/tenant.context';
import { AuthProvider } from '@/features/auth/auth.context';
import { SocketProvider } from '@/providers/SocketProvider';

/**
 * Global query client for TanStack React Query.
 * Configured with sensible defaults for an ERP application.
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error) => {
        if (failureCount >= 1) return false;
        const status = error?.response?.status;
        // Never retry client-side 4xx errors (400, 401, 403, 404, 422, etc.)
        if (status && status >= 400 && status < 500) {
          return false;
        }
        return true;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

/**
 * Application providers wrapper.
 * Wraps children with all required context providers.
 */
export default function Providers({ children }) {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TenantProvider>
          <AuthProvider>
            <SocketProvider>
              <ToastProvider>{children}</ToastProvider>
            </SocketProvider>
          </AuthProvider>
        </TenantProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
