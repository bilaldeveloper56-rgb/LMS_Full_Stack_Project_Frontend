import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { Select } from './Select';

const ITEMS_PER_PAGE_OPTIONS = [
  { label: '10 / page', value: '10' },
  { label: '20 / page', value: '20' },
  { label: '50 / page', value: '50' },
  { label: '100 / page', value: '100' },
];

const Pagination = forwardRef(({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  className,
  ...rest
}, ref) => {
  
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, 'ellipsis', totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, 'ellipsis', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, 'ellipsis', currentPage - 1, currentPage, currentPage + 1, 'ellipsis', totalPages);
      }
    }
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div 
      ref={ref} 
      className={cn('flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t border-border bg-surface', className)}
      {...rest}
    >
      <div className="flex flex-col sm:flex-row items-center w-full sm:w-auto mb-4 sm:mb-0 gap-4 sm:gap-6">
        <span className="text-sm text-text-muted whitespace-nowrap">
          Showing <span className="font-medium text-text-primary">{totalItems === 0 ? 0 : startItem}</span> to <span className="font-medium text-text-primary">{endItem}</span> of <span className="font-medium text-text-primary">{totalItems}</span> results
        </span>
        
        {onPageSizeChange && (
          <div className="flex items-center">
            <Select 
              value={pageSize.toString()} 
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              options={ITEMS_PER_PAGE_OPTIONS}
              className="w-32"
            />
          </div>
        )}
      </div>

      <div className="flex items-center">
        <nav className="isolate inline-flex -space-x-px rounded-md shadow-xs" aria-label="Pagination">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1 || totalPages === 0}
            className="relative inline-flex items-center rounded-l-md px-2 py-2 text-text-muted ring-1 ring-inset ring-border hover:bg-surface-muted focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed transition-base"
          >
            <span className="sr-only">Previous</span>
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          
          {pages.map((page, index) => {
            if (page === 'ellipsis') {
              return (
                <span key={`ellipsis-${index}`} className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-text-primary ring-1 ring-inset ring-border focus:outline-offset-0">
                  <MoreHorizontal className="h-4 w-4 text-text-muted" />
                </span>
              );
            }
            
            const isCurrent = page === currentPage;
            
            return (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                aria-current={isCurrent ? "page" : undefined}
                className={cn(
                  "relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20 focus:outline-offset-0 transition-base ring-1 ring-inset",
                  isCurrent 
                    ? "z-10 bg-primary-600 text-white ring-primary-600 focus-visible:outline-primary-600"
                    : "text-text-primary ring-border hover:bg-surface-muted"
                )}
              >
                {page}
              </button>
            );
          })}
          
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages || totalPages === 0}
            className="relative inline-flex items-center rounded-r-md px-2 py-2 text-text-muted ring-1 ring-inset ring-border hover:bg-surface-muted focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed transition-base"
          >
            <span className="sr-only">Next</span>
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </nav>
      </div>
    </div>
  );
});

Pagination.displayName = 'Pagination';

export { Pagination };
export default Pagination;
