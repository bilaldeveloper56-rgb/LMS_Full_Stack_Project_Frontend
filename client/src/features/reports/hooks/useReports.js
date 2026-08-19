import { useQuery } from '@tanstack/react-query';
import {
  fetchStudentRosterReport,
  fetchAttendanceReport,
  fetchFeeDefaultersReport,
  fetchAcademicReportCard,
} from '../api/reports.api';

/**
 * Filter out empty string properties before passing to API query params.
 */
function cleanParams(params = {}) {
  const cleaned = {};
  for (const [key, value] of Object.entries(params)) {
    if (value !== '' && value !== null && value !== undefined) {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

export function useStudentRosterReport(filters = {}, options = {}) {
  const cleaned = cleanParams(filters);
  return useQuery({
    queryKey: ['reports', 'student-roster', cleaned],
    queryFn: () => fetchStudentRosterReport(cleaned),
    staleTime: 60 * 1000,
    ...options,
  });
}

export function useAttendanceReport(filters = {}, options = {}) {
  const cleaned = cleanParams(filters);
  return useQuery({
    queryKey: ['reports', 'attendance', cleaned],
    queryFn: () => fetchAttendanceReport(cleaned),
    staleTime: 60 * 1000,
    ...options,
  });
}

export function useFeeDefaultersReport(filters = {}, options = {}) {
  const cleaned = cleanParams(filters);
  return useQuery({
    queryKey: ['reports', 'fee-defaulters', cleaned],
    queryFn: () => fetchFeeDefaultersReport(cleaned),
    staleTime: 60 * 1000,
    ...options,
  });
}

export function useAcademicReportCard(filters = {}, options = {}) {
  const cleaned = cleanParams(filters);
  return useQuery({
    queryKey: ['reports', 'report-card', cleaned],
    queryFn: () => fetchAcademicReportCard(cleaned),
    enabled: Boolean(cleaned.studentId),
    staleTime: 60 * 1000,
    ...options,
  });
}
