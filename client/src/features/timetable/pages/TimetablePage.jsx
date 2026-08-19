import React, { useState } from 'react';
import { Plus, Clock, RefreshCw } from 'lucide-react';
import {
  Breadcrumb,
  Button,
  Card,
} from '@/components/ui';
import { EmptyState, ErrorState } from '@/components/feedback';
import { TimetableFilters } from '../components/TimetableFilters';
import { TimetableGrid } from '../components/TimetableGrid';
import { TimetableSlotModal } from '../components/TimetableSlotModal';
import {
  useSectionTimetable,
  useTeacherTimetable,
  useCreateTimetableSlot,
  useUpdateTimetableSlot,
  useDeleteTimetableSlot,
} from '../hooks/useTimetable';
import { useAcademicSessions } from '@/features/academics';
import { useAuthorization } from '@/hooks/useAuthorization';
import { PERMISSIONS } from '@/constants';

export function TimetablePage() {
  const { hasPermission } = useAuthorization();
  const canCreate = hasPermission(PERMISSIONS.TIMETABLE_CREATE);

  const { data: sessionsData } = useAcademicSessions({ limit: 100 });
  const activeSession = sessionsData?.sessions?.find((s) => s.isCurrent) || sessionsData?.sessions?.[0];
  const defaultSessionId = activeSession ? (activeSession._id || activeSession.id) : '';

  const [viewMode, setViewMode] = useState('section'); // 'section' | 'teacher'
  const [filters, setFilters] = useState({
    academicSessionId: '',
    classId: '',
    sectionId: '',
    teacherId: '',
  });

  const effectiveSessionId = filters.academicSessionId || defaultSessionId;

  // Slot modal state
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    slot: null,
    defaultValues: {},
  });

  // Queries for weekly timetable
  const sectionQuery = useSectionTimetable(
    viewMode === 'section' ? filters.sectionId : null,
    { enabled: Boolean(viewMode === 'section' && filters.sectionId) }
  );

  const teacherQuery = useTeacherTimetable(
    viewMode === 'teacher' ? filters.teacherId : null,
    { enabled: Boolean(viewMode === 'teacher' && filters.teacherId) }
  );

  const currentQuery = viewMode === 'section' ? sectionQuery : teacherQuery;
  const slots = currentQuery.data || [];

  const createMutation = useCreateTimetableSlot();
  const updateMutation = useUpdateTimetableSlot(modalConfig.slot?._id || modalConfig.slot?.id);
  const deleteMutation = useDeleteTimetableSlot();

  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleOpenAddModal = (preset = {}) => {
    setModalConfig({
      isOpen: true,
      slot: null,
      defaultValues: {
        academicSessionId: effectiveSessionId,
        classId: filters.classId,
        sectionId: filters.sectionId,
        teacherId: filters.teacherId,
        ...preset,
      },
    });
  };

  const handleOpenEditModal = (slot) => {
    setModalConfig({
      isOpen: true,
      slot,
      defaultValues: {},
    });
  };

  const handleSlotSubmit = async (payload) => {
    if (modalConfig.slot) {
      await updateMutation.mutateAsync(payload);
    } else {
      await createMutation.mutateAsync(payload);
    }
  };

  const handleDeleteSlot = async (id) => {
    await deleteMutation.mutateAsync(id);
  };

  const isSelectionReady =
    viewMode === 'section' ? Boolean(filters.classId && filters.sectionId) : Boolean(filters.teacherId);

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Academic Timetable' },
        ]}
      />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            Academic Schedule & Timetable
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Manage weekly subject periods, classroom allocations, and faculty schedules
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {isSelectionReady && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => currentQuery.refetch()}
              isLoading={currentQuery.isFetching}
              leftIcon={RefreshCw}
              aria-label="Refresh timetable"
            >
              Refresh
            </Button>
          )}

          {canCreate && isSelectionReady && (
            <Button
              variant="primary"
              size="sm"
              leftIcon={Plus}
              onClick={() => handleOpenAddModal()}
            >
              Schedule Period
            </Button>
          )}
        </div>
      </div>

      {/* Filter Toolbar */}
      <TimetableFilters
        viewMode={viewMode}
        onViewModeChange={(mode) => {
          setViewMode(mode);
        }}
        filters={{ ...filters, academicSessionId: effectiveSessionId }}
        onFilterChange={handleFilterChange}
      />

      {/* Content View */}
      {!isSelectionReady ? (
        <Card className="p-10 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center mx-auto">
            <Clock className="w-6 h-6" />
          </div>
          <h2 className="text-base font-semibold text-text-primary">
            {viewMode === 'section'
              ? 'Select Class and Section to View Schedule'
              : 'Select Teacher / Faculty to View Schedule'}
          </h2>
          <p className="text-xs text-text-muted max-w-md mx-auto">
            {viewMode === 'section'
              ? 'Pick an academic session, class, and classroom section from the filter controls above to render the weekly timetable matrix.'
              : 'Pick an academic session and teacher from the filter controls above to view their weekly teaching periods.'}
          </p>
        </Card>
      ) : currentQuery.isLoading ? (
        <Card className="p-8 text-center text-sm text-text-muted">
          Loading weekly schedule matrix...
        </Card>
      ) : currentQuery.isError ? (
        <ErrorState
          title="Failed to load timetable"
          message={currentQuery.error?.message || 'Could not retrieve schedule slots.'}
          onRetry={currentQuery.refetch}
        />
      ) : (
        <div className="space-y-4">
          <TimetableGrid
            slots={slots}
            onAddSlot={handleOpenAddModal}
            onEditSlot={handleOpenEditModal}
            onDeleteSlot={handleDeleteSlot}
            viewMode={viewMode}
          />
        </div>
      )}

      {/* Slot Modal */}
      <TimetableSlotModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ isOpen: false, slot: null, defaultValues: {} })}
        onSubmit={handleSlotSubmit}
        slot={modalConfig.slot}
        defaultValues={modalConfig.defaultValues}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}

export default TimetablePage;
