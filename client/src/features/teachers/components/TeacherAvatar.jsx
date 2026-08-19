import React, { useState } from 'react';
import { cn, getInitials } from '@/lib/utils';
import { UserCheck } from 'lucide-react';

const SIZE_STYLES = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-16 h-16 text-lg',
  xl: 'w-24 h-24 text-2xl',
};

/**
 * TeacherAvatar component with image error handling and initials fallback.
 *
 * @param {object} props
 * @param {string} [props.src] - Avatar URL
 * @param {string} [props.firstName='']
 * @param {string} [props.lastName='']
 * @param {'sm'|'md'|'lg'|'xl'} [props.size='md']
 * @param {string} [props.className]
 */
export function TeacherAvatar({
  src,
  firstName = '',
  lastName = '',
  size = 'md',
  className,
}) {
  const [imageError, setImageError] = useState(false);
  const initials = getInitials(firstName, lastName);
  const sizeClass = SIZE_STYLES[size] || SIZE_STYLES.md;

  if (src && !imageError) {
    return (
      <img
        src={src}
        alt={`${firstName} ${lastName}`.trim() || 'Teacher'}
        onError={() => setImageError(true)}
        className={cn(
          'rounded-full object-cover border border-border shrink-0',
          sizeClass,
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        'rounded-full bg-primary-100 text-primary-700 font-semibold flex items-center justify-center border border-primary-200 shrink-0 select-none',
        sizeClass,
        className
      )}
      aria-hidden="true"
    >
      {initials ? initials : <UserCheck className="w-1/2 h-1/2 text-primary-500" />}
    </div>
  );
}

export default TeacherAvatar;
