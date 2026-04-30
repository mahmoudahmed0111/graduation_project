import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as submissionsService from '@/services/submissions.service';
import type {
  GradeAnswerInput,
  ListSubmissionsParams,
  SaveAnswersInput,
} from '@/services/submissions.service';

const root = ['phase4', 'submissions'] as const;

export function submissionDetailQueryKey(submissionId: string) {
  return [...root, 'detail', submissionId] as const;
}

export function assessmentSubmissionsQueryKey(assessmentId: string, params: ListSubmissionsParams = {}) {
  return [...root, 'by-assessment', assessmentId, params] as const;
}

export function useSubmission(submissionId: string | undefined) {
  return useQuery({
    queryKey: submissionDetailQueryKey(submissionId ?? ''),
    queryFn: () => submissionsService.getSubmission(submissionId!),
    enabled: Boolean(submissionId),
  });
}

export function useAssessmentSubmissions(
  assessmentId: string | undefined,
  params: ListSubmissionsParams = {}
) {
  return useQuery({
    queryKey: assessmentSubmissionsQueryKey(assessmentId ?? '', params),
    queryFn: () => submissionsService.listForAssessment(assessmentId!, params),
    enabled: Boolean(assessmentId),
  });
}

export function useSaveAnswers(submissionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: SaveAnswersInput) => submissionsService.saveAnswers(submissionId, input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: submissionDetailQueryKey(submissionId) }),
  });
}

export function useSubmitSubmission(submissionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => submissionsService.submitSubmission(submissionId),
    onSuccess: () => void qc.invalidateQueries({ queryKey: submissionDetailQueryKey(submissionId) }),
  });
}

export function useGradeSubmission(submissionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (answers: GradeAnswerInput[]) => submissionsService.gradeSubmission(submissionId, answers),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: submissionDetailQueryKey(submissionId) });
      void qc.invalidateQueries({ queryKey: [...root, 'by-assessment'] });
    },
  });
}
