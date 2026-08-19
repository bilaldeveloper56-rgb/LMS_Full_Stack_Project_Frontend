import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@/components/feedback';
import {
  useSectionTimetable,
  useTeacherTimetable,
  useCreateTimetableSlot,
  useDeleteTimetableSlot,
} from '../hooks/useTimetable';
import * as timetableApi from '../api/timetable.api';

vi.mock('../api/timetable.api', () => ({
  fetchTimetableSlots: vi.fn(),
  fetchSectionTimetable: vi.fn(),
  fetchTeacherTimetable: vi.fn(),
  fetchTimetableById: vi.fn(),
  createTimetableSlot: vi.fn(),
  updateTimetableSlot: vi.fn(),
  deleteTimetableSlot: vi.fn(),
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

describe('useTimetable React Query Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('useSectionTimetable should fetch slots for section', async () => {
    timetableApi.fetchSectionTimetable.mockResolvedValue([
      { id: 'tt1', dayOfWeek: 'MONDAY', periodNumber: 1 },
    ]);

    const { result } = renderHook(() => useSectionTimetable('sec1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
  });

  it('useCreateTimetableSlot should call create mutation', async () => {
    timetableApi.createTimetableSlot.mockResolvedValue({ id: 'tt1' });
    const { result } = renderHook(() => useCreateTimetableSlot(), { wrapper: createWrapper() });

    await result.current.mutateAsync({ dayOfWeek: 'MONDAY', periodNumber: 1 });
    expect(timetableApi.createTimetableSlot).toHaveBeenCalled();
  });
});
