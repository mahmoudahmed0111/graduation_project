// Data Models

export interface IUser {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  nationalId?: string;
  /** Phase 2 API */
  phoneNumber?: string;
  /** Populated from `college_id` on login / `GET /users/me` when present */
  collegeId?: string;
  /** Phase 2: when true, user must change password before other actions succeed */
  requiresPasswordChange?: boolean;
  universityId: string;
  avatarUrl?: string;
  facultyId?: string;
}

export interface IStudent extends IUser {
  /** Legacy UI; API may send `level` (1–5) instead */
  year: number;
  semester: number;
  /** From API `level` when present */
  level?: number;
  creditsEarned: number;
  gpa: number;
  graduationProject?: IGraduationProject;
  department?: {
    id: string;
    name: string;
    code: string;
    college?: {
      id: string;
      name: string;
      code: string;
    };
  };
  academicStatus?: 'active' | 'good_standing' | 'probation' | 'honors' | 'graduated';
}

export interface IGraduationProject {
  id: string;
  title: string;
  description: string;
  supervisorId: string;
  supervisorName: string;
  fileUrl?: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  submittedAt?: string;
}

export interface ICourse {
  id: string;
  code: string;
  title: string;
  credits: number;
  facultyId: string;
  semester: number;
  teacherId: string;
  teacherName?: string;
  description?: string;
}

// Course Catalog (Static course definition)
export interface ICourseCatalog {
  id: string;
  title: string;
  code: string;
  creditHours: number;
  description?: string;
  department: {
    id: string;
    name: string;
  };
  prerequisites?: ICourseCatalog[];
  isArchived?: boolean;
}

// Course Offering (Semester-specific instance)
export interface ICourseOffering {
  id: string;
  course: ICourseCatalog;
  semester: string;
  doctors: Array<{ id: string; name: string }>;
  tas: Array<{ id: string; name: string }>;
  schedule: Array<{
    day: string;
    startTime: string;
    endTime?: string;
    location: string;
    sessionType: 'lecture' | 'lab' | 'tutorial';
  }>;
  maxSeats: number;
  gradingPolicy: {
    attendance?: number;
    midterm?: number;
    assignments?: number;
    project?: number;
    finalExam?: number;
  };
}

export interface IEnrollment {
  id: string;
  student_id: string;
  courseOffering: ICourseOffering;
  semester: string;
  status: EnrollmentStatus;
  finalAttendancePercentage?: number;
  grades?: {
    attendance?: number;
    midterm?: number;
    assignments?: number;
    project?: number;
    finalExam?: number;
    finalTotal?: number;
    finalLetter?: string;
  };
  enrolledAt: string;
}

export interface IAnnouncement {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
  };
  scope: {
    level: 'Global' | 'College' | 'Department' | 'Course';
    target?: string[];
  };
  createdAt: string;
}

export interface IAssessment {
  id: string;
  title: string;
  courseOffering: {
    id: string;
    course: {
      code: string;
      title: string;
    };
  };
  totalPoints: number;
  dueDate: string;
  questions: Array<{
    id?: string;
    questionText: string;
    questionType: 'MCQ-Single' | 'MCQ-Multiple' | 'True-False' | 'Essay' | 'File-Upload';
    options?: Array<{ id?: string; text: string; isCorrect: boolean }>;
    points: number;
  }>;
}

export interface ISubmission {
  id: string;
  assessment: {
    id: string;
    title: string;
    courseOffering: {
      id: string;
      course: {
        code: string;
        title: string;
      };
    };
    totalPoints: number;
    dueDate: string;
  };
  student_id: string;
  status: 'in_progress' | 'submitted' | 'graded';
  totalScore: number;
  gradedBy?: {
    id: string;
    name: string;
  };
  answers: Array<{
    questionId: string;
    answerText?: string;
    selectedOptionId?: string;
    selectedOptionIds?: string[];
    fileUrl?: string;
  }>;
  submittedAt?: string;
  gradedAt?: string;
}

