import type { ISystemSettings } from '@/types';

export function mapSettingsFromApi(s: Record<string, unknown>): ISystemSettings {
  const gp = (s.gradePoints as Record<string, number> | undefined) ?? {};
  const defaultCredit = (s.defaultCreditLimit as ISystemSettings['defaultCreditLimit'] | undefined);
  return {
    id: String(s._id ?? 'settings'),
    currentAcademicYear: String(s.currentAcademicYear ?? ''),
    currentSemester: s.currentSemester === 'spring' ? 'spring' : 'fall',
    isEnrollmentOpen: Boolean(s.isEnrollmentOpen),
    gradePoints: {
      'A+': gp['A+'] ?? 4.0,
      'A': gp['A'] ?? 3.7,
      'B+': gp['B+'] ?? 3.3,
      'B': gp['B'] ?? 3.0,
      'C+': gp['C+'] ?? 2.7,
      'C': gp['C'] ?? 2.3,
      'D': gp['D'] ?? 1.0,
      'F': gp['F'] ?? 0.0,
    },
    defaultCreditLimit: {
      good_standing: defaultCredit?.good_standing ?? 18,
      probation: defaultCredit?.probation ?? 12,
      honors: defaultCredit?.honors ?? 21,
    },
  };
}

export const FALLBACK_SYSTEM_SETTINGS: ISystemSettings = {
  id: 'local',
  currentAcademicYear: '2025-2026',
  currentSemester: 'fall',
  isEnrollmentOpen: false,
  gradePoints: {
    'A+': 4.0,
    'A': 3.7,
    'B+': 3.3,
    'B': 3.0,
    'C+': 2.7,
    'C': 2.3,
    'D': 1.0,
    'F': 0.0,
  },
  defaultCreditLimit: {
    good_standing: 18,
    probation: 12,
    honors: 21,
  },
};
