import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCheck, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui';
import { NotificationItem } from './NotificationItem';
import {
  useNotifications,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
} from '../hooks/useNotifications';

/**
 * NotificationBell component for the top navigation bar.
 */
export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const { data, isLoading } = useNotifications({ limit: 5 });
  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount ?? 0;

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleMarkAsRead = (id) => {
    markAsReadMutation.mutate(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative p-2 rounded-full text-text-muted hover:text-text-primary hover:bg-surface-muted transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer"
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
        aria-expanded={isOpen}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-danger-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-surface">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-surface rounded-xl shadow-lg border border-border z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          {/* Header */}
          <div className="p-3.5 border-b border-border flex items-center justify-between bg-surface-muted/30">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-text-primary">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-[11px] font-bold rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                isLoading={markAllAsReadMutation.isPending}
                className="h-7 text-xs text-primary-600 hover:text-primary-700 p-1"
                leftIcon={CheckCheck}
              >
                Mark all read
              </Button>
            )}
          </div>

          {/* List of Recent Notifications */}
          <div className="max-h-80 overflow-y-auto p-2 space-y-1.5">
            {isLoading ? (
              <div className="p-4 space-y-2 animate-pulse" aria-busy="true">
                <div className="h-12 bg-surface-muted rounded-md" />
                <div className="h-12 bg-surface-muted rounded-md" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-text-muted">
                No notifications right now.
              </div>
            ) : (
              notifications.map((notif) => (
                <NotificationItem
                  key={notif._id || notif.id}
                  notification={notif}
                  onMarkAsRead={handleMarkAsRead}
                  onClick={() => setIsOpen(false)}
                  compact
                />
              ))
            )}
          </div>

          {/* Footer View All Link */}
          <div className="p-2.5 border-t border-border bg-surface-muted/30 text-center">
            <Link
              to="/notifications"
              onClick={() => setIsOpen(false)}
              className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center justify-center gap-1.5 py-1"
            >
              <span>View all notifications</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
