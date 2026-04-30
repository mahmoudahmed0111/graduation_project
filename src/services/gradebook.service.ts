import { apiClient } from '@/lib/http/client';
import { normalizeListResponse, normalizeSingleResponse } from '@/lib/http/normalize';
import type { Phase1ListResult } from '@/lib/http/types';
import type { IPhase4GradebookEntry } from '@/types';

export interface SemesterWorkRow {
  studentId: string;
  attendance?: number;
  midterm?: number;
  project?: number;
}

export interface FinalExamRow {
  studentId: string;
  finalExam: number;
}

export interface LockResponse {
  message: string;
  ghostSubmissionsProcessed: number;
}

export interface PublishResponse {
  message: string;
  published: number;
  passed: number;
  failed: number;
}

export interface GpaRebuildResponse {
  message: string;
  gpa: number;
  earnedCredits: number;
  level: number;
  academicStatus: string;
}

export async function getCourseGradebook(offeringId: string): Promise<Phase1ListResult<IPhase4GradebookEntry>> {
  const response = await apiClient.get(`/gradebook/course/${encodeURIComponent(offeringId)}`);
  return normalizeListResponse<IPhase4GradebookEntry>(response, 'enrollments');
}

export async function getStudentGradebook(studentId: string): Promise<Phase1ListResult<IPhase4GradebookEntry>> {
  const response = await apiClient.get(`/gradebook/student/${encodeURIComponent(studentId)}`);
  return normalizeListResponse<IPhase4GradebookEntry>(response, 'enrollments');
}

export async function getMyGradesForCourse(offeringId: string): Promise<IPhase4GradebookEntry> {
  const response = await apiClient.get(`/gradebook/course/${encodeURIComponent(offeringId)}/my`);
  return normalizeSingleResponse<IPhase4GradebookEntry>(response, 'enrollment');
}

export async function patchSemesterWork(offeringId: string, grades: SemesterWorkRow[]): Promise<{ updated: number }> {
  const response = await apiClient.patch(
    `/gradebook/course/${encodeURIComponent(offeringId)}/semester-work`,
    { grades }
  );
  const body = response.data as { data?: { updated?: number } };
  return { updated: body.data?.updated ?? 0 };
}

export async function lockSemesterWork(offeringId: string): Promise<LockResponse> {
  const response = await apiClient.post(`/gradebook/course/${encodeURIComponent(offeringId)}/lock-semester-work`);
  const data = (response.data as { data?: LockResponse }).data;
  return {
    message: data?.message ?? 'Locked.',
    ghostSubmissionsProcessed: data?.ghostSubmissionsProcessed ?? 0,
  };
}

export async function unlockSemesterWork(offeringId: string): Promise<{ message: string }> {
  const response = await apiClient.post(`/gradebook/course/${encodeURIComponent(offeringId)}/unlock-semester-work`);
  const data = (response.data as { data?: { message?: string } }).data;
  return { message: data?.message ?? 'Unlocked.' };
}

export async function patchFinalExam(offeringId: string, grades: FinalExamRow[]): Promise<{ updated: number }> {
  const response = await apiClient.patch(
    `/gradebook/course/${encodeURIComponent(offeringId)}/final-exam`,
    { grades }
  );
  const body = response.data as { data?: { updated?: number } };
  return { updated: body.data?.updated ?? 0 };
}

export async function publishResults(offeringId: string): Promise<PublishResponse> {
  const response = await apiClient.post(`/gradebook/course/${encodeURIComponent(offeringId)}/publish`);
  const data = (response.data as { data?: PublishResponse }).data;
  return {
    message: data?.message ?? 'Published.',
    published: data?.published ?? 0,
    passed: data?.passed ?? 0,
    failed: data?.failed ?? 0,
  };
}

export async function rebuildStudentGpa(studentId: string): Promise<GpaRebuildResponse> {
  const response = await apiClient.post(
    `/gradebook/admin/students/${encodeURIComponent(studentId)}/rebuild-gpa`
  );
  const data = (response.data as { data?: GpaRebuildResponse }).data;
  return {
    message: data?.message ?? 'Rebuilt.',
    gpa: data?.gpa ?? 0,
    earnedCredits: data?.earnedCredits ?? 0,
    level: data?.level ?? 0,
    academicStatus: data?.academicStatus ?? 'unknown',
  };
}
