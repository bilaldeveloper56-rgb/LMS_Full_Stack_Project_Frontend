import React, { useState } from 'react';
import { Modal, Button, Select, Textarea } from '@/components/ui';
import { SCHOOL_STATUSES } from '../schemas/school.schema';

/**
 * ChangeStatusModal component.
 * @param {object} props
 * @param {object|null} props.school
 * @param {boolean} props.isOpen
 * @param {Function} props.onClose
 * @param {Function} props.onConfirm
 * @param {boolean} [props.isLoading=false]
 */
export function ChangeStatusModal({
  school,
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}) {
  const [status, setStatus] = useState(school?.status || 'ACTIVE');
  const [reason, setReason] = useState('');

  if (!school) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm({ status, reason: reason.trim() || undefined });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Change School Lifecycle Status"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <p className="text-text-secondary">
          Update the institutional tenant status for <strong>{school.name}</strong> ({school.schoolCode}).
        </p>

        <Select
          label="Lifecycle Status *"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          options={SCHOOL_STATUSES}
        />

        <Textarea
          label="Reason / Administrative Note (Optional)"
          placeholder="e.g. Account suspended due to pending contract renewal or non-compliance"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
        />

        <div className="flex justify-end gap-2 pt-3 border-t border-border">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isLoading}>
            Update Status
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default ChangeStatusModal;