export interface IAttendanceReport {
  courseOffering: {
    id: string;
    course: {
      code: string;
      title: string;
    };
  };
  totalSessions: number;
  attendedSessions: number;
  attendancePercentage: number;
}

export interface IMaterial {
  id: string;
  title: string;
  description?: string;
  courseOffering: {
    id: string;
    course: {
      code: string;
      title: string;
    };
  };
  category: 'Lectures' | 'Sheets' | 'Readings' | 'Links';
  isExternalLink: boolean;
  url: string;
  fileName?: string;
  fileType?: string;
  uploadedBy: {
    id: string;
    name: string;
  };
  uploadedAt: string;
}

export interface IUniversity {
  id: string;
  name: string;
  slug: string;
  domains: string[];
  logoUrl?: string;
  primaryColor?: string;
}

export type UserRole = 'student' | 'ta' | 'doctor' | 'collegeAdmin' | 'universityAdmin' | 'superAdmin' | 'admin' | 'teacher';
export type EnrollmentStatus = 'enrolled' | 'passed' | 'failed' | 'withdrawn';

// Organizational Structure
/** Phase 1 Module 4 — GET /locations (phase1_api_docs.md) */
export interface ILocation {
  id: string;
  name: string;
  slug?: string;
  college: { id: string; name: string };
  building?: string;
  floor?: number;
  roomNumber?: string;
  capacity: number;
  type: 'lecture_hall' | 'lab' | 'section_room' | 'auditorium';
  status: 'active' | 'maintenance';
  readerId?: string;
  isArchived: boolean;
  archivedAt?: string | null;
}

export interface ICollege {
  id: string;
  name: string;
  code: string;
  /** Phase 1 API (`phase1_api_docs.md`) */
  slug?: string;
  description?: string;
  /** Phase 1 API: UA/CA list responses */
  studentCount?: number;
  deptCount?: number;
  establishedYear?: number;
  archivedAt?: string | null;
  createdAt?: string;
  dean?: {
    id: string;
    name: string;
    /** Populated `dean_id` on `GET /colleges/:id` (Phase 1). */
    email?: string;
    role?: string;
  };
  /** When API returns `dean_id` as an ObjectId string (not populated). */
  deanRefId?: string;
  departments?: Array<{
    id: string;
    name: string;
    code: string;
  }>;
  isArchived: boolean;
}

export interface IDepartment {
  id: string;
  name: string;
  code: string;
  description?: string;
  head?: {
    id: string;
    name: string;
    /** Phase 1 list/detail `head_id` populate */
    email?: string;
    role?: string;
  };
  college: {
    id: string;
    name: string;
    code: string;
  };
  /** Phase 1 `GET /departments` */
  archivedAt?: string | null;
  createdAt?: string;
  isArchived: boolean;
}

// System Settings (Phase 1: GET/PATCH /api/v1/settings)
export interface ISystemSettings {
  id: string;
  currentAcademicYear: string;
  /** API values: fall | spring */
  currentSemester: 'fall' | 'spring';
  isEnrollmentOpen: boolean;
  /** Phase 1 doc: A+, A, B+, B, C+, C, D, F */
  gradePoints: {
    'A+': number;
    'A': number;
    'B+': number;
    'B': number;
    'C+': number;
    'C': number;
    'D': number;
    'F': number;
  };
  defaultCreditLimit: {
    good_standing: number;
    probation: number;
    honors: number;
  };
}

// Auth Types – aligned with backend (Node) auth API
export interface LoginStepOneCredentials {
  email: string;
  nationalID: string;
  password: string;
}

export interface LoginStepTwoCredentials {
  email: string;
  otp: string;
}

export interface LoginCredentials {
  identifier: string; // National ID or email (legacy)
  password: string;
}

export interface ForgotPasswordCredentials {
  email: string;
  nationalID: string;
}

export interface AuthResponse {
  user: IUser | IStudent;
  accessToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
}

// API Types
export interface ApiError {
  message: string;
  code?: string;
  field?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface INotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
  link?: string;
}

