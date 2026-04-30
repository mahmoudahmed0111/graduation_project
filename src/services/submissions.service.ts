import { apiClient } from '@/lib/http/client';
import { normalizeListResponse, normalizeSingleResponse } from '@/lib/http/normalize';
import type { Phase1ListResult } from '@/lib/http/types';
import type { IPhase4Answer, IPhase4Submission, Phase4SubmissionStatus } from '@/types';

export interface SaveAnswersInput {
  answers: Array<Pick<IPhase4Answer, 'questionId' | 'answerText' | 'selectedOptionId' | 'selectedOptionIds' | 'fileUrl'>>;
}

export interface GradeAnswerInput {
  questionId: string;
  score: number;
  feedback?: string;
}

export interface ListSubmissionsParams {
  status?: Phase4SubmissionStatus;
}

export interface SaveAnswersResponse {
  submission: IPhase4Submission;
  autoSubmitted?: boolean;
}

export interface SubmitResponse {
  submission: IPhase4Submission;
  autoSubmitted?: boolean;
}

export async function saveAnswers(
  submissionId: string,
  input: SaveAnswersInput
): Promise<SaveAnswersResponse> {
  const response = await apiClient.patch(`/submissions/${encodeURIComponent(submissionId)}/answers`, input);
  const body = response.data as { data?: { submission?: IPhase4Submission }; autoSubmitted?: boolean };
  return {
    submission: body.data?.submission as IPhase4Submission,
    autoSubmitted: body.autoSubmitted === true,
  };
}

export async function submitSubmission(submissionId: string): Promise<SubmitResponse> {
  const response = await apiClient.post(`/submissions/${encodeURIComponent(submissionId)}/submit`);
  const body = response.data as { data?: { submission?: IPhase4Submission }; autoSubmitted?: boolean };
  return {
    submission: body.data?.submission as IPhase4Submission,
    autoSubmitted: body.autoSubmitted === true,
  };
}

export async function getSubmission(submissionId: string): Promise<IPhase4Submission> {
  const response = await apiClient.get(`/submissions/${encodeURIComponent(submissionId)}`);
  return normalizeSingleResponse<IPhase4Submission>(response, 'submission');
}

export async function listForAssessment(
  assessmentId: string,
  params: ListSubmissionsParams = {}
): Promise<Phase1ListResult<IPhase4Submission>> {
  const response = await apiClient.get(
    `/submissions/assessment/${encodeURIComponent(assessmentId)}`,
    { params }
  );
  return normalizeListResponse<IPhase4Submission>(response, 'submissions');
}

export async function gradeSubmission(
  submissionId: string,
  answers: GradeAnswerInput[]
): Promise<IPhase4Submission> {
  const response = await apiClient.patch(`/submissions/${encodeURIComponent(submissionId)}/grade`, {
    answers,
  });
  return normalizeSingleResponse<IPhase4Submission>(response, 'submission');
}
