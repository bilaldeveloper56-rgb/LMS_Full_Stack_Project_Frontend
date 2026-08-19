import React from 'react';
import { Shield, Clock, User, Globe, Server, Hash } from 'lucide-react';
import { Modal, Button } from '@/components/ui';
import { AuditEventBadge } from './AuditEventBadge';
import { formatDateTime } from '@/lib/utils';

/**
 * AuditLogDetailsModal component.
 * @param {object} props
 * @param {object|null} props.log
 * @param {boolean} props.isOpen
 * @param {Function} props.onClose
 */
export function AuditLogDetailsModal({ log, isOpen, onClose }) {
  if (!log) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Audit Event Record"
      size="lg"
    >
      <div className="space-y-5 text-xs">
        <p className="text-text-secondary text-xs">
          Immutable compliance and security ledger snapshot
        </p>
        {/* Header Event Banner */}
        <div className="flex items-center justify-between p-3.5 bg-surface-muted/60 rounded-xl border border-border flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary-600" />
            <span className="font-bold text-text-primary">Event Type:</span>
            <AuditEventBadge event={log.event} />
          </div>
          <div className="flex items-center gap-1.5 text-text-muted">
            <Clock className="w-3.5 h-3.5" />
            <span>{formatDateTime(log.createdAt)}</span>
          </div>
        </div>

        {/* Core Attributes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-surface border border-border space-y-1">
            <span className="text-[11px] text-text-muted flex items-center gap-1">
              <Hash className="w-3 h-3 text-primary-600" /> Audit Record ID
            </span>
            <div className="font-mono text-text-primary truncate font-semibold">
              {log._id || log.id}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-surface border border-border space-y-1">
            <span className="text-[11px] text-text-muted flex items-center gap-1">
              <User className="w-3 h-3 text-primary-600" /> Performed By (Actor ID)
            </span>
            <div className="font-mono text-text-primary truncate font-semibold">
              {log.userId || 'System / Unauthenticated'}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-surface border border-border space-y-1">
            <span className="text-[11px] text-text-muted flex items-center gap-1">
              <Server className="w-3 h-3 text-primary-600" /> Target Entity
            </span>
            <div className="font-semibold text-text-primary">
              {log.entityType ? (
                <span>
                  {log.entityType}{' '}
                  {log.entityId && <span className="font-mono text-text-muted font-normal">({log.entityId})</span>}
                </span>
              ) : (
                <span className="text-text-muted">None specified</span>
              )}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-surface border border-border space-y-1">
            <span className="text-[11px] text-text-muted flex items-center gap-1">
              <Globe className="w-3 h-3 text-primary-600" /> Client IP & Origin
            </span>
            <div className="font-mono text-text-primary truncate font-semibold">
              {log.ipAddress || 'Internal / Local'}
            </div>
          </div>
        </div>

        {/* User Agent */}
        {log.userAgent && (
          <div className="p-3 rounded-lg bg-surface border border-border space-y-1">
            <span className="text-[11px] text-text-muted block">Client User-Agent</span>
            <div className="font-mono text-[11px] text-text-secondary break-all">
              {log.userAgent}
            </div>
          </div>
        )}

        {/* Structured Details JSON Payload */}
        <div className="space-y-2">
          <span className="font-bold text-text-primary block">
            Metadata Details Payload:
          </span>
          <div className="p-3 bg-surface-muted rounded-xl border border-border overflow-x-auto max-h-64">
            <pre className="font-mono text-[11px] text-text-primary whitespace-pre-wrap leading-relaxed">
              {log.details && Object.keys(log.details).length > 0
                ? JSON.stringify(log.details, null, 2)
                : '// No additional metadata payload recorded for this event'}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t border-border">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close Record
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default AuditLogDetailsModal;
