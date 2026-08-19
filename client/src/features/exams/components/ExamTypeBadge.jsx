import React from 'react';
import { Badge } from '@/components/ui';

const TYPE_CONFIG = {
  UNIT_TEST: { label: 'Unit Test', variant: 'info' },
  MID_TERM: { label: 'Mid Term', variant: 'primary' },
  FINAL: { label: 'Final Exam', variant: 'danger' },
  QUIZ: { label: 'Quiz', variant: 'warning' },
  PRACTICAL: { label: 'Practical', variant: 'success' },
  OTHER: { label: 'Exam', variant: 'neutral' },
};

/**
 * ExamTypeBadge component.
 * @param {object} props
 * @param {string} props.type
 */
export function ExamTypeBadge({ type }) {
  const config = TYPE_CONFIG[type] || { label: type || 'Exam', variant: 'neutral' };

  return (
    <Badge variant={config.variant} size="sm">
      {config.label}
    </Badge>
  );
}

export default ExamTypeBadge;
