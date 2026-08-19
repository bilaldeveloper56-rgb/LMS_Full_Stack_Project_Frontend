import React from 'react';
import { Eye, Shield } from 'lucide-react';
import { Button } from '@/components/ui';
import { AuditEventBadge } from './AuditEventBadge';
import { formatDateTime } from '@/lib/utils';

/**
 * AuditLogTable component.
 * @param {object} props
 * @param {Array} props.logs
 * @param {Function} props.onViewDetails
 * @param {boolean} [props.isLoading=false]
 */
export function AuditLogTable({ logs = [], onViewDetails, isLoading = false }) {
  if (isLoading) {
    return (
      <div className="p-8 space-y-3 animate-pulse" aria-busy="true">
        <div className="h-12 bg-surface-muted rounded-lg" />
        <div className="h-12 bg-surface-muted rounded-lg" />
        <div className="h-12 bg-surface-muted rounded-lg" />
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="p-12 text-center text-xs text-text-muted bg-surface rounded-xl border border-border space-y-2">
        <Shield className="w-8 h-8 text-text-muted mx-auto" />
        <div className="font-semibold text-text-primary">No audit log records found</div>
        <p>No compliance or security audit events matched your search criteria.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-2xs">
      <table className="w-full text-left text-xs">
        <thead className="bg-surface-muted/70 text-text-secondary border-b border-border font-semibold uppercase tracking-wider">
          <tr>
            <th className="p-3.5">Timestamp</th>
            <th className="p-3.5">Event Name</th>
            <th className="p-3.5">Target Entity</th>
            <th className="p-3.5">Performed By</th>
            <th className="p-3.5">Origin IP</th>
            <th className="p-3.5 text-right">Details</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {logs.map((log, idx) => {
            const id = log._id || log.id || idx;

            return (
              <tr key={id} className="hover:bg-surface-muted/40 transition-colors">
                <td className="p-3.5 text-text-secondary font-mono whitespace-nowrap">
                  {formatDateTime(log.createdAt)}
                </td>

                <td className="p-3.5">
                  <AuditEventBadge event={log.event} />
                </td>

                <td className="p-3.5">
                  {log.entityType ? (
                    <div>
                      <span className="font-bold text-text-primary">{log.entityType}</span>
                      {log.entityId && (
                        <span className="text-[11px] text-text-muted font-mono block truncate max-w-[140px]">
                          {log.entityId}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-text-muted">—</span>
                  )}
                </td>

                <td className="p-3.5 font-mono text-text-secondary truncate max-w-[160px]">
                  {log.userId || <span className="text-text-muted">System</span>}
                </td>

                <td className="p-3.5 font-mono text-text-muted">
                  {log.ipAddress || '—'}
                </td>

                <td className="p-3.5 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => onViewDetails(log)}
                    title="View Audit Record Details"
                    aria-label="View Audit Record Details"
                  >
                    <Eye className="w-4 h-4 text-text-secondary hover:text-primary-600" />
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default AuditLogTable;
