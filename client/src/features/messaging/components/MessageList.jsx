import React, { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';

/**
 * MessageList component.
 *
 * @param {object} props
 * @param {Array} props.messages
 * @param {string} props.currentUserId
 * @param {boolean} [props.isLoading=false]
 */
export function MessageList({
  messages = [],
  currentUserId,
  isLoading = false,
}) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView?.({ behavior: 'smooth' });
  }, [messages.length]);

  if (isLoading) {
    return (
      <div className="flex-1 p-4 space-y-4 animate-pulse overflow-y-auto" aria-busy="true">
        <div className="h-10 bg-surface-muted rounded-xl w-1/2" />
        <div className="h-10 bg-surface-muted rounded-xl w-1/3 ml-auto" />
        <div className="h-12 bg-surface-muted rounded-xl w-2/3" />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-center text-xs text-text-muted">
        No messages yet. Send a message below to start the conversation.
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 overflow-y-auto space-y-1">
      {messages.map((msg) => {
        const id = msg._id || msg.id;
        const senderId = (msg.senderUserId?._id || msg.senderUserId?.id || msg.senderUserId)?.toString();
        const isMe = senderId === currentUserId?.toString();

        return (
          <MessageBubble
            key={id}
            message={msg}
            isMe={isMe}
          />
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}

export default MessageList;
