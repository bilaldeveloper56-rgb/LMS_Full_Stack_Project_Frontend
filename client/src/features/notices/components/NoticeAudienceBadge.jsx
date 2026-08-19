import React from 'react';
import { Users, GraduationCap, UserCheck, School, Globe } from 'lucide-react';
import { Badge } from '@/components/ui';

const AUDIENCE_CONFIG = {
  ALL: { label: 'Entire School', variant: 'primary', icon: Globe },
  TEACHERS: { label: 'Teachers / Faculty', variant: 'secondary', icon: Users },
  STUDENTS: { label: 'Students', variant: 'success', icon: GraduationCap },
  PARENTS: { label: 'Parents', variant: 'warning', icon: UserCheck },
  CLASS_SPECIFIC: { label: 'Class Specific', variant: 'neutral', icon: School },
};

/**
 * NoticeAudienceBadge component.
 * @param {object} props
 * @param {string} props.audience
 */
export function NoticeAudienceBadge({ audience = 'ALL' }) {
  const config = AUDIENCE_CONFIG[audience] || { label: audience, variant: 'neutral', icon: Users };
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} size="sm" className="gap-1">
      <Icon className="w-3 h-3" />
      <span>{config.label}</span>
    </Badge>
  );
}

export default NoticeAudienceBadge;
