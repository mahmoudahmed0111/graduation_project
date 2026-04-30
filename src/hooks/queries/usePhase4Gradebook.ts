import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as gradebookService from '@/services/gradebook.service';
import type { FinalExamRow, SemesterWorkRow } from '@/services/gradebook.service';

const root = ['phase4', 'gradebook'] as const;

export function courseGradebookQueryKey(offeringId: string) {
  return [...root, 'course', offeringId] as const;
}

export function studentGradebookQueryKey(studentId: string) {
  return [...root, 'student', studentId] as const;
}

export function myGradesForCourseQueryKey(offeringId: string) {
  return [...root, 'course', offeringId, 'my'] as const;
}

export function useCourseGradebook(offeringId: string | undefined) {
  return useQuery({
    queryKey: courseGradebookQueryKey(offeringId ?? ''),
    queryFn: () => gradebookService.getCourseGradebook(offeringId!),
    enabled: Boolean(offeringId),
  });
}

export function useStudentGradebook(studentId: string | undefined) {
  return useQuery({
    queryKey: studentGradebookQueryKey(studentId ?? ''),
    queryFn: () => gradebookService.getStudentGradebook(studentId!),
    enabled: Boolean(studentId),
  });
}

export function useMyGradesForCourse(offeringId: string | undefined) {
  return useQuery({
    queryKey: myGradesForCourseQueryKey(offeringId ?? ''),
    queryFn: () => gradebookService.getMyGradesForCourse(offeringId!),
    enabled: Boolean(offeringId),
    retry: false,
  });
}

function invalidateGradebook(qc: ReturnType<typeof useQueryClient>, offeringId: string) {
  void qc.invalidateQueries({ queryKey: courseGradebookQueryKey(offeringId) });
  void qc.invalidateQueries({ queryKey: myGradesForCourseQueryKey(offeringId) });
}

export function usePatchSemesterWork(offeringId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (grades: SemesterWorkRow[]) => gradebookService.patchSemesterWork(offeringId, grades),
    onSuccess: () => invalidateGradebook(qc, offeringId),
  });
}

export function useLockSemesterWork(offeringId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => gradebookService.lockSemesterWork(offeringId),
    onSuccess: () => invalidateGradebook(qc, offeringId),
  });
}

export function useUnlockSemesterWork(offeringId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => gradebookService.unlockSemesterWork(offeringId),
    onSuccess: () => invalidateGradebook(qc, offeringId),
  });
}

export function usePatchFinalExam(offeringId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (grades: FinalExamRow[]) => gradebookService.patchFinalExam(offeringId, grades),
    onSuccess: () => invalidateGradebook(qc, offeringId),
  });
}

export function usePublishResults(offeringId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => gradebookService.publishResults(offeringId),
    onSuccess: () => invalidateGradebook(qc, offeringId),
  });
}

export function useRebuildStudentGpa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (studentId: string) => gradebookService.rebuildStudentGpa(studentId),
    onSuccess: (_d, studentId) => void qc.invalidateQueries({ queryKey: studentGradebookQueryKey(studentId) }),
  });
}
