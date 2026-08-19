import React from 'react';
import { Link } from 'react-router-dom';
import { Pin, Calendar, User, Paperclip, ArrowRight, Globe } from 'lucide-react';
import { Card, Button } from '@/components/ui';
import { NoticeStatusBadge } from './NoticeStatusBadge';
import { NoticePriorityBadge } from './NoticePriorityBadge';
import { NoticeAudienceBadge } from './NoticeAudienceBadge';
import { formatDate } from '@/lib/utils';

/**
 * NoticeCard component.
 * @param {object} props
 * @param {object} props.notice
 * @param {Function} [props.onPublish]
 * @param {boolean} [props.canPublish=false]
 */
export function NoticeCard({ notice, onPublish, canPublish = false }) {
  const id = notice._id || notice.id;
  const author = notice.publishedBy || notice.createdBy || {};
  const authorName =
    author.firstName && author.lastName
      ? `${author.firstName} ${author.lastName}`
      : author.name || 'Administration';

  const attachmentsCount = notice.attachments?.length || 0;

  return (
    <Card className={`p-5 flex flex-col justify-between transition-all hover:shadow-xs border ${
      notice.isPinned ? 'border-primary-300 bg-primary-50/15' : 'border-border bg-surface'
    }`}>
      <div className="space-y-3">
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            {notice.isPinned && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded-full border border-primary-200">
                <Pin className="w-3 h-3 fill-current" /> Pinned
              </span>
            )}
            <NoticePriorityBadge priority={notice.priority} />
            <NoticeAudienceBadge audience={notice.targetAudience} />
          </div>

          <NoticeStatusBadge isPublished={notice.isPublished} />
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-text-primary tracking-tight line-clamp-1">
          {notice.title}
        </h3>

        {/* Content Snippet */}
        <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
          {notice.content}
        </p>

        {/* Metadata */}
        <div className="flex items-center gap-3 text-[11px] text-text-muted pt-1 flex-wrap">
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatDate(notice.publishedAt || notice.createdAt)}</span>
          </div>

          <div className="flex items-center gap-1">
            <User className="w-3.5 h-3.5" />
            <span className="line-clamp-1">{authorName}</span>
          </div>

          {attachmentsCount > 0 && (
            <div className="flex items-center gap-1 text-primary-600 font-semibold">
              <Paperclip className="w-3.5 h-3.5" />
              <span>{attachmentsCount} file{attachmentsCount > 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
        {!notice.isPublished && canPublish && onPublish ? (
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-7 text-success-600 hover:text-success-700 px-2"
            onClick={() => onPublish(id)}
            leftIcon={Globe}
          >
            Publish Now
          </Button>
        ) : (
          <span className="text-[11px] text-text-muted">
            {notice.isPublished ? 'Live Announcement' : 'Draft Only'}
          </span>
        )}

        <Link to={`/notices/${id}`}>
          <Button
            variant="outline"
            size="sm"
            className="text-xs h-7 px-2.5"
            rightIcon={ArrowRight}
          >
            Read Notice
          </Button>
        </Link>
      </div>
    </Card>
  );
}

export default NoticeCard;
