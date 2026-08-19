import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui';

/**
 * MessageComposer component.
 *
 * @param {object} props
 * @param {Function} props.onSendMessage
 * @param {boolean} [props.isLoading=false]
 * @param {boolean} [props.disabled=false]
 */
export function MessageComposer({
  onSendMessage,
  isLoading = false,
  disabled = false,
}) {
  const [content, setContent] = useState('');

  const handleSend = (e) => {
    e?.preventDefault();
    if (!content.trim() || isLoading || disabled) return;
    onSendMessage({ content: content.trim() });
    setContent('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <form
      onSubmit={handleSend}
      className="p-3 bg-surface border-t border-border flex items-end gap-2"
    >
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type your message... (Press Enter to send)"
        rows={1}
        disabled={disabled || isLoading}
        className="flex-1 max-h-32 min-h-10 resize-none bg-surface-muted/60 border border-border rounded-xl px-3.5 py-2 text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-surface transition-all placeholder:text-text-muted"
      />

      <Button
        type="submit"
        variant="primary"
        size="sm"
        disabled={!content.trim() || disabled}
        isLoading={isLoading}
        className="h-10 w-10 p-0 rounded-xl shrink-0"
        aria-label="Send message"
      >
        <Send className="w-4 h-4" />
      </Button>
    </form>
  );
}

export default MessageComposer;
