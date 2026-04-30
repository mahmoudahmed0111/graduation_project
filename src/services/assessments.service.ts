import { apiClient } from '@/lib/http/client';
import { normalizeListResponse, normalizeSingleResponse } from '@/lib/http/normalize';
import type { Phase1ListResult } from '@/lib/http/types';
import type {
  IPhase4Assessment,
  IPhase4AssessmentSettings,
  IPhase4Question,
  IPhase4Submission,
} from '@/types';

export interface AssessmentCreateInput {
  title: string;
  description?: string;
  dueDate: string;
  timeLimitMinutes?: number | null;
  doctorDeclaredTotal?: number;
  questions: IPhase4Question[];
  settings?: IPhase4AssessmentSettings;
}

export type AssessmentUpdateInput = Partial<AssessmentCreateInput>;

export interface AssessmentStartResponse {
  assessment: IPhase4Assessment;
  submission: IPhase4Submission;
  deadline?: string;
  autoSubmitted?: boolean;
}

export async function listAssessments(offeringId: string): Promise<Phase1ListResult<IPhase4Assessment>> {
  const response = await apiClient.get(
    `/course-offerings/${encodeURIComponent(offeringId)}/assessments`
  );
  return normalizeListResponse<IPhase4Assessment>(response, 'assessments');
}

export async function getAssessment(offeringId: string, assessmentId: string): Promise<IPhase4Assessment> {
  const response = await apiClient.get(
    `/course-offerings/${encodeURIComponent(offeringId)}/assessments/${encodeURIComponent(assessmentId)}`
  );
  return normalizeSingleResponse<IPhase4Assessment>(response, 'assessment');
}

export async function getMySubmission(offeringId: string, assessmentId: string): Promise<IPhase4Submission> {
  const response = await apiClient.get(
    `/course-offerings/${encodeURIComponent(offeringId)}/assessments/${encodeURIComponent(assessmentId)}/my-submission`
  );
  return normalizeSingleResponse<IPhase4Submission>(response, 'submission');
}

export async function createAssessment(
  offeringId: string,
  input: AssessmentCreateInput
): Promise<IPhase4Assessment> {
  const response = await apiClient.post(
    `/course-offerings/${encodeURIComponent(offeringId)}/assessments`,
    input
  );
  return normalizeSingleResponse<IPhase4Assessment>(response, 'assessment');
}

export async function updateAssessment(
  offeringId: string,
  assessmentId: string,
  input: AssessmentUpdateInput
): Promise<IPhase4Assessment> {
  const response = await apiClient.patch(
    `/course-offerings/${encodeURIComponent(offeringId)}/assessments/${encodeURIComponent(assessmentId)}`,
    input
  );
  return normalizeSingleResponse<IPhase4Assessment>(response, 'assessment');
}

export async function archiveAssessment(offeringId: string, assessmentId: string): Promise<void> {
  await apiClient.delete(
    `/course-offerings/${encodeURIComponent(offeringId)}/assessments/${encodeURIComponent(assessmentId)}`
  );
}

export async function startAssessment(
  offeringId: string,
  assessmentId: string
): Promise<AssessmentStartResponse> {
  const response = await apiClient.get(
    `/course-offerings/${encodeURIComponent(offeringId)}/assessments/${encodeURIComponent(assessmentId)}/start`
  );
  const data = (response.data as { data?: Record<string, unknown>; autoSubmitted?: boolean }) ?? {};
  const bag = (data.data ?? {}) as Record<string, unknown>;
  return {
    assessment: bag.assessment as IPhase4Assessment,
    submission: bag.submission as IPhase4Submission,
    deadline: typeof bag.deadline === 'string' ? bag.deadline : undefined,
    autoSubmitted: response.data?.autoSubmitted === true,
  };
}
