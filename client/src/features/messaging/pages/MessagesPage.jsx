import React, { useState } from 'react';
import { ChevronLeft, MessageSquare, User, RefreshCw } from 'lucide-react';
import { Breadcrumb, Button, Badge } from '@/components/ui';
import { ConversationList } from '../components/ConversationList';
import { MessageList } from '../components/MessageList';
import { MessageComposer } from '../components/MessageComposer';
import { StartConversationModal } from '../components/StartConversationModal';
import {
  useConversations,
  useConversationMessages,
  useStartConversation,
  useSendMessage,
} from '../hooks/useMessaging';
import { useAuthorization } from '@/hooks/useAuthorization';
import { getInitials } from '@/lib/utils';
import { ROLE_LABELS } from '@/constants';

export function MessagesPage() {
  const { user } = useAuthorization();
  const currentUserId = user?.id;

  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);

  // Queries & Mutations
  const {
    data: conversationsData,
    isLoading: isLoadingConversations,
    refetch: refetchConversations,
  } = useConversations();

  const {
    data: messagesData,
    isLoading: isLoadingMessages,
  } = useConversationMessages(selectedConversationId);

  const startConversationMutation = useStartConversation();
  const sendMessageMutation = useSendMessage(selectedConversationId);

  const conversations = conversationsData?.conversations || [];
  const messages = messagesData?.messages || [];
  const activeConversation =
    conversations.find(
      (c) => (c._id || c.id) === selectedConversationId
    ) || messagesData?.conversation;

  // Active Partner Details
  const activeParticipants = activeConversation?.participants || [];
  const activePartnerParticipant = activeParticipants.find(
    (p) => (p.userId?._id || p.userId?.id || p.userId)?.toString() !== currentUserId?.toString()
  ) || activeParticipants[0];

  const partnerUser = activePartnerParticipant?.userId || {};
  const partnerName =
    partnerUser.firstName && partnerUser.lastName
      ? `${partnerUser.firstName} ${partnerUser.lastName}`
      : partnerUser.name || activeConversation?.title || 'Chat';

  const partnerRole = activePartnerParticipant?.role || partnerUser.role || '';
  const roleDisplay = ROLE_LABELS[partnerRole] || partnerRole;

  const handleStartConversation = async (data) => {
    const res = await startConversationMutation.mutateAsync(data);
    if (res?.conversation?._id || res?.conversation?.id) {
      setSelectedConversationId(res.conversation._id || res.conversation.id);
    }
  };

  const handleSendMessage = async (payload) => {
    if (selectedConversationId) {
      await sendMessageMutation.mutateAsync(payload);
    }
  };

  return (
    <div className="space-y-4">
      {/* Breadcrumbs */}
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Messages' },
        ]}
      />

      {/* Main Messaging Container */}
      <div className="h-[calc(100vh-12rem)] min-h-[500px] bg-surface rounded-xl border border-border overflow-hidden shadow-xs grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4">
        {/* Left Pane: Conversation List */}
        <div
          className={`${
            selectedConversationId ? 'hidden md:block' : 'block'
          } md:col-span-1 lg:col-span-1 h-full`}
        >
          <ConversationList
            conversations={conversations}
            selectedConversationId={selectedConversationId}
            onSelectConversation={(id) => setSelectedConversationId(id)}
            onOpenNewChat={() => setIsNewChatModalOpen(true)}
            currentUserId={currentUserId}
            isLoading={isLoadingConversations}
          />
        </div>

        {/* Right Pane: Active Thread or Empty Selection */}
        <div
          className={`${
            !selectedConversationId ? 'hidden md:flex' : 'flex'
          } md:col-span-2 lg:col-span-3 flex-col h-full bg-surface-muted/20`}
        >
          {selectedConversationId ? (
            <>
              {/* Active Conversation Header */}
              <div className="p-3.5 bg-surface border-b border-border flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {/* Mobile Back Button */}
                  <button
                    type="button"
                    onClick={() => setSelectedConversationId(null)}
                    className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-muted md:hidden"
                    aria-label="Back to conversations"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  {/* Partner Avatar */}
                  <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs shrink-0">
                    {getInitials(partnerUser.firstName || partnerName, partnerUser.lastName)}
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-text-primary leading-tight">
                      {partnerName}
                    </h3>
                    {roleDisplay && (
                      <Badge variant="neutral" size="sm" className="text-[10px] px-1 py-0 h-4 mt-0.5">
                        {roleDisplay}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => refetchConversations()}
                    aria-label="Refresh conversation"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-text-muted" />
                  </Button>
                </div>
              </div>

              {/* Message List Viewport */}
              <MessageList
                messages={messages}
                currentUserId={currentUserId}
                isLoading={isLoadingMessages}
              />

              {/* Message Composer */}
              <MessageComposer
                onSendMessage={handleSendMessage}
                isLoading={sendMessageMutation.isPending}
              />
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center">
                <MessageSquare className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-bold text-text-primary">
                  Select a Conversation
                </h3>
                <p className="text-xs text-text-muted mt-1 max-w-sm">
                  Choose an existing thread from the left or start a new conversation to communicate securely.
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsNewChatModalOpen(true)}
              >
                Start New Chat
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Start Conversation Modal */}
      <StartConversationModal
        isOpen={isNewChatModalOpen}
        onClose={() => setIsNewChatModalOpen(false)}
        onSubmit={handleStartConversation}
        isLoading={startConversationMutation.isPending}
      />
    </div>
  );
}

export default MessagesPage;
