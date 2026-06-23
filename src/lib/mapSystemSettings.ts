import type { ChatTokenBudgets, ISystemSettings } from '@/types';

/** Phase 7 defaults mirror the budget table + context limits in `phase7_api_doc.md`. */
const DEFAULT_CHAT_TOKEN_BUDGETS: ChatTokenBudgets = {
  student: 50000,
  ta: 100000,
  doctor: 100000,
  collegeAdmin: 200000,
  universityAdmin: 0,
};

/** Coerce an unknown into a finite number, falling back when absent/invalid. */
function toNumber(raw: unknown, fallback: number): number {
  const n = typeof raw === 'string' ? Number(raw) : (raw as number);
  return Number.isFinite(n) ? Number(n) : fallback;
}

function mapChatTokenBudgets(raw: unknown): ChatTokenBudgets {
  const b = (raw as Partial<Record<keyof ChatTokenBudgets, unknown>> | undefined) ?? {};
  return {
    student: toNumber(b.student, DEFAULT_CHAT_TOKEN_BUDGETS.student),
    ta: toNumber(b.ta, DEFAULT_CHAT_TOKEN_BUDGETS.ta),
    doctor: toNumber(b.doctor, DEFAULT_CHAT_TOKEN_BUDGETS.doctor),
    collegeAdmin: toNumber(b.collegeAdmin, DEFAULT_CHAT_TOKEN_BUDGETS.collegeAdmin),
    universityAdmin: toNumber(b.universityAdmin, DEFAULT_CHAT_TOKEN_BUDGETS.universityAdmin),
  };
}

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
    chatHistoryLimit: toNumber(s.chatHistoryLimit, 20),
    chatMaxContextTokens: toNumber(s.chatMaxContextTokens, 8000),
    chatMaxSummarizationCycles: toNumber(s.chatMaxSummarizationCycles, 3),
    chatTokenBudgets: mapChatTokenBudgets(s.chatTokenBudgets),
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
  chatHistoryLimit: 20,
  chatMaxContextTokens: 8000,
  chatMaxSummarizationCycles: 3,
  chatTokenBudgets: { ...DEFAULT_CHAT_TOKEN_BUDGETS },
};
