import type { ISystemSettings } from '@/types';

export type SettingsSemesterUi = ISystemSettings['currentSemester'];

/**
 * Backend `currentSemester` enum uses `First` / `Second` (see course-offering docs);
 * `phase1_api_docs.md` examples use `fall` / `spring`. Accept both on read.
 */
export function semesterApiToUi(raw: unknown): SettingsSemesterUi {
  const v = String(raw ?? '').trim().toLowerCase();
  if (v === 'spring' || v === 'second' || v === 'summer') return 'spring';
  if (v === 'fall' || v === 'first' || v === 'autumn') return 'fall';
  return 'fall';
}

/** Values accepted by the API validator (Pascal case). */
export function semesterUiToApi(sem: SettingsSemesterUi): 'First' | 'Second' {
  return sem === 'spring' ? 'Second' : 'First';
}

export function mapSettingsFromApi(s: Record<string, unknown>): ISystemSettings {
  const gp = (s.gradePoints as Record<string, number> | undefined) ?? {};
  const defaultCredit = (s.defaultCreditLimit as ISystemSettings['defaultCreditLimit'] | undefined);
  return {
    id: String(s._id ?? 'settings'),
    currentAcademicYear: String(s.currentAcademicYear ?? ''),
    currentSemester: semesterApiToUi(s.currentSemester),
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
