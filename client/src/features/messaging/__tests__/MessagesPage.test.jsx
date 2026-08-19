import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@/components/feedback';
import { MessagesPage } from '../pages/MessagesPage';
import * as msgApi from '../api/messages.api';
import * as authContextModule from '@/features/auth/auth.context';
import { ROLES, PERMISSIONS } from '@/constants';

vi.mock('../api/messages.api', () => ({
  fetchConversations: vi.fn(),
  fetchConversationMessages: vi.fn(),
  startConversation: vi.fn(),
  sendMessage: vi.fn(),
}));

vi.mock('@/hooks/useSocket', () => ({
  useSocket: () => ({
    socket: { on: vi.fn(), off: vi.fn(), emit: vi.fn() },
    isConnected: true,
  }),
}));

const renderWithProviders = (ui) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <MemoryRouter>{ui}</MemoryRouter>
      </ToastProvider>
    </QueryClientProvider>
  );
};

describe('MessagesPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(authContextModule, 'useAuth').mockReturnValue({
      user: {
        id: 'u1',
        role: ROLES.STUDENT,
        permissions: [PERMISSIONS.MESSAGES_READ, PERMISSIONS.MESSAGES_CREATE],
      },
      isAuthenticated: true,
      isLoading: false,
    });

    msgApi.fetchConversations.mockResolvedValue({
      conversations: [
        {
          _id: 'conv1',
          id: 'conv1',
          title: 'Math Class Discussion',
          participants: [
            { userId: { _id: 'u1', firstName: 'John', lastName: 'Doe' }, role: 'STUDENT', unreadCount: 0 },
            { userId: { _id: 'u2', firstName: 'Jane', lastName: 'Smith' }, role: 'TEACHER', unreadCount: 0 },
          ],
          lastMessage: { content: 'Please submit your draft', sentAt: new Date().toISOString() },
        },
      ],
      pagination: { page: 1, total: 1 },
    });

    msgApi.fetchConversationMessages.mockResolvedValue({
      messages: [
        {
          _id: 'm1',
          id: 'm1',
          senderUserId: { _id: 'u2', firstName: 'Jane', lastName: 'Smith' },
          senderRole: 'TEACHER',
          content: 'Please submit your draft',
          createdAt: new Date().toISOString(),
        },
      ],
      conversation: {
        _id: 'conv1',
        title: 'Math Class Discussion',
        participants: [
          { userId: { _id: 'u1', firstName: 'John', lastName: 'Doe' }, role: 'STUDENT' },
          { userId: { _id: 'u2', firstName: 'Jane', lastName: 'Smith' }, role: 'TEACHER' },
        ],
      },
      pagination: { page: 1, total: 1 },
    });

    msgApi.sendMessage.mockResolvedValue({
      _id: 'm2',
      content: 'I have uploaded it now',
    });
  });

  it('should render conversations list, load thread messages, and send a reply', async () => {
    renderWithProviders(<MessagesPage />);

    // 1. Conversation item exists in sidebar
    expect(await screen.findByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Please submit your draft')).toBeInTheDocument();

    // 2. Click conversation to view thread
    fireEvent.click(screen.getByText('Jane Smith'));

    // 3. Active messages pane should display message
    expect(await screen.findByText('Please submit your draft')).toBeInTheDocument();

    // 4. Send reply
    const input = screen.getByPlaceholderText(/Type your message.../i);
    fireEvent.change(input, { target: { value: 'I have uploaded it now' } });

    const sendBtn = screen.getByRole('button', { name: /Send message/i });
    fireEvent.click(sendBtn);

    await waitFor(() => {
      expect(msgApi.sendMessage).toHaveBeenCalledWith('conv1', { content: 'I have uploaded it now' });
    });
  });
});
