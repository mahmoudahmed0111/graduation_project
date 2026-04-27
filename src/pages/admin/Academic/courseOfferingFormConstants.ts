import type { GradingPolicy, ScheduleSlot } from '@/services/courseOfferings.service';

export const OFFERING_FORM_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(
  (d) => ({ value: d, label: d })
);

export const OFFERING_SESSION_TYPES: { value: ScheduleSlot['sessionType']; label: string }[] = [
  { value: 'lecture', label: 'Lecture' },
  { value: 'lab', label: 'Lab' },
  { value: 'tutorial', label: 'Tutorial' },
];

export const DEFAULT_GRADING_POLICY: GradingPolicy = {
  attendance: 10,
  midterm: 20,
  assignments: 10,
  project: 10,
  finalExam: 50,
};

export function sumGradingPolicy(p: GradingPolicy): number {
  return p.attendance + p.midterm + p.assignments + p.project + p.finalExam;
}
