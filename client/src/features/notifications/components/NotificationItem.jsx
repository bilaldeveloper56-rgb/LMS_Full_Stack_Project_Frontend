import React from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  BookOpen,
  HelpCircle,
  ClipboardList,
  CalendarCheck,
  CalendarOff,
  CreditCard,
  Megaphone,
  ShieldAlert,
  Info,
  Check,
} from 'lucide-react';
import { Badge, Button } from '@/components/ui';
import { formatDate } from '@/lib/utils';

const TYPE_ICONS = {
  ASSIGNMENT: BookOpen,
  QUIZ: HelpCircle,
  EXAM: ClipboardList,
  ATTENDANCE: CalendarCheck,
  LEAVE: CalendarOff,
  FEE: CreditCard,
  NOTICE: Megaphone,
  SYSTEM: Info,
  SECURITY: ShieldAlert,
};

const SEVERITY_COLORS = {
  INFO: 'bg-primary-50 text-primary-700',
  SUCCESS: 'bg-success-50 text-success-700',
  WARNING: 'bg-warning-50 text-warning-700',
  CRITICAL: 'bg-danger-50 text-danger-700',
};

/**
 * NotificationItem component.
 *
 * @param {object} props
 * @param {object} props.notification
 * @param {Function} [props.onMarkAsRead]
 * @param {Function} [props.onClick]
 * @param {boolean} [props.compact=false]
 */
export function NotificationItem({
  notification,
  onMarkAsRead,
  onClick,
  compact = false,
}) {
  const id = notification._id || notification.id;
  const IconComponent = TYPE_ICONS[notification.type] || Bell;
  const severityClass = SEVERITY_COLORS[notification.severity] || SEVERITY_COLORS.INFO;

  const handleClick = () => {
    if (!notification.isRead && onMarkAsRead) {
      onMarkAsRead(id);
    }
    if (onClick) {
      onClick(notification);
    }
  };

  const ContentWrapper = notification.linkUrl ? Link : 'div';
  const wrapperProps = notification.linkUrl
    ? { to: notification.linkUrl, onClick: handleClick }
    : { onClick: handleClick };

  return (
    <div
      className={`group relative p-3.5 rounded-lg transition-all border ${
        notification.isRead
          ? 'bg-surface border-border hover:bg-surface-muted/50'
          : 'bg-primary-50/30 border-primary-200 hover:bg-primary-50/60'
      }`}
    >
      <ContentWrapper {...wrapperProps} className="flex items-start gap-3 cursor-pointer">
        {/* Icon */}
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${severityClass}`}
        >
          <IconComponent className="w-4 h-4" />
        </div>

        {/* Text Body */}
        <div className="flex-1 min-w-0 pr-6">
          <div className="flex items-center gap-2">
            <h4
              className={`text-xs font-semibold truncate ${
                notification.isRead ? 'text-text-primary' : 'text-primary-900 font-bold'
              }`}
            >
              {notification.title}
            </h4>
            {!notification.isRead && (
              <span className="w-2 h-2 rounded-full bg-primary-600 shrink-0" />
            )}
          </div>

          <p
            className={`text-xs mt-0.5 text-text-secondary ${
              compact ? 'line-clamp-1' : 'line-clamp-2'
            }`}
          >
            {notification.message}
          </p>

          <span className="text-[11px] text-text-muted mt-1 block">
            {formatDate(notification.createdAt)}
          </span>
        </div>
      </ContentWrapper>

      {/* Mark As Read Action */}
      {!notification.isRead && onMarkAsRead && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onMarkAsRead(id);
          }}
          className="absolute top-3 right-3 p-1 rounded-full text-text-muted hover:text-primary-600 hover:bg-surface transition-colors"
          title="Mark as read"
          aria-label="Mark as read"
        >
          <Check className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

export default NotificationItem;
