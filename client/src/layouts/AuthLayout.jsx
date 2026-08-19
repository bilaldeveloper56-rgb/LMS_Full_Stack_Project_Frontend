import React from 'react';
import { Outlet } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';

export function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-surface-muted font-sans text-text-primary">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
        <div className="flex justify-center items-center">
          <GraduationCap className="h-12 w-12 text-primary" />
        </div>
        <h2 className="mt-6 text-3xl font-extrabold text-text-primary tracking-tight">
          EduManager
        </h2>
        <p className="mt-2 text-sm text-text-secondary">
          Enterprise School Management System
        </p>
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
