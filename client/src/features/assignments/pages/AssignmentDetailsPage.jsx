import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  BookOpen,
  User,
  Award,
  Edit,
  Send,
  Trash2,
  Paperclip,
  Upload,
  RefreshCw,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
import {
  Breadcrumb,
  Button,
  Card,
  Badge,
  Modal,
} from '@/components/ui';
import { EmptyState, ErrorState } from '@/components/feedback';
import { AssignmentStatusBadge } from '../components/AssignmentStatusBadge';
import { StudentSubmissionModal } from '../components/StudentSubmissionModal';
import { SubmissionsListTable } from '../components/SubmissionsListTable';
import { GradeSubmissionModal } from '../components/GradeSubmissionModal';
import {
  useAssignment,
  useAssignmentSubmissions,
  usePublishAssignment,
  useDeleteAssignment,
  useSubmitAssignment,
  useGradeSubmission,
} from '../hooks/useAssignments';
import { useAuthorization } from '@/hooks/useAuthorization';
import { ROLES, PERMISSIONS } from '@/constants';
import { formatDate } from '@/lib/utils';

export function AssignmentDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, hasPermission } = useAuthorization();

  const isStudent = user?.role === ROLES.STUDENT;
  const canUpdate = hasPermission(PERMISSIONS.ASSIGNMENTS_UPDATE);
  const canDelete = hasPermission(PERMISSIONS.ASSIGNMENTS_DELETE);
  const canGrade = hasPermission(PERMISSIONS.ASSIGNMENTS_GRADE);

  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [submissionToGrade, setSubmissionToGrade] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const { data: assignment, isLoading, isError, error, refetch, isFetching } = useAssignment(id);
  const { data: submissions = [], refetch: refetchSubmissions, isFetching: isFetchingSubmissions } =
    useAssignmentSubmissions(id, { enabled: Boolean(!isStudent && canGrade && id) });

  const publishMutation = usePublishAssignment(id);
  const deleteMutation = useDeleteAssignment();
  const submitMutation = useSubmitAssignment(id);
  const gradeMutation = useGradeSubmission(id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Breadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Assignments', href: '/assignments' }, { label: 'Loading...' }]} />
        <Card className="p-8 text-center text-sm text-text-muted">
          Loading assignment details...
        </Card>
      </div>
    );
  }

  if (isError || !assignment) {
    return (
      <div className="space-y-6">
        <Breadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Assignments', href: '/assignments' }, { label: 'Error' }]} />
        <ErrorState
          title="Failed to load assignment"
          message={error?.message || 'Assignment could not be found or you do not have permission to view it.'}
          onRetry={refetch}
        />
      </div>
    );
  }

  const subjectName = assignment.subjectId?.name || 'Subject';
  const className = assignment.classId?.name || '';
  const sectionName = assignment.sectionId?.name || '';
  const teacherName = assignment.teacherId
    ? `${assignment.teacherId.firstName || ''} ${assignment.teacherId.lastName || ''}`.trim()
    : 'Teacher';
  const isDraft = assignment.status === 'DRAFT';
  const isPastDue = new Date(assignment.dueDate) < new Date();

  // Find student's own submission if available
  const mySubmission = isStudent && submissions?.length > 0 ? submissions[0] : null;

  const handlePublish = async () => {
    await publishMutation.mutateAsync();
  };

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(id);
    navigate('/assignments');
  };

  const handleSubmitWork = async (payload) => {
    await submitMutation.mutateAsync(payload);
  };

  const handleGradeConfirm = async (payload) => {
    await gradeMutation.mutateAsync(payload);
    setSubmissionToGrade(null);
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Assignments', href: '/assignments' },
          { label: assignment.title },
        ]}
      />

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">
              {assignment.title}
            </h1>
            <AssignmentStatusBadge status={assignment.status} size="md" />
          </div>
          <p className="text-sm text-text-secondary">
            {subjectName} • {className} {sectionName ? `(${sectionName})` : ''}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              refetch();
              if (!isStudent) refetchSubmissions();
            }}
            isLoading={isFetching || isFetchingSubmissions}
            leftIcon={RefreshCw}
            aria-label="Refresh assignment"
          >
            Refresh
          </Button>

          {/* Student Turn In Action */}
          {isStudent && assignment.status === 'PUBLISHED' && (
            <Button
              variant="primary"
              size="sm"
              leftIcon={Upload}
              onClick={() => setIsSubmitModalOpen(true)}
            >
              {mySubmission ? 'Resubmit Assignment' : 'Submit Assignment'}
            </Button>
          )}

          {/* Teacher/Admin Actions */}
          {!isStudent && isDraft && canUpdate && (
            <Button
              variant="outline"
              size="sm"
              leftIcon={Send}
              onClick={handlePublish}
              isLoading={publishMutation.isPending}
              className="text-success-700 hover:bg-success-50"
            >
              Publish to Students
            </Button>
          )}

          {!isStudent && canUpdate && (
            <Link to={`/assignments/${id}/edit`}>
              <Button variant="outline" size="sm" leftIcon={Edit}>
                Edit
              </Button>
            </Link>
          )}

          {!isStudent && canDelete && (
            <Button
              variant="outline"
              size="sm"
              leftIcon={Trash2}
              onClick={() => setIsDeleteModalOpen(true)}
              className="text-danger-600 hover:bg-danger-50"
            >
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Main Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Description & Instructions */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 space-y-4">
            <h2 className="text-base font-semibold text-text-primary border-b border-border pb-2">
              Assignment Instructions
            </h2>
            <div className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">
              {assignment.description}
            </div>

            {/* Attached Resources */}
            {assignment.attachments && assignment.attachments.length > 0 && (
              <div className="pt-4 border-t border-border space-y-2">
                <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Resource Materials
                </h3>
                <div className="space-y-1.5">
                  {assignment.attachments.map((att, idx) => (
                    <a
                      key={idx}
                      href={att.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2.5 bg-surface-muted hover:bg-primary-50 rounded-md text-xs text-primary-700 transition-colors border border-border"
                    >
                      <Paperclip className="w-4 h-4 shrink-0" />
                      <span className="font-medium truncate">{att.name}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Submissions Section for Teachers/Admins */}
          {!isStudent && canGrade && (
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div>
                  <h2 className="text-base font-semibold text-text-primary">
                    Student Submissions ({submissions.length})
                  </h2>
                  <p className="text-xs text-text-muted">
                    Review and grade student responses, homework attachments, and awarded marks
                  </p>
                </div>
              </div>

              <SubmissionsListTable
                submissions={submissions}
                maxScore={assignment.maxScore}
                onGrade={(sub) => setSubmissionToGrade(sub)}
              />
            </Card>
          )}
        </div>

        {/* Right Column (1 span): Metadata & Status Cards */}
        <div className="space-y-6">
          {/* Metadata Card */}
          <Card className="p-5 space-y-4">
            <h2 className="text-sm font-semibold text-text-primary border-b border-border pb-2">
              Coursework Metadata
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-text-muted flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" /> Subject
                </span>
                <span className="font-semibold text-text-primary">{subjectName}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-text-muted flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" /> Teacher
                </span>
                <span className="font-semibold text-text-primary">{teacherName}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-text-muted flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5" /> Max Points
                </span>
                <span className="font-bold text-primary-700 text-sm">{assignment.maxScore} pts</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-text-muted flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Due Date
                </span>
                <span className={`font-semibold ${isPastDue ? 'text-danger-600' : 'text-text-primary'}`}>
                  {formatDate(assignment.dueDate)}
                </span>
              </div>

              <div className="pt-2 border-t border-border space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-text-muted">Late Submission</span>
                  <span className="font-medium text-text-primary">
                    {assignment.allowLateSubmission ? 'Allowed' : 'Disallowed'}
                  </span>
                </div>
                {assignment.allowLateSubmission && assignment.lateSubmissionPenaltyPercentage > 0 && (
                  <div className="flex items-center justify-between text-warning-700">
                    <span>Penalty Rate</span>
                    <span className="font-semibold">{assignment.lateSubmissionPenaltyPercentage}%</span>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Student Status Card (if viewed by Student) */}
          {isStudent && (
            <Card className="p-5 space-y-3 bg-primary-50/40 border-primary-200">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-primary-600" />
                <h2 className="text-sm font-bold text-primary-900">Your Submission Status</h2>
              </div>
              <p className="text-xs text-text-secondary">
                {mySubmission
                  ? `Submitted on ${formatDate(mySubmission.submittedAt)}. Status: ${mySubmission.status}`
                  : 'You have not submitted work for this assignment yet.'}
              </p>
              <Button
                variant="primary"
                size="sm"
                className="w-full mt-2"
                onClick={() => setIsSubmitModalOpen(true)}
              >
                {mySubmission ? 'Update / Resubmit' : 'Turn In Work'}
              </Button>
            </Card>
          )}
        </div>
      </div>

      {/* Student Submission Modal */}
      <StudentSubmissionModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onSubmit={handleSubmitWork}
        assignment={assignment}
        existingSubmission={mySubmission}
        isLoading={submitMutation.isPending}
      />

      {/* Teacher Grading Modal */}
      <GradeSubmissionModal
        isOpen={Boolean(submissionToGrade)}
        onClose={() => setSubmissionToGrade(null)}
        onSubmit={handleGradeConfirm}
        submission={submissionToGrade}
        maxScore={assignment.maxScore}
        isLoading={gradeMutation.isPending}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Assignment Deletion"
      >
        <div className="space-y-4">
          <p className="text-sm text-text-primary">
            Are you sure you want to permanently delete{' '}
            <span className="font-bold">{assignment.title}</span>?
          </p>
          <div className="flex justify-end gap-2.5 pt-3 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteModalOpen(false)}
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
              Confirm Deletion
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default AssignmentDetailsPage;
