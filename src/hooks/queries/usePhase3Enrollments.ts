import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as enrollmentsService from '@/services/enrollments.service';
import type { EnrollmentListParams } from '@/services/enrollments.service';

const adminKey = ['phase3', 'enrollments', 'admin'] as const;
const myKey = ['phase3', 'enrollments', 'my'] as const;

export function enrollmentsAdminListQueryKey(params: EnrollmentListParams) {
  return [...adminKey, params] as const;
}

export function useAdminEnrollments(params: EnrollmentListParams) {
  return useQuery({
    queryKey: enrollmentsAdminListQueryKey(params),
    queryFn: () => enrollmentsService.getEnrollments(params),
  });
}

export function useMyEnrollmentsPhase3(
  params?: Pick<EnrollmentListParams, 'page' | 'limit' | 'sort' | 'fields'>,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: [...myKey, params ?? {}],
    queryFn: () => enrollmentsService.getMyEnrollments(params),
    enabled: options?.enabled !== false,
  });
}

export function useEnrollmentPhase3(id: string | undefined) {
  return useQuery({
    queryKey: ['phase3', 'enrollments', 'detail', id],
    queryFn: () => enrollmentsService.getEnrollment(id!),
    enabled: Boolean(id),
  });
}

export function useStudentEnrollMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: enrollmentsService.createStudentEnrollment,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: myKey });
      void qc.invalidateQueries({ queryKey: adminKey });
      void qc.invalidateQueries({ queryKey: ['phase3', 'course-offerings'] });
    },
  });
}

export function useForceEnrollmentMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: enrollmentsService.forceEnrollment,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: adminKey });
      void qc.invalidateQueries({ queryKey: ['phase3', 'course-offerings'] });
    },
  });
}

export function useWithdrawEnrollmentMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: enrollmentsService.withdrawEnrollment,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: adminKey });
      void qc.invalidateQueries({ queryKey: myKey });
      void qc.invalidateQueries({ queryKey: ['phase3', 'course-offerings'] });
    },
  });
}
