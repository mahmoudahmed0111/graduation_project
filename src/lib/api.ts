import { IUser, IStudent, LoginStepOneCredentials, LoginStepTwoCredentials, ForgotPasswordCredentials, AuthResponse, RefreshTokenResponse, IUniversity, ICourse, ICourseOffering, IEnrollment, PaginatedResponse, IAnnouncement, IAttendanceReport, IAssessment, IMaterial, ISubmission } from '@/types';
import { apiClient as axiosInstance } from '@/lib/http/client';
import * as collegesService from '@/services/colleges.service';
import * as departmentsService from '@/services/departments.service';
import * as settingsService from '@/services/settings.service';
import * as locationsService from '@/services/locations.service';
import * as enrollmentsService from '@/services/enrollments.service';
import { mapPhase3EnrollmentToIEnrollment } from '@/lib/mapPhase3Enrollment';

/** Re-export for callers that import from `@/lib/api`. */
export { getApiErrorMessage } from '@/lib/http/client';

function extractCollegeId(u: Record<string, unknown>): string | undefined {
  const c = u.college_id;
  if (c == null) return undefined;
  if (typeof c === 'string') return c;
  if (typeof c === 'object' && '_id' in c) return String((c as { _id: unknown })._id);
  return undefined;
}

/** Map backend user (e.g. _id, photo) to frontend IUser */
function normalizeUser(u: Record<string, unknown> | null): IUser | IStudent {
  if (!u || typeof u !== 'object') throw new Error('Invalid user');
  const id = (u._id ?? u.id) as string;
  const user = {
    id: typeof id === 'string' ? id : String(id),
    name: (u.name as string) ?? '',
    role: (u.role as IUser['role']) ?? 'student',
    email: (u.email as string) ?? '',
    nationalId: (u.nationalID ?? u.nationalId) as string | undefined,
    universityId: (u.universityId as string) ?? '',
    avatarUrl: (u.avatarUrl ?? u.photo) as string | undefined,
    facultyId: u.facultyId as string | undefined,
    collegeId: extractCollegeId(u),
    requiresPasswordChange: u.requiresPasswordChange === true,
    phoneNumber: typeof u.phoneNumber === 'string' ? u.phoneNumber : undefined,
    ...(u.year != null && { year: u.year as number, semester: u.semester as number, creditsEarned: u.creditsEarned as number, gpa: u.gpa as number }),
  };
  return user as IUser | IStudent;
}

/** Phase 3 Module 8: `GET /enrollments/my` — paginate and map to legacy `IEnrollment`. */
async function fetchAllMyEnrollmentsMapped(): Promise<IEnrollment[]> {
  const limit = 100;
  let page = 1;
  const all: IEnrollment[] = [];
  for (;;) {
    const res = await enrollmentsService.getMyEnrollments({ page, limit, sort: '-createdAt' });
    for (const item of res.items) {
      all.push(mapPhase3EnrollmentToIEnrollment(item as Record<string, unknown>));
    }
    const totalPages = res.totalPages ?? 1;
    if (page >= totalPages || res.items.length === 0) break;
    page++;
  }
  return all;
}

/** Phase 3 `GET /enrollments` (admin) with optional `student_id` / `course_id`. */
async function fetchAdminEnrollmentsPages(filter: { student_id?: string; course_id?: string }): Promise<IEnrollment[]> {
  const limit = 100;
  let page = 1;
  const all: IEnrollment[] = [];
  for (;;) {
    const res = await enrollmentsService.getEnrollments({ ...filter, page, limit, sort: '-createdAt' });
    for (const item of res.items) {
      all.push(mapPhase3EnrollmentToIEnrollment(item as Record<string, unknown>));
    }
    const totalPages = res.totalPages ?? 1;
    if (page >= totalPages || res.items.length === 0) break;
    page++;
  }
  return all;
}

/**
 * API client. **Phase 1** delegates to `@/services/*` (normalized list/single). Flat array helpers below match legacy UI.
 * See `phase1_api_docs.md`.
 */
