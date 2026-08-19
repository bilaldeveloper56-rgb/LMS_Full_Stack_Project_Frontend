import React from 'react';
import { User, MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui';
import { getInitials, formatDate } from '@/lib/utils';
import { ROLE_LABELS } from '@/constants';

/**
 * ConversationItem component.
 *
 * @param {object} props
 * @param {object} props.conversation
 * @param {boolean} [props.isSelected=false]
 * @param {Function} props.onClick
 * @param {string} props.currentUserId
 */
export function ConversationItem({
  conversation,
  isSelected = false,
  onClick,
  currentUserId,
}) {
  const participants = conversation.participants || [];
  const otherParticipant =
    participants.find(
      (p) =>
        (p.userId?._id || p.userId?.id || p.userId)?.toString() !== currentUserId?.toString()
    ) || participants[0];

  const currentParticipant = participants.find(
    (p) =>
      (p.userId?._id || p.userId?.id || p.userId)?.toString() === currentUserId?.toString()
  );

  const unreadCount = currentParticipant?.unreadCount || 0;

  const partnerUser = otherParticipant?.userId || {};
  const partnerName =
    partnerUser.firstName && partnerUser.lastName
      ? `${partnerUser.firstName} ${partnerUser.lastName}`
      : partnerUser.name || conversation.title || 'User';

  const partnerRole = otherParticipant?.role || partnerUser.role || '';
  const roleDisplay = ROLE_LABELS[partnerRole] || partnerRole;

  const lastMessage = conversation.lastMessage?.content || 'No messages yet';
  const lastMessageDate = conversation.lastMessage?.sentAt || conversation.updatedAt;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left p-3 rounded-lg transition-all flex items-start gap-3 border ${
        isSelected
          ? 'bg-primary-50/80 border-primary-300 shadow-2xs'
          : 'bg-surface border-border hover:bg-surface-muted/60'
      }`}
    >
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs shrink-0">
        {getInitials(partnerUser.firstName || partnerName, partnerUser.lastName)}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1">
          <h4 className="text-xs font-bold text-text-primary truncate">
            {partnerName}
          </h4>
          {lastMessageDate && (
            <span className="text-[10px] text-text-muted shrink-0">
              {formatDate(lastMessageDate)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 mt-0.5">
          {roleDisplay && (
            <Badge variant="neutral" size="sm" className="text-[10px] px-1 py-0 h-4">
              {roleDisplay}
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 mt-1">
          <p className="text-xs text-text-secondary truncate flex-1">
            {lastMessage}
          </p>
          {unreadCount > 0 && (
            <span className="min-w-4 h-4 px-1 rounded-full bg-primary-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
              {unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

export default ConversationItem;
