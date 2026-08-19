import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from './Skeleton';

const TableBase = forwardRef(({ 
  className, 
  isLoading = false,
  isError = false,
  isEmpty = false,
  emptyState,
  errorState,
  children,
  ...rest 
}, ref) => {
  return (
    <div className="w-full overflow-x-auto rounded-lg border border-border shadow-xs">
      <table
        ref={ref}
        className={cn('w-full text-sm text-left', className)}
        {...rest}
      >
        {children}
      </table>
      
      {isLoading && (
        <div className="flex flex-col space-y-3 p-4">
          <Skeleton variant="text" className="w-full h-10" />
          <Skeleton variant="text" className="w-full h-10" />
          <Skeleton variant="text" className="w-full h-10" />
        </div>
      )}
      
      {!isLoading && isEmpty && (
        <div className="flex flex-col items-center justify-center p-8 text-center bg-surface">
          {emptyState || <p className="text-text-muted">No data available.</p>}
        </div>
      )}
      
      {!isLoading && isError && (
        <div className="flex flex-col items-center justify-center p-8 text-center bg-surface">
          {errorState || <p className="text-danger-600">Error loading data.</p>}
        </div>
      )}
    </div>
  );
});
TableBase.displayName = 'Table';

export const TableHeader = forwardRef(({ className, children, ...rest }, ref) => (
  <thead
    ref={ref}
    className={cn('bg-surface-muted text-xs uppercase text-text-secondary border-b border-border', className)}
    {...rest}
  >
    {children}
  </thead>
));
TableHeader.displayName = 'Table.Header';

export const TableBody = forwardRef(({ className, children, ...rest }, ref) => (
  <tbody
    ref={ref}
    className={cn('divide-y divide-border bg-surface text-text-primary', className)}
    {...rest}
  >
    {children}
  </tbody>
));
TableBody.displayName = 'Table.Body';

export const TableRow = forwardRef(({ className, ...rest }, ref) => (
  <tr
    ref={ref}
    className={cn('hover:bg-surface-muted transition-fast', className)}
    {...rest}
  />
));
TableRow.displayName = 'Table.Row';

export const TableHead = forwardRef(({ className, children, ...rest }, ref) => (
  <th
    ref={ref}
    scope="col"
    className={cn('px-6 py-3 font-medium tracking-wider', className)}
    {...rest}
  >
    {children}
  </th>
));
TableHead.displayName = 'Table.Head';

export const TableCell = forwardRef(({ className, children, ...rest }, ref) => (
  <td
    ref={ref}
    className={cn('px-6 py-4 whitespace-nowrap', className)}
    {...rest}
  >
    {children}
  </td>
));
TableCell.displayName = 'Table.Cell';

export const Table = Object.assign(TableBase, {
  Header: TableHeader,
  Body: TableBody,
  Row: TableRow,
  Head: TableHead,
  Cell: TableCell,
});

export default Table;
