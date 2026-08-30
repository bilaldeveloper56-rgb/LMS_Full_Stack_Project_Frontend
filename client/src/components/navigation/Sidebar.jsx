import React, { useMemo, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useIsMobile, useIsDesktop } from '@/hooks/useMediaQuery';
import { useAuth } from '@/features/auth';
import { canAccess } from '@/lib/authorization';
import { NAV_GROUPS } from '@/constants';
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  UserCheck,
  Calendar,
  School,
  BookOpen,
  Clock,
  FileText,
  HelpCircle,
  ClipboardList,
  BarChart3,
  CheckSquare,
  CalendarOff,
  CreditCard,
  Megaphone,
  MessageSquare,
  TrendingUp,
  FileBarChart,
  Shield,
  X,
} from 'lucide-react';

const ICON_MAP = {
  LayoutDashboard,
  GraduationCap,
  Users,
  UserCheck,
  Calendar,
  School,
  BookOpen,
  Clock,
  FileText,
  HelpCircle,
  ClipboardList,
  BarChart3,
  CheckSquare,
  CalendarOff,
  CreditCard,
  Megaphone,
  MessageSquare,
  TrendingUp,
  FileBarChart,
  Shield,
};

export function Sidebar({ isOpen, onClose }) {
  const isMobile = useIsMobile();
  const isDesktop = useIsDesktop();
  const isCollapsed = !isDesktop && !isMobile;
  const { user, isLoading } = useAuth();

  // Close sidebar on Escape key press in mobile view
  useEffect(() => {
    if (!isMobile || !isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobile, isOpen, onClose]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isMobile && isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isMobile, isOpen]);

  // Filter navigation groups and items against the user's role and permissions
  const authorizedNavGroups = useMemo(() => {
    if (isLoading || !user) {
      return [];
    }

    return NAV_GROUPS.map((group) => {
      // If group itself has role/permission restrictions, verify them
      if (!canAccess(user, group)) {
        return null;
      }

      // Filter individual items within the group
      const visibleItems = group.items.filter((item) => canAccess(user, item));
      if (visibleItems.length === 0) {
        return null;
      }

      return {
        ...group,
        items: visibleItems,
      };
    }).filter(Boolean);
  }, [user, isLoading]);

  const sidebarClasses = cn(
    'fixed top-0 left-0 h-full bg-surface border-r border-border transition-all duration-300 flex flex-col',
    isMobile
      ? cn(
          'w-[80vw] max-w-xs shadow-lg z-[calc(var(--z-overlay)+10)]',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )
      : cn(
          'z-[var(--z-sticky)] translate-x-0',
          isDesktop ? 'w-[var(--sidebar-width)]' : 'w-[var(--sidebar-collapsed-width)]'
        )
  );

  const renderNavItems = () => {
    if (isLoading) {
      return (
        <div className="space-y-3 px-4 py-2">
          <div className="h-4 bg-surface-muted rounded animate-pulse w-24 mb-4" />
          <div className="h-8 bg-surface-muted rounded animate-pulse" />
          <div className="h-8 bg-surface-muted rounded animate-pulse" />
          <div className="h-8 bg-surface-muted rounded animate-pulse" />
        </div>
      );
    }

    return authorizedNavGroups.map((group, index) => (
      <div key={group.label || index} className="mb-6 last:mb-0">
        {!isCollapsed && (
          <h3 className="px-4 text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
            {group.label}
          </h3>
        )}
        <ul className="space-y-1 px-2">
          {group.items.map((item) => {
            const Icon = ICON_MAP[item.icon] || HelpCircle;
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={isMobile ? onClose : undefined}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors duration-150',
                      isActive
                        ? 'bg-primary-50 text-primary-600 font-semibold'
                        : 'text-text-secondary hover:bg-surface-muted hover:text-text-primary',
                      isCollapsed ? 'justify-center' : 'justify-start'
                    )
                  }
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon className={cn('h-5 w-5 shrink-0', !isCollapsed && 'mr-3')} />
                  {!isCollapsed && <span>{item.label}</span>}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </div>
    ));
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[var(--z-overlay)] animate-fade-in"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside className={sidebarClasses}>
        <div
          className={cn(
            'flex items-center h-[var(--header-height)] border-b border-border shrink-0 px-4',
            isCollapsed ? 'justify-center' : 'justify-between'
          )}
        >
          <div className="flex items-center overflow-hidden">
            <GraduationCap className="h-8 w-8 text-primary-600 shrink-0" />
            {!isCollapsed && (
              <span className="ml-2 font-bold text-lg text-text-primary tracking-tight truncate">
                EduManager
              </span>
            )}
          </div>
          {isMobile && (
            <button
              onClick={onClose}
              className="text-text-muted hover:text-text-primary p-1 rounded-md hover:bg-surface-muted transition-colors cursor-pointer"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto py-4 overflow-x-hidden scrollbar-thin">
          {renderNavItems()}
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;
