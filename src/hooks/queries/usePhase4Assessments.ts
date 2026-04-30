import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as assessmentsService from '@/services/assessments.service';
import type { AssessmentCreateInput, AssessmentUpdateInput } from '@/services/assessments.service';

const root = ['phase4', 'assessments'] as const;

export function assessmentsListQueryKey(offeringId: string) {
  return [...root, 'list', offeringId] as const;
}

export function assessmentDetailQueryKey(offeringId: string, assessmentId: string) {
  return [...root, 'detail', offeringId, assessmentId] as const;
}

export function useAssessments(offeringId: string | undefined) {
  return useQuery({
    queryKey: assessmentsListQueryKey(offeringId ?? ''),
    queryFn: () => assessmentsService.listAssessments(offeringId!),
    enabled: Boolean(offeringId),
  });
}

export function useAssessment(offeringId: string | undefined, assessmentId: string | undefined) {
  return useQuery({
    queryKey: assessmentDetailQueryKey(offeringId ?? '', assessmentId ?? ''),
    queryFn: () => assessmentsService.getAssessment(offeringId!, assessmentId!),
    enabled: Boolean(offeringId && assessmentId),
  });
}

export function useMyAssessmentSubmission(offeringId: string | undefined, assessmentId: string | undefined) {
  return useQuery({
    queryKey: [...root, 'my-submission', offeringId, assessmentId],
    queryFn: () => assessmentsService.getMySubmission(offeringId!, assessmentId!),
    enabled: Boolean(offeringId && assessmentId),
    retry: false,
  });
}

export function useCreateAssessment(offeringId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: AssessmentCreateInput) => assessmentsService.createAssessment(offeringId, input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: assessmentsListQueryKey(offeringId) }),
  });
}

export function useUpdateAssessment(offeringId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ assessmentId, input }: { assessmentId: string; input: AssessmentUpdateInput }) =>
      assessmentsService.updateAssessment(offeringId, assessmentId, input),
    onSuccess: (_d, vars) => {
      void qc.invalidateQueries({ queryKey: assessmentsListQueryKey(offeringId) });
      void qc.invalidateQueries({ queryKey: assessmentDetailQueryKey(offeringId, vars.assessmentId) });
    },
  });
}

export function useArchiveAssessment(offeringId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (assessmentId: string) => assessmentsService.archiveAssessment(offeringId, assessmentId),
    onSuccess: () => void qc.invalidateQueries({ queryKey: assessmentsListQueryKey(offeringId) }),
  });
}

export function useStartAssessment(offeringId: string) {
  return useMutation({
    mutationFn: (assessmentId: string) => assessmentsService.startAssessment(offeringId, assessmentId),
  });
}
