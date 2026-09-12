import React from 'react';
import { Outlet } from 'react-router-dom';
import { GraduationCap, School } from 'lucide-react';
import { useTenant } from '@/features/tenant/tenant.context';

export function AuthLayout() {
  const { tenant } = useTenant();

  const brandName = tenant?.name || 'EduManager';
  const brandSubtitle = tenant?.name
    ? 'Official School Portal'
    : 'Enterprise School Management System';
  const brandLogo = tenant?.logo;

  return (
    <div className="min-h-screen flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-surface-muted font-sans text-text-primary">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
        <div className="flex justify-center items-center">
          {brandLogo ? (
            <img
              src={brandLogo}
              alt={`${brandName} Logo`}
              className="h-14 w-auto max-w-[180px] object-contain rounded-lg"
            />
          ) : tenant ? (
            <div className="w-14 h-14 rounded-2xl bg-primary-100 text-primary-600 flex items-center justify-center shadow-xs">
              <School className="h-8 w-8 text-primary-600" />
            </div>
          ) : (
            <GraduationCap className="h-12 w-12 text-primary" />
          )}
        </div>
        <h2 className="mt-4 text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
          {brandName}
        </h2>
        <p className="mt-1.5 text-sm text-text-secondary">
          {brandSubtitle}
        </p>
        {tenant?.status && tenant.status !== 'ACTIVE' && (
          <div className="mt-3 p-2 rounded-md bg-amber-50 border border-amber-200 text-xs text-amber-800 font-medium">
            Note: Institutional account status is currently {tenant.status}. Access may be restricted.
          </div>
        )}
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-surface py-8 px-4 shadow-sm sm:rounded-lg sm:px-10 border border-border">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