export const api = {
  // --- Legacy (not specified in Phase 1 doc) ---
  getUsers: async (params?: {
    role?: 'student' | 'ta' | 'doctor' | 'collegeAdmin' | 'universityAdmin';
    college_id?: string;
    department_id?: string;
    includeDeleted?: 'true' | 'false';
    isArchived?: 'true' | 'false' | 'all';
    page?: number;
    limit?: number;
  }): Promise<Array<Record<string, unknown>>> => {
    const response = await axiosInstance.get<{
      status: string;
      data?: { users?: Array<Record<string, unknown>> };
    }>('/users', { params });
    return response.data?.data?.users ?? [];
  },

  /**
   * Same filters as getUsers, but follows `totalPages` until all users are loaded (max 100 per page).
   */
  getAllUsers: async (params?: {
    role?: 'student' | 'ta' | 'doctor' | 'collegeAdmin' | 'universityAdmin';
    college_id?: string;
    department_id?: string;
    includeDeleted?: 'true' | 'false';
    isArchived?: 'true' | 'false' | 'all';
  }): Promise<Array<Record<string, unknown>>> => {
    const merged: Array<Record<string, unknown>> = [];
    let page = 1;
    let totalPages = 1;
    do {
      const response = await axiosInstance.get<{
        status: string;
        currentPage?: number;
        totalPages?: number;
        data?: { users?: Array<Record<string, unknown>> };
      }>('/users', { params: { ...params, page, limit: 100 } });
      const batch = response.data?.data?.users ?? [];
      merged.push(...batch);
      const tp = Number(response.data?.totalPages);
      totalPages = Number.isFinite(tp) && tp >= 1 ? Math.min(tp, 500) : 1;
      page++;
    } while (page <= totalPages);
    return merged;
  },

  /** Phase 2: `GET /api/v1/users/:id` — UA, CA (see phase2_api_doc). */
  getUser: async (id: string): Promise<Record<string, unknown>> => {
    const response = await axiosInstance.get<{
      status?: string;
      data?: { user?: Record<string, unknown> };
    }>(`/users/${encodeURIComponent(id)}`);
    const u = response.data?.data?.user;
    if (!u || typeof u !== 'object') {
      throw new Error('User not found');
    }
    return u;
  },

  /**
   * Phase 2: `PATCH /api/v1/users/:id` — multipart allowlist: name, email, phoneNumber, department_id, photo.
   */
  patchUser: async (
    id: string,
    data: {
      name?: string;
      email?: string;
      phoneNumber?: string;
      department_id?: string;
    }
  ): Promise<Record<string, unknown>> => {
    const fd = new FormData();
    if (data.name != null) fd.append('name', data.name);
    if (data.email != null) fd.append('email', data.email);
    if (data.phoneNumber != null && data.phoneNumber !== '') fd.append('phoneNumber', data.phoneNumber);
    if (data.department_id != null) fd.append('department_id', data.department_id);
    const response = await axiosInstance.patch<{
      status?: string;
      data?: { user?: Record<string, unknown> };
    }>(`/users/${encodeURIComponent(id)}`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    const u = response.data?.data?.user;
    if (!u) throw new Error('Update failed');
    return u;
  },

  /** Phase 2: `PATCH /api/v1/users/:id/deactivate` — soft-delete. */
  deactivateUser: async (id: string): Promise<void> => {
    await axiosInstance.patch(`/users/${encodeURIComponent(id)}/deactivate`);
  },

  // --- Phase 1: Colleges (Module 1) — see `services/colleges.service.ts` ---
  getColleges: async (params?: {
    search?: string;
    isArchived?: 'true' | 'false' | 'all';
    page?: number;
    limit?: number;
    sort?: string;
    fields?: string;
  }): Promise<Array<Record<string, unknown>>> => {
    const { items } = await collegesService.getColleges(params);
    return items;
  },

  getCollege: async (id: string, params?: { isArchived?: 'true' }): Promise<Record<string, unknown>> => {
    return collegesService.getCollege(id, params);
  },

  /** GET /colleges/:id per Phase 1; retries with `?isArchived=true` when the college is archived (404 on first call). */
  getCollegeResolvingArchived: async (id: string): Promise<Record<string, unknown>> => {
    return collegesService.getCollegeResolvingArchived(id);
  },

  getCollegeDepartments: async (
    collegeId: string,
    params?: { page?: number; limit?: number; sort?: string; fields?: string; isArchived?: 'true' | 'false' | 'all' }
  ): Promise<Array<Record<string, unknown>>> => {
    const { items } = await collegesService.getCollegeDepartments(collegeId, params);
    return items;
  },

  getCollegeDepartment: async (collegeId: string, deptId: string, params?: { isArchived?: 'true' }): Promise<Record<string, unknown>> => {
    return collegesService.getCollegeDepartment(collegeId, deptId, params);
  },

  getCollegeLocations: async (
    collegeId: string,
    params?: { type?: string; status?: string; isArchived?: 'true' | 'false' | 'all'; page?: number; limit?: number }
  ): Promise<Array<Record<string, unknown>>> => {
    const { items } = await collegesService.getCollegeLocations(collegeId, params);
    return items;
  },

  getCollegeLocation: async (collegeId: string, locId: string): Promise<Record<string, unknown>> => {
    return collegesService.getCollegeLocation(collegeId, locId);
  },

  // --- Phase 1: Departments (Module 2) ---
  getDepartments: async (params?: {
    search?: string;
    college_id?: string;
    isArchived?: 'true' | 'false' | 'all';
    page?: number;
    limit?: number;
    sort?: string;
    fields?: string;
  }): Promise<Array<Record<string, unknown>>> => {
    const { items } = await departmentsService.getDepartments(params);
    return items;
  },

  getDepartment: async (id: string, params?: { isArchived?: 'true' }): Promise<Record<string, unknown>> => {
    return departmentsService.getDepartment(id, params);
  },

  getDepartmentResolvingArchived: async (id: string): Promise<Record<string, unknown>> => {
    return departmentsService.getDepartmentResolvingArchived(id);
  },

  createCollege: async (data: {
    name: string;
    code: string;
    description?: string;
    dean_id?: string;
    establishedYear?: number;
  }): Promise<Record<string, unknown>> => {
    return collegesService.createCollege(data);
  },

  updateCollege: async (
    id: string,
    data: {
      name?: string;
      description?: string;
      dean_id?: string | null;
      establishedYear?: number;
    }
  ): Promise<Record<string, unknown>> => {
    return collegesService.updateCollege(id, data);
  },

  archiveCollege: async (id: string): Promise<void> => {
    await collegesService.archiveCollege(id);
  },

  restoreCollege: async (id: string): Promise<Record<string, unknown>> => {
    return collegesService.restoreCollege(id);
  },

  createDepartment: async (data: {
    name: string;
    code: string;
    description?: string;
    college_id?: string;
    head_id?: string;
  }): Promise<Record<string, unknown>> => {
    return departmentsService.createDepartment(data);
  },

  updateDepartment: async (
    id: string,
    data: {
      name?: string;
      code?: string;
      description?: string;
      head_id?: string | null;
    }
  ): Promise<Record<string, unknown>> => {
    return departmentsService.updateDepartment(id, data);
  },

  archiveDepartment: async (id: string): Promise<void> => {
    await departmentsService.archiveDepartment(id);
  },

  restoreDepartment: async (id: string): Promise<Record<string, unknown>> => {
    return departmentsService.restoreDepartment(id);
  },

  /** Phase 1 Module 3: `GET /api/v1/settings` */
  getSettings: async (): Promise<Record<string, unknown>> => {
    return settingsService.getSettings();
  },

  /** Phase 1 Module 3: `PATCH /api/v1/settings` (UA only) */
  patchSettings: async (data: {
    currentAcademicYear?: string;
    currentSemester?: 'fall' | 'spring';
    isEnrollmentOpen?: boolean;
    gradePoints?: Record<string, number>;
    defaultCreditLimit?: {
      good_standing?: number;
      probation?: number;
      honors?: number;
    };
  }): Promise<Record<string, unknown>> => {
    return settingsService.updateSettings(data);
  },

  // --- Phase 1: Locations (Module 4) — see `services/locations.service.ts` ---
  getLocations: async (params?: {
    type?: string;
    status?: string;
    isArchived?: 'true' | 'false' | 'all';
    page?: number;
    limit?: number;
    sort?: string;
    fields?: string;
  }): Promise<Array<Record<string, unknown>>> => {
    const { items } = await locationsService.getLocations(params);
    return items;
  },

  getLocation: async (id: string): Promise<Record<string, unknown>> => {
    return locationsService.getLocation(id);
  },

  createLocation: async (data: {
    name: string;
    college_id?: string;
    capacity: number;
    type: 'lecture_hall' | 'lab' | 'section_room' | 'auditorium';
    building?: string;
    floor?: number;
    roomNumber?: string;
    readerId?: string;
  }): Promise<Record<string, unknown>> => {
    return locationsService.createLocation(data);
  },

  updateLocation: async (
    id: string,
    data: Partial<{
      name: string;
      building: string;
      floor: number;
      roomNumber: string;
      capacity: number;
      type: 'lecture_hall' | 'lab' | 'section_room' | 'auditorium';
      readerId: string;
    }>
  ): Promise<Record<string, unknown>> => {
    return locationsService.updateLocation(id, data);
  },

  patchLocationStatus: async (id: string, status: 'active' | 'maintenance'): Promise<Record<string, unknown>> => {
    return locationsService.updateLocationStatus(id, status);
  },

  archiveLocation: async (id: string): Promise<void> => {
    await locationsService.archiveLocation(id);
  },

  restoreLocation: async (id: string): Promise<Record<string, unknown>> => {
    return locationsService.restoreLocation(id);
  },

  // University endpoints
  getUniversityMeta: async (universityId: string) => {
    const response = await axiosInstance.get<{
      name: string;
      slug: string;
      domains: string[];
      logoUrl?: string;
      primaryColor?: string;
    }>(`/universities/${universityId}/meta`);
    return response.data;
  },

  getUniversities: async (): Promise<IUniversity[]> => {
    const response = await axiosInstance.get<IUniversity[]>('/universities');
    return response.data;
  },

  // Course endpoints
  getCourses: async (params?: { page?: number; pageSize?: number }): Promise<PaginatedResponse<ICourse>> => {
    const response = await axiosInstance.get<PaginatedResponse<ICourse>>('/courses', { params });
    return response.data;
  },

  // Enrollment endpoints — Phase 3 Module 8 (`GET /enrollments`, `GET /enrollments/my`, …)
  getEnrollments: async (params?: {
    studentId?: string;
    student_id?: string;
    courseId?: string;
    course_id?: string;
  }): Promise<IEnrollment[]> => {
    const student_id = params?.student_id ?? params?.studentId;
    const course_id = params?.course_id ?? params?.courseId;
    return fetchAdminEnrollmentsPages({
      ...(student_id ? { student_id } : {}),
      ...(course_id ? { course_id } : {}),
    });
  },

  // Student-specific endpoints — `GET /enrollments/my` (replaces legacy `/my-courses`, `/transcript`)
  getMyCourses: async (params?: { semester?: string }): Promise<IEnrollment[]> => {
    const rows = await fetchAllMyEnrollmentsMapped();
    if (params?.semester === 'current') {
      return rows.filter((e) => e.status === 'enrolled');
    }
    return rows;
  },

  getMyTranscript: async (): Promise<IEnrollment[]> => {
    return fetchAllMyEnrollmentsMapped();
  },

  getMyAnnouncements: async (): Promise<IAnnouncement[]> => {
    const response = await axiosInstance.get<IAnnouncement[]>('/announcements/my-feed');
    return response.data;
  },

  getMyAttendanceReport: async (params?: { courseOffering?: string }): Promise<IAttendanceReport[]> => {
    const response = await axiosInstance.get<IAttendanceReport[]>('/attendance/my-report', { params });
    return response.data;
  },

  getCourseAssessments: async (params: { courseOffering: string }): Promise<IAssessment[]> => {
    const response = await axiosInstance.get<IAssessment[]>('/assessments', { params });
    return response.data;
  },

  // Materials endpoints
  getCourseMaterials: async (params?: { courseOffering?: string }): Promise<IMaterial[]> => {
    const response = await axiosInstance.get<IMaterial[]>('/materials', { params });
    return response.data;
  },

  // Assessments endpoints
  getMyAssessments: async (params?: { courseOffering?: string }): Promise<IAssessment[]> => {
    const response = await axiosInstance.get<IAssessment[]>('/assessments/my-assessments', { params });
    return response.data;
  },

  // Submissions endpoints
  getMySubmissions: async (params?: { assessment?: string }): Promise<ISubmission[]> => {
    const response = await axiosInstance.get<ISubmission[]>('/submissions/my-submissions', { params });
    return response.data;
  },

  // Course Offerings endpoints
  getCourseOfferings: async (params?: { semester?: string; department?: string }): Promise<ICourseOffering[]> => {
    const response = await axiosInstance.get<ICourseOffering[]>('/offerings', { params });
    return response.data;
  },

  // Enrollment actions — Phase 3: `POST /enrollments`, `PATCH /enrollments/:id/withdraw`
  enrollInCourse: async (data: { courseOffering?: string; courseOffering_id?: string }): Promise<IEnrollment> => {
    const courseOffering_id = data.courseOffering_id ?? data.courseOffering;
    if (!courseOffering_id) throw new Error('courseOffering_id is required');
    const raw = await enrollmentsService.createStudentEnrollment(courseOffering_id);
    return mapPhase3EnrollmentToIEnrollment(raw as Record<string, unknown>);
  },

  dropCourse: async (enrollmentId: string): Promise<IEnrollment> => {
    const raw = await enrollmentsService.withdrawEnrollment(enrollmentId);
    return mapPhase3EnrollmentToIEnrollment(raw as Record<string, unknown>);
  },

  // Doctor-specific endpoints
  // Materials Management
  uploadMaterial: async (formData: FormData): Promise<IMaterial> => {
    const response = await axiosInstance.post<IMaterial>('/materials', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  deleteMaterial: async (materialId: string): Promise<void> => {
    await axiosInstance.delete(`/materials/${materialId}`);
  },

  // Assessment Management
  createAssessment: async (data: {
    title: string;
    courseOffering: string;
    totalPoints: number;
    dueDate: string;
    questions: IAssessment['questions'];
  }): Promise<IAssessment> => {
    const response = await axiosInstance.post<IAssessment>('/assessments', data);
    return response.data;
  },

  updateAssessment: async (assessmentId: string, data: Partial<IAssessment>): Promise<IAssessment> => {
    const response = await axiosInstance.patch<IAssessment>(`/assessments/${assessmentId}`, data);
    return response.data;
  },

  deleteAssessment: async (assessmentId: string): Promise<void> => {
    await axiosInstance.delete(`/assessments/${assessmentId}`);
  },

  // Submissions Grading
  getSubmissionsForGrading: async (params: { assessment?: string; courseOffering?: string }): Promise<ISubmission[]> => {
    const response = await axiosInstance.get<ISubmission[]>('/submissions/for-grading', { params });
    return response.data;
  },

  gradeSubmission: async (submissionId: string, data: {
    totalScore: number;
    questionScores: Record<string, number>;
  }): Promise<ISubmission> => {
    const response = await axiosInstance.post<ISubmission>(`/submissions/${submissionId}/grade`, data);
    return response.data;
  },

  // Attendance Sessions
  startAttendanceSession: async (data: {
    courseOffering: string;
    location: string;
    rfidReaderId: string;
  }): Promise<unknown> => {
    const response = await axiosInstance.post('/attendance/sessions', data);
    return response.data;
  },

  stopAttendanceSession: async (sessionId: string): Promise<void> => {
    await axiosInstance.post(`/attendance/sessions/${sessionId}/stop`);
  },

  getAttendanceSessions: async (params?: { courseOffering?: string }): Promise<unknown[]> => {
    const response = await axiosInstance.get('/attendance/sessions', { params });
    return response.data;
  },

  // Final Grades
  saveFinalGrades: async (courseOfferingId: string, grades: Array<{
    studentId: string;
    finalTotal: number;
    finalLetter: string;
  }>): Promise<void> => {
    await axiosInstance.post(`/courses/${courseOfferingId}/final-grades`, { grades });
  },
};

// Auth API – aligned with Node backend (authRouter)
export const authApi = {
  /** Step 1: send credentials, receive 2FA email (no token yet) */
  loginStepOne: async (credentials: LoginStepOneCredentials): Promise<{ message: string }> => {
    const response = await axiosInstance.post<{ status: string; message: string }>('/auth/login', credentials);
    return { message: response.data.message ?? '2FA Code sent to your email.' };
  },

  /** Step 2: send email + OTP, receive token and user */
  loginStepTwo: async (credentials: LoginStepTwoCredentials): Promise<AuthResponse> => {
    const response = await axiosInstance.post<{ status: string; token: string; data: { user: Record<string, unknown> } }>(
      '/auth/login/verify',
      { email: credentials.email, otp: credentials.otp }
    );
    const token = response.data.token;
    const user = normalizeUser(response.data.data?.user ?? null);
    return { user, accessToken: token };
  },

  forgotPassword: async (credentials: ForgotPasswordCredentials): Promise<{ message: string }> => {
    const response = await axiosInstance.post<{ status: string; message: string }>('/auth/forgotPassword', credentials);
    return { message: response.data.message ?? 'Token sent to email!' };
  },

  resetPassword: async (token: string, data: { password: string; passwordConfirm: string }): Promise<AuthResponse> => {
    const response = await axiosInstance.patch<{ status: string; token: string; data: { user: Record<string, unknown> } }>(
      `/auth/resetPassword/${encodeURIComponent(token)}`,
      data
    );
    const authToken = response.data.token;
    const user = normalizeUser(response.data.data?.user ?? null);
    return { user, accessToken: authToken };
  },

  logout: async (): Promise<void> => {
    await axiosInstance.post('/auth/logout', {});
  },

  /** Backend has no refresh; 401 will trigger logout */
  refreshToken: async (): Promise<RefreshTokenResponse> => {
    const response = await axiosInstance.post<RefreshTokenResponse>('/auth/refresh', {});
    return response.data;
  },

  // Profile endpoints (if backend adds them under /auth or /users)
  getProfile: async (): Promise<IUser | IStudent> => {
    const response = await axiosInstance.get<Record<string, unknown>>('/auth/profile');
    return normalizeUser(response.data);
  },

  updateProfile: async (data: {
    name?: string;
    email?: string;
    avatarUrl?: string;
  }): Promise<IUser | IStudent> => {
    const response = await axiosInstance.patch<Record<string, unknown>>('/auth/profile', data);
    return normalizeUser(response.data);
  },

  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void> => {
    await axiosInstance.post('/auth/change-password', data);
  },

  /** Verify password for lock screen unlock. Throws on incorrect password. */
  verifyPassword: async (password: string): Promise<void> => {
    await axiosInstance.post<{ status: string; message: string }>('/auth/verify-password', { password });
  },
};

