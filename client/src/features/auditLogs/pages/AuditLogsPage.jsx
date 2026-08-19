import React, { useState } from 'react';
import { Shield, Download } from 'lucide-react';
import { Breadcrumb, Button, Pagination, Badge } from '@/components/ui';
import { ErrorState } from '@/components/feedback';
import { AuditLogFilters } from '../components/AuditLogFilters';
import { AuditLogTable } from '../components/AuditLogTable';
import { AuditLogDetailsModal } from '../components/AuditLogDetailsModal';
import { useAuditLogs } from '../hooks/useAuditLogs';

/**
 * Utility to download formatted audit logs as CSV file.
 * @param {Array<object>} logs
 */
function exportAuditLogsToCsv(logs = []) {
  if (!logs || logs.length === 0) return;

  const headers = ['Timestamp', 'Event', 'EntityType', 'EntityId', 'UserId', 'IpAddress', 'Details'];
  const csvRows = [headers.map((h) => `"${h}"`).join(',')];

  for (const log of logs) {
    const row = [
      log.createdAt ? new Date(log.createdAt).toISOString() : '',
      log.event || '',
      log.entityType || '',
      log.entityId || '',
      log.userId || '',
      log.ipAddress || '',
      log.details ? JSON.stringify(log.details).replace(/"/g, '""') : '',
    ];
    csvRows.push(row.map((val) => `"${val}"`).join(','));
  }

  const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvRows.join('\n'));
  const link = document.createElement('a');
  link.setAttribute('href', csvContent);
  link.setAttribute('download', `audit_logs_${new Date().toISOString().substring(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function AuditLogsPage() {
  const [filters, setFilters] = useState({
    event: '',
    entityType: '',
    entityId: '',
    userId: '',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 50,
  });

  const [selectedLog, setSelectedLog] = useState(null);

  const { data, isLoading, isError, error, refetch } = useAuditLogs(filters);

  const logs = data?.logs || [];
  const pagination = data?.pagination || { page: 1, limit: 50, total: 0, totalPages: 1 };

  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters({
      event: '',
      entityType: '',
      entityId: '',
      userId: '',
      startDate: '',
      endDate: '',
      page: 1,
      limit: 50,
    });
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'System Audit Logs' },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">
              Security & Compliance Audit Ledger
            </h1>
            <Badge variant="primary" size="sm" className="gap-1">
              <Shield className="w-3 h-3" /> Immutable
            </Badge>
          </div>
          <p className="mt-1 text-sm text-text-secondary">
            Read-only chronological record of authentication events, entity modifications, and system mutations
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          leftIcon={Download}
          onClick={() => exportAuditLogsToCsv(logs)}
          disabled={logs.length === 0}
          className="text-xs"
        >
          Export CSV ({logs.length})
        </Button>
      </div>

      {/* Query Filters */}
      <AuditLogFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* Table Content */}
      {isError ? (
        <ErrorState
          title="Failed to retrieve audit logs"
          message={error?.message || 'Could not load compliance audit ledger records.'}
          onRetry={refetch}
        />
      ) : (
        <div className="space-y-4">
          <AuditLogTable
            logs={logs}
            onViewDetails={(log) => setSelectedLog(log)}
            isLoading={isLoading}
          />

          {pagination.totalPages > 1 && (
            <div className="flex justify-center sm:justify-end pt-2">
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                totalItems={pagination.total}
                pageSize={pagination.limit}
                onPageChange={(p) => handleFilterChange({ page: p })}
              />
            </div>
          )}
        </div>
      )}

      {/* Record Inspection Modal */}
      <AuditLogDetailsModal
        log={selectedLog}
        isOpen={Boolean(selectedLog)}
        onClose={() => setSelectedLog(null)}
      />
    </div>
  );
}

export default AuditLogsPage;
