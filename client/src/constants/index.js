export * from './roles';
export * from './permissions';
export * from './navigation';

export const STATUS_VARIANT_MAP = {
  ACTIVE: 'success',
  INACTIVE: 'neutral',
  PENDING: 'warning',
  PENDING_SETUP: 'warning',
  SUSPENDED: 'danger',
  DISABLED: 'danger',
  INVITED: 'info',
  GRADUATED: 'info',
  TRANSFERRED: 'neutral',
  DROPPED: 'danger',
  PRESENT: 'success',
  ABSENT: 'danger',
  LATE: 'warning',
  EXCUSED: 'info',
  PAID: 'success',
  PARTIAL: 'warning',
  OVERDUE: 'danger',
  CANCELLED: 'neutral',
  APPROVED: 'success',
  REJECTED: 'danger',
  PUBLISHED: 'success',
  DRAFT: 'neutral',
  COMPLETED: 'success',
  SCHEDULED: 'info',
  ONGOING: 'warning',
};

export const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50, 100];
export const DEFAULT_PAGE_SIZE = 10;
