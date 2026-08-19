import React from 'react';
import { formatDate } from '@/lib/utils';
import { Paperclip } from 'lucide-react';

/**
 * MessageBubble component.
 *
 * @param {object} props
 * @param {object} props.message
 * @param {boolean} props.isMe
 */
export function MessageBubble({ message, isMe }) {
  const sender = message.senderUserId || {};
  const senderName =
    sender.firstName && sender.lastName
      ? `${sender.firstName} ${sender.lastName}`
      : sender.name || 'User';

  return (
    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} mb-3`}>
      {!isMe && (
        <span className="text-[11px] font-semibold text-text-secondary ml-1 mb-1">
          {senderName}
        </span>
      )}

      <div
        className={`max-w-[80%] sm:max-w-md px-4 py-2.5 rounded-2xl text-xs leading-relaxed break-words shadow-2xs ${
          isMe
            ? 'bg-primary-600 text-white rounded-br-none'
            : 'bg-surface border border-border text-text-primary rounded-bl-none'
        }`}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>

        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-2 pt-2 border-t border-white/20 space-y-1">
            {message.attachments.map((att, idx) => (
              <a
                key={idx}
                href={att.url}
                target="_blank"
                rel="noreferrer"
                className={`flex items-center gap-1.5 text-[11px] underline truncate ${
                  isMe ? 'text-white/90 hover:text-white' : 'text-primary-600 hover:text-primary-700'
                }`}
              >
                <Paperclip className="w-3 h-3 shrink-0" />
                <span className="truncate">{att.name}</span>
              </a>
            ))}
          </div>
        )}
      </div>

      <span className="text-[10px] text-text-muted mt-1 px-1">
        {formatDate(message.createdAt)}
      </span>
    </div>
  );
}

export default MessageBubble;
