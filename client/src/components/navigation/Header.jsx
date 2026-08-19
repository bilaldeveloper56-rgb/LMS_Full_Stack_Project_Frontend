import React from 'react';
import { cn, getInitials } from '@/lib/utils';
import { Menu, LogOut } from 'lucide-react';
import { useIsMobile, useIsDesktop } from '@/hooks/useMediaQuery';
import { useAuth } from '@/features/auth';
import { ROLE_LABELS } from '@/constants';
import { Dropdown, Badge } from '@/components/ui';
import { NotificationBell } from '@/features/notifications/components/NotificationBell';

export function Header({ onMenuClick, pageTitle = '', breadcrumbs = [] }) {
  const isMobile = useIsMobile();
  const isDesktop = useIsDesktop();
  const isCollapsed = !isDesktop && !isMobile;
  const { user, logout } = useAuth();

  const userInitials = user ? getInitials(user.firstName, user.lastName) : 'U';
  const fullName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'User';
  const roleDisplay = user?.role ? (ROLE_LABELS[user.role] || user.role) : '';

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header
      className={cn(
        'fixed top-0 right-0 h-[var(--header-height)] bg-surface border-b border-border z-[calc(var(--z-sticky)-10)] transition-all duration-300 flex items-center justify-between px-4 sm:px-6',
        {
          'left-[var(--sidebar-width)]': isDesktop,
          'left-[var(--sidebar-collapsed-width)]': isCollapsed,
          'left-0': isMobile,
        }
      )}
    >
      <div className="flex items-center">
        {isMobile && (
          <button
            onClick={onMenuClick}
            className="mr-4 p-2 -ml-2 rounded-md text-text-muted hover:text-text-primary hover:bg-surface-muted transition-colors cursor-pointer"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        <div className="flex flex-col">
          {pageTitle && (
            <h1 className="text-lg font-semibold text-text-primary leading-tight">
              {pageTitle}
            </h1>
          )}
          {breadcrumbs.length > 0 && (
            <nav aria-label="Breadcrumb" className="hidden sm:flex text-sm text-text-muted mt-0.5">
              <ol className="flex items-center space-x-2">
                {breadcrumbs.map((crumb, i) => (
                  <li key={i} className="flex items-center">
                    {i > 0 && <span className="mx-2 text-border">/</span>}
                    {crumb.href ? (
                      <a href={crumb.href} className="hover:text-primary-600 transition-colors">
                        {crumb.label}
                      </a>
                    ) : (
                      <span className="text-text-primary font-medium">{crumb.label}</span>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <NotificationBell />

        <div className="relative">
          <Dropdown
            trigger={
              <button
                className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full hover:bg-surface-muted transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer"
                aria-label="User menu"
              >
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary-100 text-primary-700 font-medium text-xs">
                  {userInitials}
                </div>
                {!isMobile && (
                  <div className="text-left mr-1">
                    <span className="block text-xs font-semibold text-text-primary leading-tight">
                      {fullName}
                    </span>
                    {roleDisplay && (
                      <span className="block text-[10px] text-text-muted leading-tight">
                        {roleDisplay}
                      </span>
                    )}
                  </div>
                )}
              </button>
            }
          >
            <div className="px-4 py-3 border-b border-border">
              <p className="text-sm font-semibold text-text-primary truncate">{fullName}</p>
              <p className="text-xs text-text-muted truncate">{user?.email}</p>
              {roleDisplay && (
                <div className="mt-1.5">
                  <Badge variant="info" size="sm">
                    {roleDisplay}
                  </Badge>
                </div>
              )}
            </div>

            <Dropdown.Item
              icon={LogOut}
              onClick={handleLogout}
              className="text-danger-600 hover:text-danger-700 hover:bg-danger-50"
            >
              Sign Out
            </Dropdown.Item>
          </Dropdown>
        </div>
      </div>
    </header>
  );
}

export default Header;
