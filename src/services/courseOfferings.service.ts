import { apiClient } from '@/lib/http/client';
import { buildQuery, type CourseOfferingListParams, type EnrollmentListParams } from '@/lib/http/buildQuery';
import { normalizeListResponse, normalizeSingleResponse } from '@/lib/http/normalize';
import type { Phase1ListResult } from '@/lib/http/types';

export type { CourseOfferingListParams };

export type CourseOfferingRecord = Record<string, unknown>;
export type ScheduleSlot = {
  day: string;
  startTime: string;
  endTime: string;
  location: string;
  sessionType: 'lecture' | 'lab' | 'tutorial';
};

export type GradingPolicy = {
  attendance: number;
  midterm: number;
  assignments: number;
  project: number;
  finalExam: number;
};

export async function getCourseOfferings(
  params?: CourseOfferingListParams
): Promise<Phase1ListResult<CourseOfferingRecord>> {
  const response = await apiClient.get('/course-offerings', {
    params: buildQuery(params as Record<string, unknown>),
  });
  return normalizeListResponse<CourseOfferingRecord>(response, ['courseOfferings', 'offerings', 'courses']);
}

export async function getCourseOffering(id: string): Promise<CourseOfferingRecord> {
  const response = await apiClient.get(`/course-offerings/${encodeURIComponent(id)}`);
  return normalizeSingleResponse<CourseOfferingRecord>(response, ['courseOffering', 'offering', 'course']);
}

export async function getCourseOfferingRoster(
  offeringId: string,
  params?: Pick<EnrollmentListParams, 'status' | 'page' | 'limit' | 'sort' | 'fields' | 'isArchived'>
): Promise<Phase1ListResult<Record<string, unknown>>> {
  const response = await apiClient.get(`/course-offerings/${encodeURIComponent(offeringId)}/students`, {
    params: buildQuery(params as Record<string, unknown>),
  });
  return normalizeListResponse<Record<string, unknown>>(response, ['enrollments', 'students']);
}

export async function getCourseOfferingStudentEnrollment(
  offeringId: string,
  studentId: string
): Promise<Record<string, unknown>> {
  const response = await apiClient.get(
    `/course-offerings/${encodeURIComponent(offeringId)}/students/${encodeURIComponent(studentId)}`
  );
  return normalizeSingleResponse<Record<string, unknown>>(response, ['enrollment', 'student']);
}

export async function createCourseOffering(data: {
  course_id: string;
  doctors_ids?: string[];
  tas_ids?: string[];
  schedule?: ScheduleSlot[];
  maxSeats?: number;
  totalDegree: number;
  gradingPolicy: GradingPolicy;
}): Promise<CourseOfferingRecord> {
  const response = await apiClient.post('/course-offerings', data);
  return normalizeSingleResponse<CourseOfferingRecord>(response, ['courseOffering', 'offering', 'course']);
}

export async function updateCourseOffering(
  id: string,
  data: {
    schedule?: ScheduleSlot[];
    doctors_ids?: string[];
    tas_ids?: string[];
    maxSeats?: number;
    totalDegree?: number;
    gradingPolicy?: GradingPolicy;
  }
): Promise<CourseOfferingRecord> {
  const response = await apiClient.patch(`/course-offerings/${encodeURIComponent(id)}`, data);
  return normalizeSingleResponse<CourseOfferingRecord>(response, ['courseOffering', 'offering', 'course']);
}

export async function archiveCourseOffering(id: string): Promise<{ message: string }> {
  const response = await apiClient.patch<{ status?: string; message?: string }>(
    `/course-offerings/${encodeURIComponent(id)}/archive`
  );
  return { message: response.data?.message ?? 'Archived.' };
}

export async function restoreCourseOffering(id: string): Promise<{ message: string }> {
  const response = await apiClient.patch<{ status?: string; message?: string }>(
    `/course-offerings/${encodeURIComponent(id)}/restore`
  );
  return { message: response.data?.message ?? 'Restored.' };
}
