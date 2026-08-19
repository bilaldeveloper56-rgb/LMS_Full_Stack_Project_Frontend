import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Input, Button } from '@/components/ui';

/**
 * ParentFilters component for searching parent records.
 *
 * @param {object} props
 * @param {object} props.filters
 * @param {Function} props.onFilterChange
 * @param {Function} props.onReset
 */
export function ParentFilters({ filters, onFilterChange, onReset }) {
  const [searchInput, setSearchInput] = useState(filters.search || '');

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== (filters.search || '')) {
        onFilterChange({ search: searchInput || undefined, page: 1 });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput, filters.search, onFilterChange]);

  useEffect(() => {
    setSearchInput(filters.search || '');
  }, [filters.search]);

  const hasActiveFilters = Boolean(filters.search);

  return (
    <div className="bg-surface border border-border rounded-lg p-4 shadow-xs flex items-center justify-between gap-3">
      <div className="max-w-md w-full">
        <Input
          placeholder="Search by parent name, email, or phone..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          leftIcon={Search}
          aria-label="Search parents"
        />
      </div>

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          leftIcon={X}
          className="text-text-muted hover:text-text-primary"
        >
          Clear
        </Button>
      )}
    </div>
  );
}

export default ParentFilters;
