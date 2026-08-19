import React, { useState } from 'react';
import { Plus, Search, MessageSquare } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { ConversationItem } from './ConversationItem';

/**
 * ConversationList component.
 *
 * @param {object} props
 * @param {Array} props.conversations
 * @param {string} props.selectedConversationId
 * @param {Function} props.onSelectConversation
 * @param {Function} props.onOpenNewChat
 * @param {string} props.currentUserId
 * @param {boolean} [props.isLoading=false]
 */
export function ConversationList({
  conversations = [],
  selectedConversationId,
  onSelectConversation,
  onOpenNewChat,
  currentUserId,
  isLoading = false,
}) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredConversations = conversations.filter((c) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const otherParticipant = (c.participants || []).find(
      (p) =>
        (p.userId?._id || p.userId?.id || p.userId)?.toString() !== currentUserId?.toString()
    );
    const partnerUser = otherParticipant?.userId || {};
    const name = `${partnerUser.firstName || ''} ${partnerUser.lastName || ''} ${partnerUser.name || ''} ${c.title || ''}`.toLowerCase();
    const role = (otherParticipant?.role || '').toLowerCase();
    return name.includes(term) || role.includes(term);
  });

  return (
    <div className="flex flex-col h-full bg-surface border-r border-border">
      {/* Header & New Chat Button */}
      <div className="p-4 border-b border-border flex items-center justify-between gap-2">
        <h2 className="text-base font-bold text-text-primary">Messages</h2>
        <Button
          variant="primary"
          size="sm"
          leftIcon={Plus}
          onClick={onOpenNewChat}
          className="text-xs"
        >
          New Chat
        </Button>
      </div>

      {/* Search Input */}
      <div className="p-3 border-b border-border">
        <Input
          placeholder="Search conversations..."
          leftIcon={Search}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="text-xs"
        />
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {isLoading ? (
          <div className="space-y-2 animate-pulse" aria-busy="true">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="h-16 bg-surface-muted rounded-lg" />
            ))}
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-6 text-center text-xs text-text-muted space-y-2">
            <MessageSquare className="w-8 h-8 text-text-muted mx-auto opacity-50" />
            <p>No conversations found.</p>
            {onOpenNewChat && (
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenNewChat}
                className="text-xs mt-1"
              >
                Start a conversation
              </Button>
            )}
          </div>
        ) : (
          filteredConversations.map((conv) => {
            const id = conv._id || conv.id;
            return (
              <ConversationItem
                key={id}
                conversation={conv}
                isSelected={id === selectedConversationId}
                onClick={() => onSelectConversation(id)}
                currentUserId={currentUserId}
              />
            );
          })
        )}
      </div>
    </div>
  );
}

export default ConversationList;
