import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Edit, Trash2, ArrowLeft, AlertTriangle } from 'lucide-react';
import {
  Breadcrumb,
  Button,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Modal,
  Card,
  Skeleton,
} from '@/components/ui';
import { ErrorState } from '@/components/feedback';
import { TeacherProfileCard } from '../components/TeacherProfileCard';
import { TeacherAssignmentsCard } from '../components/TeacherAssignmentsCard';
import {
  useTeacher,
  useTeacherAssignments,
  useDeleteTeacher,
} from '../hooks/useTeachers';
import { useAuthorization } from '@/hooks/useAuthorization';
import { PERMISSIONS } from '@/constants';

export function TeacherDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuthorization();

  const canUpdate = hasPermission(PERMISSIONS.TEACHERS_UPDATE);
  const canDelete = hasPermission(PERMISSIONS.TEACHERS_DELETE);

  const [activeTab, setActiveTab] = useState('profile');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const {
    data: teacher,
    isLoading: isLoadingTeacher,
    isError: isErrorTeacher,
    error: teacherError,
    refetch: refetchTeacher,
  } = useTeacher(id);

  const {
    data: assignments,
    isLoading: isLoadingAssignments,
  } = useTeacherAssignments(id);

  const deleteMutation = useDeleteTeacher();

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(id);
      navigate('/teachers');
    } catch (err) {
      // Toast handled by hook
    }
  };

  const fullName = teacher
    ? `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim() || 'Teacher'
    : 'Teacher Profile';

  if (isLoadingTeacher) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto animate-pulse" aria-busy="true" aria-label="Loading teacher details">
        <Skeleton className="h-4 w-48" />
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-4">
            <Skeleton variant="circular" className="h-20 w-20" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (isErrorTeacher) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <Breadcrumb
          items={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Teachers', href: '/teachers' },
            { label: 'Teacher Details' },
          ]}
        />
        <ErrorState
          title="Teacher Record Not Found"
          message={teacherError?.message || 'Could not retrieve teacher details from the server.'}
          onRetry={refetchTeacher}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Breadcrumbs */}
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Teachers', href: '/teachers' },
          { label: fullName },
        ]}
      />

      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/teachers')}
            leftIcon={ArrowLeft}
            className="cursor-pointer"
          >
            Back to Directory
          </Button>
        </div>

        <div className="flex items-center gap-2.5">
          {canUpdate && (
            <Link to={`/teachers/${id}/edit`}>
              <Button variant="outline" size="sm" leftIcon={Edit}>
                Edit Teacher
              </Button>
            </Link>
          )}

          {canDelete && (
            <Button
              variant="danger"
              size="sm"
              leftIcon={Trash2}
              onClick={() => setShowDeleteModal(true)}
            >
              Deactivate
            </Button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="profile">Profile & Credentials</TabsTrigger>
          <TabsTrigger value="assignments">Class & Subject Allocations</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <TeacherProfileCard teacher={teacher} />
        </TabsContent>

        <TabsContent value="assignments">
          {isLoadingAssignments ? (
            <Card className="p-6 animate-pulse">
              <Skeleton className="h-6 w-48 mb-4" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            </Card>
          ) : (
            <TeacherAssignmentsCard assignments={assignments || []} />
          )}
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirm Teacher Deactivation"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-danger-50 text-danger-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-text-primary font-medium">
                Are you sure you want to deactivate <span className="font-bold">{fullName}</span>?
              </p>
              <p className="text-xs text-text-muted mt-1">
                The teacher record will be archived. They will be unassigned from active classrooms and teaching rosters.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteModal(false)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDelete}
              isLoading={deleteMutation.isPending}
            >
              Confirm Deactivation
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default TeacherDetailsPage;
