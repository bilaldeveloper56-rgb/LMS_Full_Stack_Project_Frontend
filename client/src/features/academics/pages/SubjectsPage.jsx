import React, { useState } from 'react';
import { Plus, BookOpen, UserCheck, RefreshCw } from 'lucide-react';
import {
  Breadcrumb,
  Button,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Card,
  Pagination,
  Skeleton,
} from '@/components/ui';
import { EmptyState, ErrorState } from '@/components/feedback';
import { SubjectTable } from '../components/SubjectTable';
import { SubjectFormModal } from '../components/SubjectFormModal';
import { TeacherAssignmentTable } from '../components/TeacherAssignmentTable';
import { AssignTeacherModal } from '../components/AssignTeacherModal';
import {
  useSubjects,
  useCreateSubject,
  useUpdateSubject,
  useDeleteSubject,
  useTeacherAssignmentsList,
  useCreateTeacherAssignment,
  useDeleteTeacherAssignment,
} from '../hooks/useAcademics';
import { useAuthorization } from '@/hooks/useAuthorization';
import { PERMISSIONS } from '@/constants';

export function SubjectsPage() {
  const { hasPermission } = useAuthorization();
  const canCreateSubject = hasPermission(PERMISSIONS.SUBJECTS_CREATE);
  const canManageAssignments = hasPermission(PERMISSIONS.TEACHERS_MANAGE);

  const [activeTab, setActiveTab] = useState('subjects');

  /* Subject state */
  const [subjectPage, setSubjectPage] = useState(1);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [subjectToEdit, setSubjectToEdit] = useState(null);

  /* Assignment state */
  const [assignmentPage, setAssignmentPage] = useState(1);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  /* Queries and mutations */
  const {
    data: subjectsData,
    isLoading: isLoadingSubjects,
    isError: isErrorSubjects,
    error: subjectError,
    refetch: refetchSubjects,
    isFetching: isFetchingSubjects,
  } = useSubjects({ page: subjectPage, limit: 10 });

  const {
    data: assignmentsData,
    isLoading: isLoadingAssignments,
    isError: isErrorAssignments,
    error: assignmentError,
    refetch: refetchAssignments,
    isFetching: isFetchingAssignments,
  } = useTeacherAssignmentsList({ page: assignmentPage, limit: 10 });

  const createSubjectMutation = useCreateSubject();
  const updateSubjectMutation = useUpdateSubject(subjectToEdit?._id || subjectToEdit?.id);
  const deleteSubjectMutation = useDeleteSubject();

  const createAssignmentMutation = useCreateTeacherAssignment();
  const deleteAssignmentMutation = useDeleteTeacherAssignment();

  /* Subject handlers */
  const handleOpenCreateSubject = () => {
    setSubjectToEdit(null);
    setIsSubjectModalOpen(true);
  };

  const handleOpenEditSubject = (sub) => {
    setSubjectToEdit(sub);
    setIsSubjectModalOpen(true);
  };

  const handleSubjectSubmit = async (formData) => {
    if (subjectToEdit) {
      await updateSubjectMutation.mutateAsync(formData);
    } else {
      await createSubjectMutation.mutateAsync(formData);
    }
    setIsSubjectModalOpen(false);
    setSubjectToEdit(null);
  };

  const handleDeleteSubject = async (id) => {
    await deleteSubjectMutation.mutateAsync(id);
  };

  /* Assignment handlers */
  const handleAssignmentSubmit = async (formData) => {
    await createAssignmentMutation.mutateAsync(formData);
    setIsAssignModalOpen(false);
  };

  const handleDeleteAssignment = async (id) => {
    await deleteAssignmentMutation.mutateAsync(id);
  };

  const subjects = subjectsData?.subjects || [];
  const subjectPagination = subjectsData?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 };

  const assignments = assignmentsData?.assignments || [];
  const assignmentPagination = assignmentsData?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 };

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Subjects & Allocations' },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            Subjects & Faculty Allocations
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Manage academic subjects catalog, curriculum courses, and instructional teacher assignments
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              refetchSubjects();
              refetchAssignments();
            }}
            isLoading={isFetchingSubjects || isFetchingAssignments}
            leftIcon={RefreshCw}
            aria-label="Refresh subjects"
          >
            Refresh
          </Button>

          {activeTab === 'subjects' && canCreateSubject && (
            <Button
              variant="primary"
              size="sm"
              leftIcon={Plus}
              onClick={handleOpenCreateSubject}
            >
              New Subject
            </Button>
          )}

          {activeTab === 'assignments' && canManageAssignments && (
            <Button
              variant="primary"
              size="sm"
              leftIcon={Plus}
              onClick={() => setIsAssignModalOpen(true)}
            >
              Assign Teacher
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="subjects">
            <BookOpen className="w-4 h-4 mr-2" /> Subjects Catalog ({subjectPagination.total})
          </TabsTrigger>
          <TabsTrigger value="assignments">
            <UserCheck className="w-4 h-4 mr-2" /> Faculty Allocations ({assignmentPagination.total})
          </TabsTrigger>
        </TabsList>

        {/* Subjects Tab */}
        <TabsContent value="subjects">
          {isLoadingSubjects ? (
            <Card className="p-6 space-y-4">
              <div className="space-y-3 animate-pulse">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div key={idx} className="h-10 bg-surface-muted rounded" />
                ))}
              </div>
            </Card>
          ) : isErrorSubjects ? (
            <ErrorState
              title="Failed to load subjects"
              message={subjectError?.message || 'Could not retrieve subject records.'}
              onRetry={refetchSubjects}
            />
          ) : subjects.length === 0 ? (
            <Card className="p-8">
              <EmptyState
                icon={BookOpen}
                title="No Subjects Configured"
                description="Build your institutional curriculum syllabus by creating courses and subjects."
                action={
                  canCreateSubject ? (
                    <Button variant="primary" size="sm" leftIcon={Plus} onClick={handleOpenCreateSubject}>
                      Create First Subject
                    </Button>
                  ) : undefined
                }
              />
            </Card>
          ) : (
            <div className="space-y-4">
              <Card className="overflow-hidden">
                <SubjectTable
                  subjects={subjects}
                  onEdit={handleOpenEditSubject}
                  onDelete={handleDeleteSubject}
                  isDeleting={deleteSubjectMutation.isPending}
                />
              </Card>

              {subjectPagination.totalPages > 1 && (
                <div className="flex justify-center sm:justify-end pt-2">
                  <Pagination
                    currentPage={subjectPagination.page}
                    totalPages={subjectPagination.totalPages}
                    totalItems={subjectPagination.total}
                    pageSize={subjectPagination.limit}
                    onPageChange={setSubjectPage}
                  />
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* Faculty Allocations Tab */}
        <TabsContent value="assignments">
          {isLoadingAssignments ? (
            <Card className="p-6 space-y-4">
              <div className="space-y-3 animate-pulse">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div key={idx} className="h-10 bg-surface-muted rounded" />
                ))}
              </div>
            </Card>
          ) : isErrorAssignments ? (
            <ErrorState
              title="Failed to load teacher assignments"
              message={assignmentError?.message || 'Could not retrieve teacher assignments.'}
              onRetry={refetchAssignments}
            />
          ) : assignments.length === 0 ? (
            <Card className="p-8">
              <EmptyState
                icon={UserCheck}
                title="No Teacher Allocations Found"
                description="Assign teachers to teach specific subjects and sections for the academic term."
                action={
                  canManageAssignments ? (
                    <Button variant="primary" size="sm" leftIcon={Plus} onClick={() => setIsAssignModalOpen(true)}>
                      Assign First Teacher
                    </Button>
                  ) : undefined
                }
              />
            </Card>
          ) : (
            <div className="space-y-4">
              <Card className="overflow-hidden">
                <TeacherAssignmentTable
                  assignments={assignments}
                  onDelete={handleDeleteAssignment}
                  isDeleting={deleteAssignmentMutation.isPending}
                />
              </Card>

              {assignmentPagination.totalPages > 1 && (
                <div className="flex justify-center sm:justify-end pt-2">
                  <Pagination
                    currentPage={assignmentPagination.page}
                    totalPages={assignmentPagination.totalPages}
                    totalItems={assignmentPagination.total}
                    pageSize={assignmentPagination.limit}
                    onPageChange={setAssignmentPage}
                  />
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Subject Modal */}
      <SubjectFormModal
        isOpen={isSubjectModalOpen}
        onClose={() => setIsSubjectModalOpen(false)}
        onSubmit={handleSubjectSubmit}
        initialValues={subjectToEdit}
        isLoading={createSubjectMutation.isPending || updateSubjectMutation.isPending}
      />

      {/* Assign Teacher Modal */}
      <AssignTeacherModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onSubmit={handleAssignmentSubmit}
        isLoading={createAssignmentMutation.isPending}
      />
    </div>
  );
}

export default SubjectsPage;
