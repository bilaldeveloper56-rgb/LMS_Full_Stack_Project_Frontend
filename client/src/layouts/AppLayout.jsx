import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar, Header } from '@/components/navigation';
import { useIsMobile, useIsDesktop } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/utils';
import { NAV_GROUPS } from '@/constants';

export function AppLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  const isDesktop = useIsDesktop();
  const isCollapsed = !isDesktop && !isMobile;
  const location = useLocation();

  // Simple title deduction from path for demonstration
  // In a real app, you might use a route config or custom hook to determine this
  const getPageInfo = () => {
    const path = location.pathname;
    let title = 'Dashboard';
    
    NAV_GROUPS.forEach(group => {
      group.items.forEach(item => {
        if (item.path === path) {
          title = item.label;
        }
      });
    });
    
    return { title };
  };

  const { title } = getPageInfo();

  return (
    <div className="min-h-screen bg-surface-muted flex flex-col font-sans text-text-primary">
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-[var(--z-modal)] bg-primary text-white p-2 rounded-md"
      >
        Skip to main content
      </a>

      <Sidebar 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />
      
      <Header 
        onMenuClick={() => setIsMobileMenuOpen(true)} 
        pageTitle={title}
      />
      
      <div className={cn(
        "flex-1 flex flex-col transition-all duration-300",
        {
          "ml-[var(--sidebar-width)]": isDesktop,
          "ml-[var(--sidebar-collapsed-width)]": isCollapsed,
          "ml-0": isMobile,
        }
      )}>
        <main 
          id="main-content"
          className="flex-1 mt-[var(--header-height)] p-4 sm:p-6 lg:p-8"
        >
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
