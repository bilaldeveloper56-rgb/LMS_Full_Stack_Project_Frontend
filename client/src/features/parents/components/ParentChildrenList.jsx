import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, UserMinus, Plus, ShieldCheck } from 'lucide-react';
import {
  Card,
  Button,
  Badge,
  Modal,
} from '@/components/ui';
import { useAuthorization } from '@/hooks/useAuthorization';
import { PERMISSIONS } from '@/constants';

/**
 * ParentChildrenList component for displaying linked student children.
 *
 * @param {object} props
 * @param {Array} props.childrenList - Array of linked student objects
 * @param {Function} props.onLinkClick - Callback to open LinkChildModal
 * @param {Function} props.onUnlink - Callback to unlink a child
 * @param {boolean} [props.isUnlinking=false]
 */
export function ParentChildrenList({
  childrenList = [],
  onLinkClick,
  onUnlink,
  isUnlinking = false,
}) {
  const { hasPermission } = useAuthorization();
  const canUpdate = hasPermission(PERMISSIONS.PARENTS_UPDATE);
  const canDelete = hasPermission(PERMISSIONS.PARENTS_DELETE);

  const [linkToUnlink, setLinkToUnlink] = useState(null);

  const handleConfirmUnlink = async () => {
    if (linkToUnlink && onUnlink) {
      await onUnlink(linkToUnlink.linkId || linkToUnlink._id);
      setLinkToUnlink(null);
    }
  };

  return (
    <>
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h2 className="text-base font-semibold text-text-primary">
              Linked Student Children ({childrenList.length})
            </h2>
            <p className="text-xs text-text-muted mt-0.5">
              Enrolled students associated with this parent/guardian account
            </p>
          </div>

          {canUpdate && (
            <Button
              variant="outline"
              size="sm"
              leftIcon={Plus}
              onClick={onLinkClick}
            >
              Link Student
            </Button>
          )}
        </div>

        {childrenList.length === 0 ? (
          <p className="text-sm text-text-muted text-center py-6">
            No students currently linked to this guardian record.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {childrenList.map((item) => {
              const student = item.student || item;
              const linkId = item._id || item.linkId;
              const studentName = `${student.firstName || ''} ${student.lastName || ''}`.trim() || 'Student';
              const className = student.classId?.name || student.classId?.code || '—';
              const sectionName = student.sectionId?.name || student.sectionId?.code || '';

              return (
                <div
                  key={linkId || student._id}
                  className="bg-surface-muted/50 border border-border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs shrink-0">
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <div>
                        <Link
                          to={`/students/${student._id || student.id}`}
                          className="font-semibold text-text-primary hover:text-primary-600 transition-colors text-sm"
                        >
                          {studentName}
                        </Link>
                        <div className="text-xs text-text-muted">
                          Adm #: {student.admissionNumber}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Badge variant={item.isPrimary ? 'primary' : 'neutral'} size="sm">
                        {item.relationshipType || 'Child'}
                      </Badge>
                    </div>
                  </div>

                  <div className="text-xs text-text-secondary pt-2 border-t border-border/60 flex items-center justify-between">
                    <div>
                      <span className="text-text-muted">Class:</span> {className} {sectionName ? `(${sectionName})` : ''}
                    </div>

                    {canDelete && linkId && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-danger-600 hover:text-danger-700 hover:bg-danger-50 text-xs"
                        onClick={() => setLinkToUnlink({ linkId, studentName })}
                        aria-label={`Unlink ${studentName}`}
                      >
                        <UserMinus className="w-3.5 h-3.5 mr-1" /> Unlink
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Unlink Confirmation Modal */}
      <Modal
        isOpen={Boolean(linkToUnlink)}
        onClose={() => setLinkToUnlink(null)}
        title="Confirm Student Unlinking"
      >
        <div className="space-y-4">
          <p className="text-sm text-text-primary">
            Are you sure you want to remove the guardian relationship for{' '}
            <span className="font-bold">{linkToUnlink?.studentName}</span>?
          </p>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLinkToUnlink(null)}
              disabled={isUnlinking}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleConfirmUnlink}
              isLoading={isUnlinking}
            >
              Confirm Unlink
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default ParentChildrenList;
