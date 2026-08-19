import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@/components/feedback';
import {
  useNotices,
  useNotice,
  useCreateNotice,
  usePublishNotice,
  useDeleteNotice,
} from '../hooks/useNotices';
import * as noticeApi from '../api/notices.api';

vi.mock('../api/notices.api', () => ({
  fetchNotices: vi.fn(),
  fetchNoticeById: vi.fn(),
  createNotice: vi.fn(),
  updateNotice: vi.fn(),
  deleteNotice: vi.fn(),
  publishNotice: vi.fn(),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>{children}</ToastProvider>
    </QueryClientProvider>
  );
};

describe('useNotices React Query Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('useNotices and useNotice should fetch announcements', async () => {
    noticeApi.fetchNotices.mockResolvedValue({
      notices: [{ id: 'n1', title: 'Winter Vacation' }],
      pagination: { page: 1, total: 1 },
    });
    noticeApi.fetchNoticeById.mockResolvedValue({ id: 'n1', title: 'Winter Vacation' });

    const { result: listHook } = renderHook(() => useNotices(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(listHook.current.isSuccess).toBe(true));
    expect(listHook.current.data.notices).toHaveLength(1);

    const { result: singleHook } = renderHook(() => useNotice('n1'), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(singleHook.current.isSuccess).toBe(true));
    expect(singleHook.current.data.title).toBe('Winter Vacation');
  });

  it('useCreateNotice, usePublishNotice, and useDeleteNotice should trigger mutations', async () => {
    noticeApi.createNotice.mockResolvedValue({ id: 'n1' });
    noticeApi.publishNotice.mockResolvedValue({ id: 'n1', isPublished: true });
    noticeApi.deleteNotice.mockResolvedValue({ success: true });

    const { result: createHook } = renderHook(() => useCreateNotice(), {
      wrapper: createWrapper(),
    });
    await createHook.current.mutateAsync({ title: 'New' });
    expect(noticeApi.createNotice).toHaveBeenCalledWith({ title: 'New' });

    const { result: pubHook } = renderHook(() => usePublishNotice(), {
      wrapper: createWrapper(),
    });
    await pubHook.current.mutateAsync('n1');
    expect(noticeApi.publishNotice).toHaveBeenCalledWith('n1');

    const { result: delHook } = renderHook(() => useDeleteNotice(), {
      wrapper: createWrapper(),
    });
    await delHook.current.mutateAsync('n1');
    expect(noticeApi.deleteNotice).toHaveBeenCalledWith('n1');
  });
});
