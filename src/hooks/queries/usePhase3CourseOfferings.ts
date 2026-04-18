import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { EnrollmentListParams } from '@/lib/http/buildQuery';
import * as courseOfferingsService from '@/services/courseOfferings.service';
import type { CourseOfferingListParams } from '@/services/courseOfferings.service';

const key = ['phase3', 'course-offerings'] as const;

export function courseOfferingsListQueryKey(params: CourseOfferingListParams) {
  return [...key, 'list', params] as const;
}

export function useCourseOfferings(params: CourseOfferingListParams) {
  return useQuery({
    queryKey: courseOfferingsListQueryKey(params),
    queryFn: () => courseOfferingsService.getCourseOfferings(params),
  });
}

export function useCourseOffering(id: string | undefined) {
  return useQuery({
    queryKey: [...key, 'detail', id],
    queryFn: () => courseOfferingsService.getCourseOffering(id!),
    enabled: Boolean(id),
  });
}

export function useCourseOfferingRoster(
  offeringId: string | undefined,
  params?: Pick<EnrollmentListParams, 'status' | 'page' | 'limit' | 'sort'>
) {
  return useQuery({
    queryKey: [...key, 'roster', offeringId, params ?? {}],
    queryFn: () => courseOfferingsService.getCourseOfferingRoster(offeringId!, params),
    enabled: Boolean(offeringId),
  });
}

export function useCreateCourseOffering() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: courseOfferingsService.createCourseOffering,
    onSuccess: () => void qc.invalidateQueries({ queryKey: key }),
  });
}

export function useUpdateCourseOffering() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof courseOfferingsService.updateCourseOffering>[1];
    }) => courseOfferingsService.updateCourseOffering(id, data),
    onSuccess: () => void qc.invalidateQueries({ queryKey: key }),
  });
}

export function useArchiveCourseOffering() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: courseOfferingsService.archiveCourseOffering,
    onSuccess: () => void qc.invalidateQueries({ queryKey: key }),
  });
}

export function useRestoreCourseOffering() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: courseOfferingsService.restoreCourseOffering,
    onSuccess: () => void qc.invalidateQueries({ queryKey: key }),
  });
}
