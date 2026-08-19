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
import { ErrorState, EmptyState } from '@/components/feedback';
import { StudentProfile } from '../components/StudentProfile';
import { StudentEnrollmentCard } from '../components/StudentEnrollmentCard';
import { StudentAcademicCard } from '../components/StudentAcademicCard';
import {
  useStudentProfile,
  useStudentAcademic,
  useDeleteStudent,
} from '../hooks/useStudents';
import { useAuthorization } from '@/hooks/useAuthorization';
import { PERMISSIONS } from '@/constants';

export function StudentDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuthorization();

  const canUpdate = hasPermission(PERMISSIONS.STUDENTS_UPDATE);
  const canDelete = hasPermission(PERMISSIONS.STUDENTS_DELETE);

  const [activeTab, setActiveTab] = useState('profile');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const {
    data: student,
    isLoading: isLoadingProfile,
    isError: isErrorProfile,
    error: profileError,
    refetch: refetchProfile,
  } = useStudentProfile(id);

  const {
    data: academicData,
    isLoading: isLoadingAcademic,
  } = useStudentAcademic(id);

  const deleteMutation = useDeleteStudent();

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(id);
      navigate('/students');
    } catch (err) {
      // Handled by hook toast
    }
  };

  const fullName = student
    ? `${student.firstName || ''} ${student.lastName || ''}`.trim() || 'Student'
    : 'Student Profile';

  if (isLoadingProfile) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto animate-pulse" aria-busy="true" aria-label="Loading student profile">
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

  if (isErrorProfile) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <Breadcrumb
          items={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Students', href: '/students' },
            { label: 'Student Details' },
          ]}
        />
        <ErrorState
          title="Student Record Not Found"
          message={profileError?.message || 'Could not retrieve student details from the server.'}
          onRetry={refetchProfile}
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
          { label: 'Students', href: '/students' },
          { label: fullName },
        ]}
      />

      {/* Action Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/students')}
            leftIcon={ArrowLeft}
            className="cursor-pointer"
          >
            Back to Directory
          </Button>
        </div>

        <div className="flex items-center gap-2.5">
          {canUpdate && (
            <Link to={`/students/${id}/edit`}>
              <Button variant="outline" size="sm" leftIcon={Edit}>
                Edit Student
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
          <TabsTrigger value="profile">Profile & Guardians</TabsTrigger>
          <TabsTrigger value="academic">Academic & Subjects</TabsTrigger>
          <TabsTrigger value="enrollments">Enrollment History</TabsTrigger>
        </TabsList>

        {/* Tab 1: Profile & Guardians */}
        <TabsContent value="profile">
          <StudentProfile student={student} />
        </TabsContent>

        {/* Tab 2: Academic & Subjects */}
        <TabsContent value="academic">
          {isLoadingAcademic ? (
            <Card className="p-6 animate-pulse">
              <Skeleton className="h-6 w-48 mb-4" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            </Card>
          ) : (
            <StudentAcademicCard subjects={academicData?.currentSubjects || []} />
          )}
        </TabsContent>

        {/* Tab 3: Enrollment History */}
        <TabsContent value="enrollments">
          {isLoadingAcademic ? (
            <Card className="p-6 animate-pulse">
              <Skeleton className="h-32 w-full" />
            </Card>
          ) : (
            <StudentEnrollmentCard enrollments={academicData?.enrollments || []} />
          )}
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirm Student Deactivation"
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
                The student record will be archived. They will no longer appear on active classroom rosters or fee schedules.
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

export default StudentDetailsPage;
