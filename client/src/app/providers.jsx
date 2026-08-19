import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider, ErrorBoundary } from '@/components/feedback';
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
      retry: 1,
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
        <AuthProvider>
          <SocketProvider>
            <ToastProvider>{children}</ToastProvider>
          </SocketProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
