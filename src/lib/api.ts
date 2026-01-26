import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { IUser, IStudent, LoginCredentials, AuthResponse, RefreshTokenResponse, IUniversity, ICourse, ICourseOffering, IEnrollment, PaginatedResponse, IAnnouncement, IAttendanceReport, IAssessment, IMaterial, ISubmission } from '@/types';
import { getAccessToken } from '@/store/authStore';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1';

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

// Response interceptor to handle token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const response = await axios.post<RefreshTokenResponse>(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        
        // Update token in store
        const { useAuthStore } = await import('@/store/authStore');
        useAuthStore.getState().setAccessToken(response.data.accessToken);

        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        const { useAuthStore } = await import('@/store/authStore');
        useAuthStore.getState().logout();
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
    questions: any[];
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
  }): Promise<any> => {
    const response = await axiosInstance.post('/attendance/sessions', data);
    return response.data;
  },

  stopAttendanceSession: async (sessionId: string): Promise<void> => {
    await axiosInstance.post(`/attendance/sessions/${sessionId}/stop`);
  },

  getAttendanceSessions: async (params?: { courseOffering?: string }): Promise<any[]> => {
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

// Auth API
export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  register: async (data: {
    nationalId: string;
    email: string;
    password: string;
    name: string;
  }): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  refreshToken: async (): Promise<RefreshTokenResponse> => {
    const response = await axiosInstance.post<RefreshTokenResponse>('/auth/refresh', {});
    return response.data;
  },

  logout: async (): Promise<void> => {
    await axiosInstance.post('/auth/logout', {});
  },

  // Profile endpoints
  getProfile: async (): Promise<IUser | IStudent> => {
    const response = await axiosInstance.get<IUser | IStudent>('/auth/profile');
    return response.data;
  },

  updateProfile: async (data: {
    name?: string;
    email?: string;
    avatarUrl?: string;
  }): Promise<IUser | IStudent> => {
    const response = await axiosInstance.patch<IUser | IStudent>('/auth/profile', data);
    return response.data;
  },

  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void> => {
    await axiosInstance.post('/auth/change-password', data);
  },
};

