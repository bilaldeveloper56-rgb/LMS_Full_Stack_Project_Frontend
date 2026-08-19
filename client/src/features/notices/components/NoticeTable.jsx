import React from 'react';
import { Link } from 'react-router-dom';
import { Pin, Eye, Globe, Edit3, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui';
import { NoticeStatusBadge } from './NoticeStatusBadge';
import { NoticePriorityBadge } from './NoticePriorityBadge';
import { NoticeAudienceBadge } from './NoticeAudienceBadge';
import { formatDate } from '@/lib/utils';
import { useAuthorization } from '@/hooks/useAuthorization';
import { PERMISSIONS } from '@/constants';

/**
 * NoticeTable component.
 * @param {object} props
 * @param {Array} props.notices
 * @param {Function} [props.onPublish]
 * @param {Function} [props.onDelete]
 * @param {boolean} [props.isPublishing=false]
 */
export function NoticeTable({
  notices = [],
  onPublish,
  onDelete,
  isPublishing = false,
}) {
  const { hasPermission } = useAuthorization();
  const canPublish = hasPermission(PERMISSIONS.NOTICES_PUBLISH);
  const canUpdate = hasPermission(PERMISSIONS.NOTICES_UPDATE);
  const canDelete = hasPermission(PERMISSIONS.NOTICES_DELETE);

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-2xs">
      <table className="w-full text-left text-xs">
        <thead className="bg-surface-muted/60 text-text-secondary border-b border-border font-semibold uppercase tracking-wider">
          <tr>
            <th className="p-3.5 w-10"></th>
            <th className="p-3.5">Announcement Title</th>
            <th className="p-3.5">Audience</th>
            <th className="p-3.5">Priority</th>
            <th className="p-3.5">Status</th>
            <th className="p-3.5">Published / Created</th>
            <th className="p-3.5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {notices.map((notice) => {
            const id = notice._id || notice.id;

            return (
              <tr
                key={id}
                className={`hover:bg-surface-muted/40 transition-colors ${
                  notice.isPinned ? 'bg-primary-50/10' : ''
                }`}
              >
                {/* Pin Icon */}
                <td className="p-3.5 text-center">
                  {notice.isPinned && (
                    <Pin className="w-4 h-4 text-primary-600 fill-current inline-block" title="Pinned Announcement" />
                  )}
                </td>

                {/* Title */}
                <td className="p-3.5 font-bold text-text-primary">
                  <Link
                    to={`/notices/${id}`}
                    className="hover:text-primary-600 transition-colors block line-clamp-1"
                  >
                    {notice.title}
                  </Link>
                </td>

                {/* Audience */}
                <td className="p-3.5">
                  <NoticeAudienceBadge audience={notice.targetAudience} />
                </td>

                {/* Priority */}
                <td className="p-3.5">
                  <NoticePriorityBadge priority={notice.priority} />
                </td>

                {/* Status */}
                <td className="p-3.5">
                  <NoticeStatusBadge isPublished={notice.isPublished} />
                </td>

                {/* Date */}
                <td className="p-3.5 text-text-secondary">
                  {formatDate(notice.publishedAt || notice.createdAt)}
                </td>

                {/* Actions */}
                <td className="p-3.5 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Link to={`/notices/${id}`} title="View Notice" aria-label="View Notice">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="w-4 h-4 text-text-secondary" />
                      </Button>
                    </Link>

                    {!notice.isPublished && canPublish && onPublish && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-success-600 hover:text-success-700"
                        title="Publish Notice"
                        aria-label="Publish Notice"
                        onClick={() => onPublish(id)}
                        disabled={isPublishing}
                      >
                        <Globe className="w-4 h-4" />
                      </Button>
                    )}

                    {canUpdate && (
                      <Link to={`/notices/${id}/edit`} title="Edit Notice" aria-label="Edit Notice">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-text-secondary hover:text-primary-600"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                      </Link>
                    )}

                    {canDelete && onDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-danger-600 hover:text-danger-700"
                        title="Delete Notice"
                        aria-label="Delete Notice"
                        onClick={() => onDelete(id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default NoticeTable;
