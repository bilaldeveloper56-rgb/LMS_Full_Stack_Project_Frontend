import React, { useState } from 'react';
import { CheckCheck, RefreshCw, Filter } from 'lucide-react';
import { Breadcrumb, Button, Card, Pagination, Select } from '@/components/ui';
import { ErrorState } from '@/components/feedback';
import { NotificationList } from '../components/NotificationList';
import {
  useNotifications,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
} from '../hooks/useNotifications';

const NOTIFICATION_TYPES = [
  { value: '', label: 'All Categories' },
  { value: 'ACADEMIC', label: 'Academics' },
  { value: 'ATTENDANCE', label: 'Attendance' },
  { value: 'ASSIGNMENT', label: 'Assignments' },
  { value: 'QUIZ', label: 'Quizzes' },
  { value: 'EXAM', label: 'Exams' },
  { value: 'FEE', label: 'Fees & Invoices' },
  { value: 'LEAVE', label: 'Leaves' },
  { value: 'NOTICE', label: 'School Notices' },
  { value: 'SYSTEM', label: 'System Alerts' },
];

export function NotificationsPage() {
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'UNREAD' | 'READ'
  const [selectedType, setSelectedType] = useState('');
  const [page, setPage] = useState(1);

  const filters = {
    page,
    limit: 15,
    ...(activeTab === 'UNREAD' ? { isRead: false } : activeTab === 'READ' ? { isRead: true } : {}),
    ...(selectedType ? { type: selectedType } : {}),
  };

  const { data, isLoading, isError, error, refetch, isFetching } = useNotifications(filters);
  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount ?? 0;
  const pagination = data?.pagination || { page: 1, limit: 15, total: 0, totalPages: 1 };

  const handleMarkAsRead = (id) => {
    markAsReadMutation.mutate(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Notifications' },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">
              Notifications
            </h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary-100 text-primary-800">
                {unreadCount} Unread
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-text-secondary">
            Stay updated with academic alerts, assignments, quizzes, fees, and attendance notices
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            isLoading={isFetching}
            leftIcon={RefreshCw}
            aria-label="Refresh notifications"
          >
            Refresh
          </Button>

          {unreadCount > 0 && (
            <Button
              variant="primary"
              size="sm"
              leftIcon={CheckCheck}
              onClick={handleMarkAllAsRead}
              isLoading={markAllAsReadMutation.isPending}
            >
              Mark All as Read
            </Button>
          )}
        </div>
      </div>

      {/* Filter Tabs & Category Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-surface p-3 rounded-lg border border-border">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 bg-surface-muted p-1 rounded-md">
          <button
            type="button"
            onClick={() => {
              setActiveTab('ALL');
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'ALL'
                ? 'bg-surface text-primary-700 shadow-2xs'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('UNREAD');
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'UNREAD'
                ? 'bg-surface text-primary-700 shadow-2xs'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            Unread ({unreadCount})
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('READ');
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'READ'
                ? 'bg-surface text-primary-700 shadow-2xs'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            Read
          </button>
        </div>

        {/* Type Select Filter */}
        <div className="w-full sm:w-56">
          <Select
            value={selectedType}
            onChange={(e) => {
              setSelectedType(e.target.value);
              setPage(1);
            }}
            options={NOTIFICATION_TYPES}
          />
        </div>
      </div>

      {/* Content */}
      {isError ? (
        <ErrorState
          title="Failed to load notifications"
          message={error?.message || 'Could not load your notifications.'}
          onRetry={refetch}
        />
      ) : (
        <div className="space-y-4">
          <NotificationList
            notifications={notifications}
            onMarkAsRead={handleMarkAsRead}
            isLoading={isLoading}
          />

          {pagination.totalPages > 1 && (
            <div className="flex justify-center sm:justify-end pt-2">
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                totalItems={pagination.total}
                pageSize={pagination.limit}
                onPageChange={(p) => setPage(p)}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationsPage;
