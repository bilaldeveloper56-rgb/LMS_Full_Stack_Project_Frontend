import React from 'react';
import { Outlet } from 'react-router-dom';

export function MinimalLayout() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-surface-muted font-sans text-text-primary">
      <main className="w-full max-w-7xl mx-auto">
        <Outlet />
      </main>
    </div>
  );
}

export default MinimalLayout;
