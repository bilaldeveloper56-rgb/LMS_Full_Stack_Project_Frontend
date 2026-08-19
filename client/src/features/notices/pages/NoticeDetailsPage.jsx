import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Pin,
  Calendar,
  User,
  Paperclip,
  ExternalLink,
  Globe,
  Edit3,
  Trash2,
  Clock,
} from 'lucide-react';
import { Breadcrumb, Button, Card } from '@/components/ui';
import { ErrorState } from '@/components/feedback';
import { NoticeStatusBadge } from '../components/NoticeStatusBadge';
import { NoticePriorityBadge } from '../components/NoticePriorityBadge';
import { NoticeAudienceBadge } from '../components/NoticeAudienceBadge';
import { useNotice, usePublishNotice, useDeleteNotice } from '../hooks/useNotices';
import { formatDate } from '@/lib/utils';
import { useAuthorization } from '@/hooks/useAuthorization';
import { PERMISSIONS } from '@/constants';

export function NoticeDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { hasPermission } = useAuthorization();
  const canPublish = hasPermission(PERMISSIONS.NOTICES_PUBLISH);
  const canUpdate = hasPermission(PERMISSIONS.NOTICES_UPDATE);
  const canDelete = hasPermission(PERMISSIONS.NOTICES_DELETE);

  const { data: notice, isLoading, isError, error, refetch } = useNotice(id);
  const publishMutation = usePublishNotice();
  const deleteMutation = useDeleteNotice();

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-4xl animate-pulse" aria-busy="true">
        <div className="h-6 w-48 bg-surface-muted rounded-md" />
        <div className="h-64 bg-surface-muted rounded-xl" />
      </div>
    );
  }

  if (isError || !notice) {
    return (
      <ErrorState
        title="Failed to load notice"
        message={error?.message || 'The requested announcement could not be found.'}
        onRetry={refetch}
      />
    );
  }

  const author = notice.publishedBy || notice.createdBy || {};
  const authorName =
    author.firstName && author.lastName
      ? `${author.firstName} ${author.lastName}`
      : author.name || 'Administration';

  const attachments = notice.attachments || [];

  const handlePublish = async () => {
    await publishMutation.mutateAsync(id);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this notice?')) {
      await deleteMutation.mutateAsync(id);
      navigate('/notices');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Breadcrumbs */}
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Notice Board', href: '/notices' },
          { label: notice.title || 'Notice Details' },
        ]}
      />

      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-4">
        <Link to="/notices">
          <Button variant="ghost" size="sm" leftIcon={ArrowLeft} className="text-xs">
            Back to Notices
          </Button>
        </Link>

        <div className="flex items-center gap-2 flex-wrap">
          {!notice.isPublished && canPublish && (
            <Button
              variant="primary"
              size="sm"
              leftIcon={Globe}
              onClick={handlePublish}
              isLoading={publishMutation.isPending}
            >
              Publish Notice
            </Button>
          )}

          {canUpdate && (
            <Link to={`/notices/${id}/edit`}>
              <Button variant="outline" size="sm" leftIcon={Edit3}>
                Edit
              </Button>
            </Link>
          )}

          {canDelete && (
            <Button
              variant="ghost"
              size="sm"
              leftIcon={Trash2}
              className="text-danger-600 hover:text-danger-700"
              onClick={handleDelete}
              isLoading={deleteMutation.isPending}
            >
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Main Notice Sheet */}
      <Card className={`p-6 sm:p-8 space-y-6 border bg-surface shadow-2xs ${
        notice.isPinned ? 'border-primary-300' : 'border-border'
      }`}>
        {/* Badges & Meta */}
        <div className="space-y-3 border-b border-border pb-5">
          <div className="flex items-center gap-2 flex-wrap">
            {notice.isPinned && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-primary-700 bg-primary-50 px-2.5 py-0.5 rounded-full border border-primary-200">
                <Pin className="w-3.5 h-3.5 fill-current" /> Pinned Announcement
              </span>
            )}
            <NoticePriorityBadge priority={notice.priority} />
            <NoticeAudienceBadge audience={notice.targetAudience} />
            <NoticeStatusBadge isPublished={notice.isPublished} />
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight">
            {notice.title}
          </h1>

          <div className="flex items-center gap-4 text-xs text-text-muted flex-wrap pt-1">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-primary-600" />
              <span>
                {notice.isPublished ? 'Published:' : 'Created:'}{' '}
                <strong className="text-text-secondary">
                  {formatDate(notice.publishedAt || notice.createdAt)}
                </strong>
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <User className="w-4 h-4 text-primary-600" />
              <span>
                Posted By: <strong className="text-text-secondary">{authorName}</strong>
              </span>
            </div>

            {notice.expiresAt && (
              <div className="flex items-center gap-1.5 text-amber-700">
                <Clock className="w-4 h-4" />
                <span>
                  Valid Until: <strong>{formatDate(notice.expiresAt)}</strong>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="prose prose-sm max-w-none text-text-primary text-sm leading-relaxed whitespace-pre-wrap">
          {notice.content}
        </div>

        {/* Attachments */}
        {attachments.length > 0 && (
          <div className="pt-6 border-t border-border space-y-3">
            <h3 className="text-xs font-bold text-text-primary flex items-center gap-1.5">
              <Paperclip className="w-4 h-4 text-primary-600" />
              <span>Attached Documents & Circulars ({attachments.length})</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {attachments.map((att, idx) => (
                <a
                  key={idx}
                  href={att.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl bg-surface-muted border border-border hover:bg-primary-50/40 hover:border-primary-300 transition-all text-xs group"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Paperclip className="w-4 h-4 text-primary-600 shrink-0" />
                    <span className="font-semibold text-text-primary truncate group-hover:text-primary-700">
                      {att.name}
                    </span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-text-muted group-hover:text-primary-700 shrink-0 ml-2" />
                </a>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

export default NoticeDetailsPage;
