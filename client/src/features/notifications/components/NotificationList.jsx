import React from 'react';
import { Bell } from 'lucide-react';
import { Card } from '@/components/ui';
import { EmptyState } from '@/components/feedback';
import { NotificationItem } from './NotificationItem';

/**
 * NotificationList component.
 *
 * @param {object} props
 * @param {Array} props.notifications
 * @param {Function} [props.onMarkAsRead]
 * @param {boolean} [props.isLoading=false]
 */
export function NotificationList({
  notifications = [],
  onMarkAsRead,
  isLoading = false,
}) {
  if (isLoading) {
    return (
      <div className="space-y-3 animate-pulse" aria-busy="true">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="h-16 bg-surface-muted rounded-lg border border-border" />
        ))}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <Card className="p-8">
        <EmptyState
          icon={Bell}
          title="No Notifications"
          description="You are all caught up! No notifications to display."
        />
      </Card>
    );
  }

  return (
    <div className="space-y-2.5">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification._id || notification.id}
          notification={notification}
          onMarkAsRead={onMarkAsRead}
        />
      ))}
    </div>
  );
}

export default NotificationList;
