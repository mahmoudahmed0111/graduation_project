import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { IUser, IStudent, LoginStepOneCredentials, LoginStepTwoCredentials, ForgotPasswordCredentials, AuthResponse, RefreshTokenResponse, IUniversity, ICourse, ICourseOffering, IEnrollment, PaginatedResponse, IAnnouncement, IAttendanceReport, IAssessment, IMaterial, ISubmission } from '@/types';
import { getAccessToken } from '@/store/authStore';

const AZURE_API_BASE = 'https://smart-university-api-hzbmh3eph8g5aucq.eastus-01.azurewebsites.net';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_URL || AZURE_API_BASE}/api/v1`;

/** Map backend user (e.g. _id, photo) to frontend IUser */
function normalizeUser(u: Record<string, unknown> | null): IUser | IStudent {
  if (!u || typeof u !== 'object') throw new Error('Invalid user');
  const id = (u._id ?? u.id) as string;
  const user = {
    id: typeof id === 'string' ? id : String(id),
    name: (u.name as string) ?? '',
    role: (u.role as IUser['role']) ?? 'student',
    email: (u.email as string) ?? '',
    nationalId: u.nationalID as string | undefined,
    universityId: (u.universityId as string) ?? '',
    avatarUrl: (u.avatarUrl ?? u.photo) as string | undefined,
    facultyId: u.facultyId as string | undefined,
    ...(u.year != null && { year: u.year as number, semester: u.semester as number, creditsEarned: u.creditsEarned as number, gpa: u.gpa as number }),
  };
  return user as IUser | IStudent;
}

// Create axios instance
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for httpOnly cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add access token from memory
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth paths where 401 should not trigger refresh (avoids cascade: login 401 → refresh 401 → logout 401/429)
const isAuthRequest = (url: string) => /\/auth\/(login|login\/verify|refresh|logout|forgotPassword|resetPassword)/.test(url || '');

// Response interceptor to handle token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const requestUrl = originalRequest?.url ?? '';

    if (error.response?.status === 401 && !originalRequest._retry) {
      // Do not attempt refresh for auth endpoints (e.g. failed login) to avoid refresh + logout cascade
      if (isAuthRequest(requestUrl)) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        const response = await axios.post<RefreshTokenResponse>(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        
        const { useAuthStore } = await import('@/store/authStore');
        useAuthStore.getState().setAccessToken(response.data.accessToken);

        originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Clear session locally only; do not call logout API (would 401/429 without token)
        const { useAuthStore } = await import('@/store/authStore');
        useAuthStore.getState().clearSession();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// API client functions
export const api = {
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

  // Enrollment endpoints
  getEnrollments: async (params?: { studentId?: string; courseId?: string }): Promise<IEnrollment[]> => {
    const response = await axiosInstance.get<IEnrollment[]>('/enrollments', { params });
    return response.data;
  },

  // Student-specific endpoints
  getMyCourses: async (params?: { semester?: string }): Promise<IEnrollment[]> => {
    const response = await axiosInstance.get<IEnrollment[]>('/enrollments/my-courses', { params });
    return response.data;
  },

  getMyTranscript: async (): Promise<IEnrollment[]> => {
    const response = await axiosInstance.get<IEnrollment[]>('/enrollments/transcript');
    return response.data;
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

  // Enrollment actions
  enrollInCourse: async (data: { courseOffering: string }): Promise<IEnrollment> => {
    const response = await axiosInstance.post<IEnrollment>('/enrollments', data);
    return response.data;
  },

  dropCourse: async (enrollmentId: string): Promise<void> => {
    await axiosInstance.delete(`/enrollments/${enrollmentId}`);
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
};

