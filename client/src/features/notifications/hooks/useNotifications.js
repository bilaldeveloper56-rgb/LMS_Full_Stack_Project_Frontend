import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../api/notifications.api';
import { useSocket } from '@/hooks/useSocket';
import { useToast } from '@/components/feedback';
import { getErrorMessage } from '@/lib/utils';

export function useNotifications(params = {}, options = {}) {
  const queryClient = useQueryClient();
  const { socket } = useSocket();
  const { toast } = useToast();

  const query = useQuery({
    queryKey: ['notifications', params],
    queryFn: () => fetchNotifications(params),
    staleTime: 30 * 1000,
    ...options,
  });

  // Real-time socket listener
  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (notification) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.info(notification.title || 'New Notification', {
        description: notification.message,
      });
    };

    const handleReadNotification = () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    };

    const handleReadAllNotifications = () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    };

    socket.on('notification:new', handleNewNotification);
    socket.on('notification:read', handleReadNotification);
    socket.on('notification:read-all', handleReadAllNotifications);

    return () => {
      socket.off('notification:new', handleNewNotification);
      socket.off('notification:read', handleReadNotification);
      socket.off('notification:read-all', handleReadAllNotifications);
    };
  }, [socket, queryClient, toast]);

  return query;
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id) => markNotificationAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: () => markAllNotificationsAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('All notifications marked as read');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}
