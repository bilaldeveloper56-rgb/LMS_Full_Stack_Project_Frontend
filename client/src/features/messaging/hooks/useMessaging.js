import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchConversations,
  fetchConversationMessages,
  startConversation,
  sendMessage,
} from '../api/messages.api';
import { useSocket } from '@/hooks/useSocket';
import { useToast } from '@/components/feedback';
import { getErrorMessage } from '@/lib/utils';

export function useConversations(params = {}, options = {}) {
  const queryClient = useQueryClient();
  const { socket } = useSocket();

  const query = useQuery({
    queryKey: ['conversations', params],
    queryFn: () => fetchConversations(params),
    staleTime: 30 * 1000,
    ...options,
  });

  // Real-time listener for incoming messages
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (payload) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      if (payload?.conversationId) {
        queryClient.invalidateQueries({
          queryKey: ['conversation-messages', payload.conversationId],
        });
      }
    };

    socket.on('message:new', handleNewMessage);
    socket.on('message:read', handleNewMessage);

    return () => {
      socket.off('message:new', handleNewMessage);
      socket.off('message:read', handleNewMessage);
    };
  }, [socket, queryClient]);

  return query;
}

export function useConversationMessages(conversationId, params = {}, options = {}) {
  const queryClient = useQueryClient();
  const { socket } = useSocket();

  const query = useQuery({
    queryKey: ['conversation-messages', conversationId, params],
    queryFn: () => fetchConversationMessages(conversationId, params),
    enabled: Boolean(conversationId),
    staleTime: 15 * 1000,
    ...options,
  });

  useEffect(() => {
    if (!socket || !conversationId) return;

    const handleNewMessage = (payload) => {
      if (payload?.conversationId === conversationId) {
        queryClient.invalidateQueries({
          queryKey: ['conversation-messages', conversationId],
        });
      }
    };

    socket.on('message:new', handleNewMessage);

    return () => {
      socket.off('message:new', handleNewMessage);
    };
  }, [socket, conversationId, queryClient]);

  return query;
}

export function useStartConversation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload) => startConversation(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      if (data?.conversation?._id || data?.conversation?.id) {
        const id = data.conversation._id || data.conversation.id;
        queryClient.invalidateQueries({ queryKey: ['conversation-messages', id] });
      }
      toast.success('Conversation started');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

export function useSendMessage(conversationId) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload) => sendMessage(conversationId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['conversation-messages', conversationId] });
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}
