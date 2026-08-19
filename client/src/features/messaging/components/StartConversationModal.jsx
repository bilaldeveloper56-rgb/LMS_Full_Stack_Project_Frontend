import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MessageSquare, User } from 'lucide-react';
import { Modal, Input, Textarea, Select, Button } from '@/components/ui';
import { startConversationSchema } from '../schemas/message.schema';
import { useTeachers } from '@/features/teachers';
import { useStudents } from '@/features/students';
import { useParents } from '@/features/parents';
import { useAuthorization } from '@/hooks/useAuthorization';
import { ROLES } from '@/constants';
import api from '@/config/api';

/**
 * StartConversationModal component.
 *
 * @param {object} props
 * @param {boolean} props.isOpen
 * @param {Function} props.onClose
 * @param {Function} props.onSubmit
 * @param {boolean} [props.isLoading=false]
 */
export function StartConversationModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}) {
  const { user } = useAuthorization();
  const [usersList, setUsersList] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(startConversationSchema),
    defaultValues: {
      recipientUserId: '',
      title: '',
      initialMessage: '',
    },
  });

  useEffect(() => {
    if (!isOpen) {
      reset();
      return;
    }

    let isMounted = true;
    async function loadRecipients() {
      setIsLoadingUsers(true);
      try {
        // Fetch eligible contacts from users endpoint or role-specific lists
        const res = await api.get('/users', { params: { limit: 100 } });
        const list = res.data?.data?.users || res.data?.data || [];
        if (isMounted) {
          // Exclude self
          setUsersList(
            list.filter((u) => (u._id || u.id)?.toString() !== user?.id?.toString())
          );
        }
      } catch {
        // Fallback: If /users is admin-only, we can fetch teachers
        try {
          const res = await api.get('/teachers', { params: { limit: 100 } });
          const list = res.data?.data?.teachers || [];
          if (isMounted) {
            setUsersList(
              list
                .filter((t) => t.userId && t.userId._id !== user?.id)
                .map((t) => ({
                  _id: t.userId?._id || t.userId,
                  firstName: t.firstName,
                  lastName: t.lastName,
                  role: ROLES.TEACHER,
                }))
            );
          }
        } catch {
          if (isMounted) setUsersList([]);
        }
      } finally {
        if (isMounted) setIsLoadingUsers(false);
      }
    }

    loadRecipients();

    return () => {
      isMounted = false;
    };
  }, [isOpen, reset, user?.id]);

  const handleFormSubmit = async (data) => {
    await onSubmit(data);
    onClose();
  };

  const recipientOptions = [
    { value: '', label: isLoadingUsers ? 'Loading contacts...' : 'Select Recipient' },
    ...usersList.map((u) => {
      const id = u._id || u.id;
      const name = `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email || 'User';
      return {
        value: id,
        label: `${name} (${u.role || 'Member'})`,
      };
    }),
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Start New Conversation"
      className="max-w-md"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        {/* Recipient Selector */}
        <Select
          label="Recipient *"
          options={recipientOptions}
          error={errors.recipientUserId?.message}
          {...register('recipientUserId')}
        />

        {/* Title (Optional) */}
        <Input
          label="Subject / Topic (Optional)"
          placeholder="e.g. Question about Grade 9 Math Homework"
          error={errors.title?.message}
          {...register('title')}
        />

        {/* Initial Message */}
        <Textarea
          label="Initial Message *"
          placeholder="Type your introductory message..."
          rows={4}
          error={errors.initialMessage?.message}
          {...register('initialMessage')}
        />

        <div className="flex justify-end gap-2.5 pt-3 border-t border-border">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isLoading}
          >
            Start Conversation
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default StartConversationModal;
