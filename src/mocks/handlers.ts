import { http, HttpResponse } from 'msw';
import { IUser, IStudent, IUniversity, ICourse, IEnrollment } from '@/types';
import i18n from '@/lib/i18n';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1';

// Helper function to get translation
const t = (key: string, fallback?: string) => {
  return i18n.t(`mock.${key}`, { defaultValue: fallback || key });
};

// Helper function to get mock users with translations
const getMockUsers = (): (IUser | IStudent)[] => [
  {
    id: '1',
    name: 'Mahmoud Ahmed',
    role: 'student',
    email: 'student@gmail.com',
    nationalId: '12345678901234',
    universityId: 'university-1',
    year: 3,
    semester: 1,
    creditsEarned: 90,
    gpa: 3.75,
    department: {
      id: 'dept-1',
      name: t('departments.computerScience', 'Computer Science'),
      code: 'CS',
      college: {
        id: 'college-1',
        name: t('colleges.facultyOfEngineering', 'Faculty of Engineering'),
        code: 'ENG',
      },
    },
    academicStatus: 'good_standing',
  } as IStudent,
  {
    id: '2',
    name: 'Dr. Fatima Ali',
    role: 'doctor',
    email: 'fatima.ali@university.edu',
    universityId: 'university-1',
    facultyId: 'faculty-1',
  },
  {
    id: '3',
    name: 'University Admin',
    role: 'universityAdmin',
    email: 'admin@university.edu',
    universityId: 'university-1',
  },
  {
    id: '4',
    name: 'College Admin',
    role: 'collegeAdmin',
    email: 'college.admin@university.edu',
    universityId: 'university-1',
  },
];

const mockUniversities: IUniversity[] = [
  {
    id: 'university-1',
    name: 'Beni-Suef University',
    slug: 'beni-suef',
    domains: ['university.edu', 'bsu.edu.eg'],
    logoUrl: '/logo/logo.png.png',
    primaryColor: '#0055cc',
  },
];

// Helper function to get mock courses with translations
const getMockCourses = (): ICourse[] => [
  {
    id: '1',
    code: 'CS101',
    title: t('courses.introToProgramming', 'Introduction to Programming'),
    credits: 3,
    facultyId: 'faculty-1',
    semester: 1,
    teacherId: '2',
    teacherName: 'Dr. Fatima Ali',
  },
];

const mockEnrollments: IEnrollment[] = [
  {
    id: '1',
    student_id: '1',
    courseOffering: {
      id: '1',
      course: { id: '1', code: 'CS101', title: 'Intro', creditHours: 3, department: { id: '1', name: 'CS' } },
      semester: 'Fall 2025',
      doctors: [],
      tas: [],
      schedule: [],
      maxSeats: 60,
      gradingPolicy: {},
    },
    semester: 'Fall 2025',
    status: 'enrolled',
    enrolledAt: '2024-01-15',
  },
];

// Helper function to translate day names
const translateDay = (day: string): string => {
  const dayKey = day.toLowerCase();
  return t(`days.${dayKey}`, day);
};

// Helper function to translate session types
const translateSessionType = (type: string): string => {
  const typeKey = type.toLowerCase();
  return t(`sessionTypes.${typeKey}`, type);
};

// Helper function to translate semesters
const translateSemester = (semester: string): string => {
  const key = semester.toLowerCase().replace(/\s+/g, '');
  return t(`semesters.${key}`, semester);
};

// Helper function to translate locations
const translateLocation = (location: string): string => {
  const key = location.toLowerCase().replace(/\s+/g, '');
  return t(`locations.${key}`, location);
};

export const handlers = [
  // Auth endpoints
  http.post(`${API_BASE_URL}/auth/login`, async ({ request }) => {
    const body = await request.json() as { identifier: string; password: string };
    const identifier = (body.identifier || '').trim().toLowerCase();
    const password = (body.password || '').trim();

    const mockUsers = getMockUsers();

    // Student: identifier (email or national ID) + password 12345678
    const isStudentLogin =
      (identifier === 'student@gmail.com' ||
        identifier === 'student@university.edu' ||
        identifier === 'student@university.com' ||
        identifier === '12345678901234') &&
      password === '12345678';

    if (isStudentLogin) {
      const student = mockUsers.find(u => u.role === 'student') || mockUsers[0];
      return HttpResponse.json({
        user: student,
        accessToken: 'mock-access-token-' + Date.now(),
      });
    }

    // Admin, Doctor, College Admin: match by email + password password123
    const user = mockUsers.find(
      u => (u.email && u.email.toLowerCase() === identifier) || u.nationalId === body.identifier
    );

    if (user && password === 'password123') {
      return HttpResponse.json({
        user,
        accessToken: 'mock-access-token-' + Date.now(),
      });
    }

    return HttpResponse.json(
      { message: 'Invalid credentials' },
      { status: 401 }
    );
  }),

  http.post(`${API_BASE_URL}/auth/register`, async ({ request }) => {
    const body = await request.json() as {
      nationalId: string;
      email: string;
      password: string;
      name: string;
    };

    // Check if account exists
    const mockUsers = getMockUsers();
    const existingUser = mockUsers.find(u => u.nationalId === body.nationalId);
    if (existingUser) {
      return HttpResponse.json(
        {
          message: 'Account already exists',
          code: 'ACCOUNT_EXISTS',
          email: existingUser.email,
        },
        { status: 409 }
      );
    }

    const newUser: IStudent = {
      id: String(mockUsers.length + 1),
      name: body.name,
      role: 'student',
      email: body.email,
      nationalId: body.nationalId,
      universityId: 'university-1',
      year: 1,
      semester: 1,
      creditsEarned: 0,
      gpa: 0,
      department: {
        id: 'dept-1',
        name: t('departments.computerScience', 'Computer Science'),
        code: 'CS',
        college: {
          id: 'college-1',
          name: t('colleges.facultyOfEngineering', 'Faculty of Engineering'),
          code: 'ENG',
        },
      },
      academicStatus: 'good_standing',
    };

    mockUsers.push(newUser);

    return HttpResponse.json({
      user: newUser,
      accessToken: 'mock-access-token-' + Date.now(),
    });
  }),

  http.post(`${API_BASE_URL}/auth/refresh`, () => {
    return HttpResponse.json({
      accessToken: 'mock-refreshed-token-' + Date.now(),
    });
  }),

  http.post(`${API_BASE_URL}/auth/logout`, () => {
    return HttpResponse.json({});
  }),

  // Profile endpoints
  http.get(`${API_BASE_URL}/auth/profile`, () => {
    // Return the current user from mockUsers (assuming first user is logged in)
    const mockUsers = getMockUsers();
    const currentUser = mockUsers[0];
    return HttpResponse.json(currentUser);
  }),

  http.patch(`${API_BASE_URL}/auth/profile`, async ({ request }) => {
    const body = await request.json() as {
      name?: string;
      email?: string;
      avatarUrl?: string;
    };

    // Update the first user (in a real app, you'd identify the user from the token)
    const mockUsers = getMockUsers();
    const currentUser = mockUsers[0];
    const updatedUser = {
      ...currentUser,
      ...(body.name && { name: body.name }),
      ...(body.email && { email: body.email }),
      ...(body.avatarUrl !== undefined && { avatarUrl: body.avatarUrl }),
    };

    mockUsers[0] = updatedUser;
    return HttpResponse.json(updatedUser);
  }),

  http.post(`${API_BASE_URL}/auth/change-password`, async ({ request }) => {
    const body = await request.json() as {
      currentPassword: string;
      newPassword: string;
    };

    // In a real app, you'd verify the current password
    // For mock, we'll just accept any current password
    if (!body.currentPassword || !body.newPassword) {
      return HttpResponse.json(
        { message: 'Current password and new password are required' },
        { status: 400 }
      );
    }

    if (body.newPassword.length < 8) {
      return HttpResponse.json(
        { message: 'New password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    return HttpResponse.json({ message: 'Password changed successfully' });
  }),

  // University endpoints
  http.get(`${API_BASE_URL}/universities/:id/meta`, ({ params }) => {
    const university = mockUniversities.find(u => u.id === params.id);
    if (!university) {
      return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    }

    return HttpResponse.json({
      name: university.name,
      slug: university.slug,
      domains: university.domains,
      logoUrl: university.logoUrl,
      primaryColor: university.primaryColor,
    });
  }),

  http.get(`${API_BASE_URL}/universities`, () => {
    return HttpResponse.json(mockUniversities);
  }),

  // Course endpoints
  http.get(`${API_BASE_URL}/courses`, () => {
    const mockCourses = getMockCourses();
    return HttpResponse.json({
      data: mockCourses,
      total: mockCourses.length,
      page: 1,
      pageSize: 10,
      totalPages: 1,
    });
  }),

  // Enrollment endpoints
  http.get(`${API_BASE_URL}/enrollments`, ({ request }) => {
    const url = new URL(request.url);
    const studentId = url.searchParams.get('studentId');
    
    const filtered = studentId
      ? mockEnrollments.filter(e => e.student_id === studentId)
      : mockEnrollments;

    return HttpResponse.json(filtered);
  }),

  // Student-specific endpoints
  http.get(`${API_BASE_URL}/enrollments/my-courses`, ({ request }) => {
    const url = new URL(request.url);
    const semester = url.searchParams.get('semester');
    
    // All mock enrollments with translations
    const allEnrollments = [
      {
        id: 'enrollment-1',
        student_id: '1',
        courseOffering: {
          id: 'offering-1',
          course: {
            id: 'catalog-1',
            title: t('courses.introToProgramming', 'Introduction to Programming'),
            code: 'CS101',
            creditHours: 3,
            description: t('courseDescriptions.introToProgramming', 'Fundamentals of programming'),
            department: {
              id: 'dept-1',
              name: t('departments.computerScience', 'Computer Science'),
            },
            prerequisites: [],
          },
          semester: translateSemester('Fall 2025'),
          doctors: [
            { id: '2', name: 'Dr. Fatima Ali' },
          ],
          tas: [],
          schedule: [
            {
              day: translateDay('Sunday'),
              startTime: '10:00',
              endTime: '12:00',
              location: translateLocation('Hall 501'),
              sessionType: translateSessionType('lecture'),
            },
            {
              day: translateDay('Tuesday'),
              startTime: '10:00',
              endTime: '12:00',
              location: translateLocation('Lab 201'),
              sessionType: translateSessionType('lab'),
            },
          ],
          maxSeats: 50,
          gradingPolicy: {
            attendance: 10,
            midterm: 20,
            assignments: 20,
            project: 10,
            finalExam: 40,
          },
        },
        semester: translateSemester('Fall 2025'),
        status: t('status.enrolled', 'enrolled'),
        finalAttendancePercentage: 95,
        grades: {
          attendance: 9.5,
          midterm: 18,
          assignments: 19,
          project: 9,
          finalExam: 0, // Not taken yet
          finalTotal: 0,
          finalLetter: undefined,
        },
        enrolledAt: '2024-09-01',
      },
      {
        id: 'enrollment-2',
        student_id: '1',
        courseOffering: {
          id: 'offering-2',
          course: {
            id: 'catalog-2',
            title: t('courses.dataStructures', 'Data Structures'),
            code: 'CS201',
            creditHours: 4,
            description: t('courseDescriptions.dataStructuresAlgorithms', 'Advanced data structures and algorithms'),
            department: {
              id: 'dept-1',
              name: t('departments.computerScience', 'Computer Science'),
            },
            prerequisites: [
              {
                id: 'catalog-1',
                title: t('courses.introToProgramming', 'Introduction to Programming'),
                code: 'CS101',
                creditHours: 3,
                department: {
                  id: 'dept-1',
                  name: t('departments.computerScience', 'Computer Science'),
                },
              },
            ],
          },
          semester: translateSemester('Fall 2025'),
          doctors: [
            { id: '2', name: 'Dr. Fatima Ali' },
          ],
          tas: [],
          schedule: [
            {
              day: translateDay('Monday'),
              startTime: '14:00',
              endTime: '16:00',
              location: translateLocation('Hall 502'),
              sessionType: translateSessionType('lecture'),
            },
          ],
          maxSeats: 40,
          gradingPolicy: {
            attendance: 10,
            midterm: 25,
            assignments: 15,
            project: 10,
            finalExam: 40,
          },
        },
        semester: translateSemester('Fall 2025'),
        status: t('status.enrolled', 'enrolled'),
        finalAttendancePercentage: 88,
        grades: {
          attendance: 8.8,
          midterm: 22,
          assignments: 14,
          project: 9.5,
          finalExam: 0,
          finalTotal: 0,
          finalLetter: undefined,
        },
        enrolledAt: '2024-09-01',
      },
      {
        id: 'enrollment-3',
        student_id: '1',
        courseOffering: {
          id: 'offering-3',
          course: {
            id: 'catalog-3',
            title: t('courses.databaseSystems', 'Database Systems'),
            code: 'CS301',
            creditHours: 3,
            description: t('courseDescriptions.databaseDesign', 'Introduction to database design and SQL'),
            department: {
              id: 'dept-1',
              name: t('departments.computerScience', 'Computer Science'),
            },
            prerequisites: [],
          },
          semester: translateSemester('Spring 2024'),
          doctors: [
            { id: '2', name: 'Dr. Fatima Ali' },
          ],
          tas: [],
          schedule: [
            {
              day: translateDay('Wednesday'),
              startTime: '09:00',
              endTime: '11:00',
              location: translateLocation('Hall 503'),
              sessionType: translateSessionType('lecture'),
            },
          ],
          maxSeats: 45,
          gradingPolicy: {
            attendance: 10,
            midterm: 20,
            assignments: 20,
            project: 10,
            finalExam: 40,
          },
        },
        semester: translateSemester('Spring 2024'),
        status: t('status.passed', 'passed'),
        finalAttendancePercentage: 92,
        grades: {
          attendance: 9.2,
          midterm: 19,
          assignments: 18.5,
          project: 9.5,
          finalExam: 38,
          finalTotal: 94.2,
          finalLetter: 'A',
        },
        enrolledAt: '2024-02-01',
      },
    ];
    
    // Filter by semester if requested
    if (semester === 'current') {
      // Return only current semester (Fall 2025)
      const fall2025 = translateSemester('Fall 2025');
      const filtered = allEnrollments.filter(e => e.semester === fall2025);
      return HttpResponse.json(filtered);
    }
    
    // Return all enrollments if no filter or 'all'
    return HttpResponse.json(allEnrollments);
  }),

  http.get(`${API_BASE_URL}/enrollments/transcript`, () => {
    // Return all enrollments (transcript includes all semesters)
    const allEnrollments = [
      {
        id: 'enrollment-1',
        student_id: '1',
        courseOffering: {
          id: 'offering-1',
          course: {
            id: 'catalog-1',
            title: 'Introduction to Programming',
            code: 'CS101',
            creditHours: 3,
            description: 'Fundamentals of programming',
            department: {
              id: 'dept-1',
              name: 'Computer Science',
            },
            prerequisites: [],
          },
          semester: 'Fall 2025',
          doctors: [
            { id: '2', name: 'Dr. Fatima Ali' },
          ],
          tas: [],
          schedule: [],
          maxSeats: 50,
          gradingPolicy: {},
        },
        semester: 'Fall 2025',
        status: 'enrolled',
        finalAttendancePercentage: 95,
        grades: {
          attendance: 9.5,
          midterm: 18,
          assignments: 19,
          project: 9,
          finalExam: 0,
          finalTotal: 0,
          finalLetter: undefined,
        },
        enrolledAt: '2024-09-01',
      },
      {
        id: 'enrollment-2',
        student_id: '1',
        courseOffering: {
          id: 'offering-2',
          course: {
            id: 'catalog-2',
            title: 'Data Structures',
            code: 'CS201',
            creditHours: 4,
            description: 'Advanced data structures and algorithms',
            department: {
              id: 'dept-1',
              name: 'Computer Science',
            },
            prerequisites: [],
          },
          semester: 'Fall 2025',
          doctors: [
            { id: '2', name: 'Dr. Fatima Ali' },
          ],
          tas: [],
          schedule: [],
          maxSeats: 40,
          gradingPolicy: {},
        },
        semester: 'Fall 2025',
        status: 'enrolled',
        finalAttendancePercentage: 88,
        grades: {
          attendance: 8.8,
          midterm: 22,
          assignments: 14,
          project: 9.5,
          finalExam: 0,
          finalTotal: 0,
          finalLetter: undefined,
        },
        enrolledAt: '2024-09-01',
      },
      {
        id: 'enrollment-3',
        student_id: '1',
        courseOffering: {
          id: 'offering-3',
          course: {
            id: 'catalog-3',
            title: 'Database Systems',
            code: 'CS301',
            creditHours: 3,
            description: 'Introduction to database design and SQL',
            department: {
              id: 'dept-1',
              name: 'Computer Science',
            },
            prerequisites: [],
          },
          semester: 'Spring 2024',
          doctors: [
            { id: '2', name: 'Dr. Fatima Ali' },
          ],
          tas: [],
          schedule: [],
          maxSeats: 45,
          gradingPolicy: {},
        },
        semester: 'Spring 2024',
        status: 'passed',
        finalAttendancePercentage: 92,
        grades: {
          attendance: 9.2,
          midterm: 19,
          assignments: 18.5,
          project: 9.5,
          finalExam: 38,
          finalTotal: 94.2,
          finalLetter: 'A',
        },
        enrolledAt: '2024-02-01',
      },
      {
        id: 'enrollment-4',
        student_id: '1',
        courseOffering: {
          id: 'offering-4',
          course: {
            id: 'catalog-4',
            title: 'Operating Systems',
            code: 'CS302',
            creditHours: 3,
            description: 'Principles of operating systems',
            department: {
              id: 'dept-1',
              name: 'Computer Science',
            },
            prerequisites: [],
          },
          semester: 'Spring 2024',
          doctors: [
            { id: '2', name: 'Dr. Fatima Ali' },
          ],
          tas: [],
          schedule: [],
          maxSeats: 40,
          gradingPolicy: {},
        },
        semester: 'Spring 2024',
        status: 'passed',
        finalAttendancePercentage: 88,
        grades: {
          attendance: 8.8,
          midterm: 20,
          assignments: 17,
          project: 9,
          finalExam: 35,
          finalTotal: 89.8,
          finalLetter: 'B+',
        },
        enrolledAt: '2024-02-01',
      },
      {
        id: 'enrollment-5',
        student_id: '1',
        courseOffering: {
          id: 'offering-5',
          course: {
            id: 'catalog-5',
            title: 'Computer Networks',
            code: 'CS401',
            creditHours: 3,
            description: 'Network protocols and architecture',
            department: {
              id: 'dept-1',
              name: 'Computer Science',
            },
            prerequisites: [],
          },
          semester: 'Fall 2024',
          doctors: [
            { id: '2', name: 'Dr. Fatima Ali' },
          ],
          tas: [],
          schedule: [],
          maxSeats: 35,
          gradingPolicy: {},
        },
        semester: 'Fall 2024',
        status: 'passed',
        finalAttendancePercentage: 90,
        grades: {
          attendance: 9.0,
          midterm: 22,
          assignments: 18,
          project: 9.5,
          finalExam: 36,
          finalTotal: 94.5,
          finalLetter: 'A',
        },
        enrolledAt: '2023-09-01',
      },
    ];
    
    return HttpResponse.json(allEnrollments);
  }),

  http.get(`${API_BASE_URL}/announcements/my-feed`, () => {
    // Return mock announcements with translations
    return HttpResponse.json([
      {
        id: 'announcement-1',
        title: t('announcements.welcomeFall2025', 'Welcome to Fall 2025 Semester'),
        content: t('announcements.welcomeFall2025Content', 'We are excited to welcome all students to the Fall 2025 semester. Classes begin on September 1st. Please check your schedules and ensure you are enrolled in the correct courses.'),
        author: {
          id: 'admin-1',
          name: t('announcements.universityAdministration', 'University Administration'),
        },
        scope: {
          level: 'Global',
        },
        createdAt: '2024-08-25T10:00:00Z',
      },
      {
        id: 'announcement-2',
        title: t('announcements.newLabEquipment', 'Faculty of Engineering - New Lab Equipment'),
        content: t('announcements.newLabEquipmentContent', 'The Faculty of Engineering has installed new equipment in the computer labs. All students are welcome to use the facilities during lab hours.'),
        author: {
          id: '2',
          name: 'Dr. Fatima Ali',
        },
        scope: {
          level: 'College',
        },
        createdAt: '2024-09-10T14:00:00Z',
      },
      {
        id: 'announcement-3',
        title: t('announcements.guestLecture', 'Computer Science Department - Guest Lecture'),
        content: t('announcements.guestLectureContent', 'We are pleased to announce a guest lecture by Dr. Ahmed Hassan on "Modern Software Development Practices" on October 20th at 2:00 PM in Hall 501. All CS students are encouraged to attend.'),
        author: {
          id: '2',
          name: 'Dr. Fatima Ali',
        },
        scope: {
          level: 'Department',
        },
        createdAt: '2024-09-15T09:00:00Z',
      },
      {
        id: 'announcement-4',
        title: t('announcements.assignmentExtended', 'CS101 - Assignment 1 Due Date Extended'),
        content: t('announcements.assignmentExtendedContent', 'Due to popular request, the due date for Assignment 1 has been extended to October 8th at 11:59 PM. Please submit your work through the online portal.'),
        author: {
          id: '2',
          name: 'Dr. Fatima Ali',
        },
        scope: {
          level: 'Course',
          target: ['offering-1'],
        },
        createdAt: '2024-09-28T16:00:00Z',
      },
      {
        id: 'announcement-5',
        title: t('announcements.midtermSchedule', 'CS201 - Midterm Exam Schedule'),
        content: t('announcements.midtermScheduleContent', 'The midterm exam for Data Structures will be held on October 25th from 10:00 AM to 12:00 PM in Hall 502. Please bring your student ID and arrive 15 minutes early.'),
        author: {
          id: '2',
          name: 'Dr. Fatima Ali',
        },
        scope: {
          level: 'Course',
          target: ['offering-2'],
        },
        createdAt: '2024-10-01T11:00:00Z',
      },
      {
        id: 'announcement-6',
        title: t('announcements.libraryHours', 'Library Hours Extended During Exam Period'),
        content: t('announcements.libraryHoursContent', 'The university library will extend its hours during the exam period. New hours: 8:00 AM - 11:00 PM, Monday through Sunday.'),
        author: {
          id: 'admin-1',
          name: t('announcements.universityAdministration', 'University Administration'),
        },
        scope: {
          level: 'Global',
        },
        createdAt: '2024-10-05T08:00:00Z',
      },
    ]);
  }),

  http.get(`${API_BASE_URL}/attendance/my-report`, () => {
    // Return mock attendance data
    return HttpResponse.json([
      {
        courseOffering: {
          id: 'offering-1',
          course: {
            id: '1',
            code: 'CS101',
            title: t('courses.introToProgramming', 'Introduction to Programming'),
          },
        },
        totalSessions: 20,
        attendedSessions: 19,
        attendancePercentage: 95,
      },
      {
        courseOffering: {
          id: 'offering-2',
          course: {
            id: '2',
            code: 'CS201',
            title: t('courses.dataStructures', 'Data Structures'),
          },
        },
        totalSessions: 18,
        attendedSessions: 16,
        attendancePercentage: 88.9,
      },
      {
        courseOffering: {
          id: 'offering-3',
          course: {
            id: '3',
            code: 'MATH101',
            title: 'Calculus I',
          },
        },
        totalSessions: 22,
        attendedSessions: 20,
        attendancePercentage: 90.9,
      },
    ]);
  }),

  http.get(`${API_BASE_URL}/assessments`, ({ request }) => {
    const url = new URL(request.url);
    const courseOffering = url.searchParams.get('courseOffering');
    
    const allAssessments = [
      {
        id: 'assessment-1',
        title: t('assessments.midtermChapter1_5', 'Midterm Exam - Chapter 1-5'),
        courseOffering: {
          id: 'offering-1',
          course: {
            code: 'CS101',
            title: t('courses.introToProgramming', 'Introduction to Programming'),
          },
        },
        totalPoints: 100,
        dueDate: '2024-10-15T23:59:59Z',
        questions: [
          {
            id: 'q1',
            questionText: t('assessments.questionVariable', 'What is a variable?'),
            questionType: 'MCQ-Single',
            options: [
              { id: 'opt1', text: t('assessments.optionStorageLocation', 'A storage location'), isCorrect: true },
              { id: 'opt2', text: t('assessments.optionFunction', 'A function'), isCorrect: false },
              { id: 'opt3', text: t('assessments.optionLoop', 'A loop'), isCorrect: false },
            ],
            points: 10,
          },
          {
            id: 'q2',
            questionText: t('assessments.questionLoops', 'Explain the concept of loops in programming.'),
            questionType: 'Essay',
            points: 20,
          },
        ],
      },
      {
        id: 'assessment-2',
        title: t('assessments.assignment1BasicAlgorithms', 'Assignment 1: Basic Algorithms'),
        courseOffering: {
          id: 'offering-1',
          course: {
            code: 'CS101',
            title: t('courses.introToProgramming', 'Introduction to Programming'),
          },
        },
        totalPoints: 50,
        dueDate: '2024-10-05T23:59:59Z',
        questions: [
          {
            id: 'q3',
            questionText: t('assessments.questionMaxArray', 'Implement a function to find the maximum number in an array.'),
            questionType: 'File-Upload',
            points: 50,
          },
        ],
      },
      {
        id: 'assessment-3',
        title: t('assessments.quizDataStructuresBasics', 'Quiz: Data Structures Basics'),
        courseOffering: {
          id: 'offering-2',
          course: {
            code: 'CS201',
            title: t('courses.dataStructures', 'Data Structures'),
          },
        },
        totalPoints: 30,
        dueDate: '2024-10-20T23:59:59Z',
        questions: [
          {
            id: 'q4',
            questionText: t('assessments.questionBinarySearch', 'What is the time complexity of binary search?'),
            questionType: 'MCQ-Single',
            options: [
              { id: 'opt4', text: 'O(n)', isCorrect: false },
              { id: 'opt5', text: 'O(log n)', isCorrect: true },
              { id: 'opt6', text: 'O(n²)', isCorrect: false },
            ],
            points: 10,
          },
          {
            id: 'q5',
            questionText: t('assessments.questionArraysFixed', 'True or False: Arrays have fixed size.'),
            questionType: 'True-False',
            options: [
              { id: 'opt7', text: t('assessments.optionTrue', 'True'), isCorrect: true },
              { id: 'opt8', text: t('assessments.optionFalse', 'False'), isCorrect: false },
            ],
            points: 10,
          },
        ],
      },
    ];

    if (courseOffering) {
      const filtered = allAssessments.filter(a => a.courseOffering.id === courseOffering);
      return HttpResponse.json(filtered);
    }

    return HttpResponse.json(allAssessments);
  }),

  // My Assessments endpoint (assessments for enrolled courses)
  http.get(`${API_BASE_URL}/assessments/my-assessments`, ({ request }) => {
    const url = new URL(request.url);
    const courseOffering = url.searchParams.get('courseOffering');
    
    // Return same assessments as above (for enrolled courses)
    const allAssessments = [
      {
        id: 'assessment-1',
        title: 'Midterm Exam - Chapter 1-5',
        courseOffering: {
          id: 'offering-1',
          course: {
            code: 'CS101',
            title: 'Introduction to Programming',
          },
        },
        totalPoints: 100,
        dueDate: '2024-10-15T23:59:59Z',
        questions: [
          {
            id: 'q1',
            questionText: 'What is a variable?',
            questionType: 'MCQ-Single',
            options: [
              { id: 'opt1', text: 'A storage location', isCorrect: true },
              { id: 'opt2', text: 'A function', isCorrect: false },
              { id: 'opt3', text: 'A loop', isCorrect: false },
            ],
            points: 10,
          },
          {
            id: 'q2',
            questionText: 'Explain the concept of loops in programming.',
            questionType: 'Essay',
            points: 20,
          },
        ],
      },
      {
        id: 'assessment-2',
        title: 'Assignment 1: Basic Algorithms',
        courseOffering: {
          id: 'offering-1',
          course: {
            code: 'CS101',
            title: 'Introduction to Programming',
          },
        },
        totalPoints: 50,
        dueDate: '2024-10-05T23:59:59Z',
        questions: [
          {
            id: 'q3',
            questionText: 'Implement a function to find the maximum number in an array.',
            questionType: 'File-Upload',
            points: 50,
          },
        ],
      },
      {
        id: 'assessment-3',
        title: 'Quiz: Data Structures Basics',
        courseOffering: {
          id: 'offering-2',
          course: {
            code: 'CS201',
            title: 'Data Structures',
          },
        },
        totalPoints: 30,
        dueDate: '2024-10-20T23:59:59Z',
        questions: [
          {
            id: 'q4',
            questionText: 'What is the time complexity of binary search?',
            questionType: 'MCQ-Single',
            options: [
              { id: 'opt4', text: 'O(n)', isCorrect: false },
              { id: 'opt5', text: 'O(log n)', isCorrect: true },
              { id: 'opt6', text: 'O(n²)', isCorrect: false },
            ],
            points: 10,
          },
          {
            id: 'q5',
            questionText: 'True or False: Arrays have fixed size.',
            questionType: 'True-False',
            options: [
              { id: 'opt7', text: 'True', isCorrect: true },
              { id: 'opt8', text: 'False', isCorrect: false },
            ],
            points: 10,
          },
        ],
      },
    ];

    if (courseOffering) {
      const filtered = allAssessments.filter(a => a.courseOffering.id === courseOffering);
      return HttpResponse.json(filtered);
    }

    return HttpResponse.json(allAssessments);
  }),

  // My Submissions endpoint
  http.get(`${API_BASE_URL}/submissions/my-submissions`, ({ request }) => {
    const url = new URL(request.url);
    const assessment = url.searchParams.get('assessment');
    
    const allSubmissions = [
      {
        id: 'submission-1',
        assessment: {
          id: 'assessment-2',
          title: 'Assignment 1: Basic Algorithms',
          courseOffering: {
            id: 'offering-1',
            course: {
              code: 'CS101',
              title: 'Introduction to Programming',
            },
          },
          totalPoints: 50,
          dueDate: '2024-10-05T23:59:59Z',
        },
        student_id: '1',
        status: 'graded',
        totalScore: 45,
        gradedBy: {
          id: '2',
          name: 'Dr. Fatima Ali',
        },
        answers: [
          {
            questionId: 'q3',
            fileUrl: 'https://example.com/files/submission1.py',
          },
        ],
        submittedAt: '2024-10-04T14:30:00Z',
        gradedAt: '2024-10-06T10:00:00Z',
      },
      {
        id: 'submission-2',
        assessment: {
          id: 'assessment-1',
          title: 'Midterm Exam - Chapter 1-5',
          courseOffering: {
            id: 'offering-1',
            course: {
              code: 'CS101',
              title: 'Introduction to Programming',
            },
          },
          totalPoints: 100,
          dueDate: '2024-10-15T23:59:59Z',
        },
        student_id: '1',
        status: 'submitted',
        totalScore: 0,
        answers: [
          {
            questionId: 'q1',
            selectedOptionId: 'opt1',
          },
          {
            questionId: 'q2',
            answerText: 'Loops are control structures that allow repeated execution of code...',
          },
        ],
        submittedAt: '2024-10-15T20:00:00Z',
      },
      {
        id: 'submission-3',
        assessment: {
          id: 'assessment-3',
          title: 'Quiz: Data Structures Basics',
          courseOffering: {
            id: 'offering-2',
            course: {
              code: 'CS201',
              title: 'Data Structures',
            },
          },
          totalPoints: 30,
          dueDate: '2024-10-20T23:59:59Z',
        },
        student_id: '1',
        status: 'in_progress',
        totalScore: 0,
        answers: [
          {
            questionId: 'q4',
            selectedOptionId: 'opt5',
          },
        ],
        submittedAt: undefined,
      },
    ];

    if (assessment) {
      const filtered = allSubmissions.filter(s => s.assessment.id === assessment);
      return HttpResponse.json(filtered);
    }

    return HttpResponse.json(allSubmissions);
  }),

  // Course Offerings endpoint
  http.get(`${API_BASE_URL}/offerings`, ({ request }) => {
    const url = new URL(request.url);
    const semester = url.searchParams.get('semester');
    
    // Return mock course offerings
    const mockOfferings = [
      {
        id: 'offering-1',
        course: {
          id: 'catalog-1',
          title: 'Introduction to Programming',
          code: 'CS101',
          creditHours: 3,
          description: 'Fundamentals of programming including variables, data types, control structures, functions, and basic algorithms. This course provides a solid foundation for further programming courses.',
          department: {
            id: 'dept-1',
            name: 'Computer Science',
          },
          prerequisites: [],
        },
        semester: 'Fall 2025',
        doctors: [
          { id: '2', name: 'Dr. Fatima Ali' },
        ],
        tas: [
          { id: 'ta-1', name: 'Ahmed Mohamed' },
        ],
        schedule: [
          {
            day: 'Sunday',
            startTime: '10:00',
            endTime: '12:00',
            location: 'Hall 501',
            sessionType: 'lecture',
          },
          {
            day: 'Tuesday',
            startTime: '10:00',
            endTime: '12:00',
            location: 'Lab 201',
            sessionType: 'lab',
          },
        ],
        maxSeats: 50,
        gradingPolicy: {
          attendance: 10,
          midterm: 20,
          assignments: 20,
          project: 10,
          finalExam: 40,
        },
      },
      {
        id: 'offering-2',
        course: {
          id: 'catalog-2',
          title: 'Data Structures and Algorithms',
          code: 'CS201',
          creditHours: 4,
          description: 'Study of fundamental data structures including arrays, linked lists, stacks, queues, trees, and graphs. Algorithm analysis and design techniques.',
          department: {
            id: 'dept-1',
            name: 'Computer Science',
          },
          prerequisites: [
            {
              id: 'catalog-1',
              title: 'Introduction to Programming',
              code: 'CS101',
              creditHours: 3,
              description: '',
              department: { id: 'dept-1', name: 'Computer Science' },
            },
          ],
        },
        semester: 'Fall 2025',
        doctors: [
          { id: '2', name: 'Dr. Fatima Ali' },
        ],
        tas: [
          { id: 'ta-2', name: 'Sara Ibrahim' },
        ],
        schedule: [
          {
            day: 'Monday',
            startTime: '09:00',
            endTime: '11:00',
            location: 'Hall 502',
            sessionType: 'lecture',
          },
          {
            day: 'Wednesday',
            startTime: '09:00',
            endTime: '11:00',
            location: 'Lab 202',
            sessionType: 'lab',
          },
        ],
        maxSeats: 40,
        gradingPolicy: {
          attendance: 10,
          midterm: 25,
          assignments: 25,
          finalExam: 40,
        },
      },
      {
        id: 'offering-3',
        course: {
          id: 'catalog-3',
          title: 'Database Systems',
          code: 'CS301',
          creditHours: 3,
          description: 'Introduction to database concepts, SQL, relational database design, normalization, and database management systems.',
          department: {
            id: 'dept-1',
            name: 'Computer Science',
          },
          prerequisites: [
            {
              id: 'catalog-2',
              title: 'Data Structures and Algorithms',
              code: 'CS201',
              creditHours: 4,
              description: '',
              department: { id: 'dept-1', name: 'Computer Science' },
            },
          ],
        },
        semester: 'Fall 2025',
        doctors: [
          { id: '2', name: 'Dr. Fatima Ali' },
        ],
        tas: [],
        schedule: [
          {
            day: 'Sunday',
            startTime: '14:00',
            endTime: '16:00',
            location: 'Hall 503',
            sessionType: 'lecture',
          },
          {
            day: 'Thursday',
            startTime: '14:00',
            endTime: '16:00',
            location: 'Lab 203',
            sessionType: 'lab',
          },
        ],
        maxSeats: 45,
        gradingPolicy: {
          attendance: 10,
          midterm: 20,
          assignments: 30,
          finalExam: 40,
        },
      },
      {
        id: 'offering-4',
        course: {
          id: 'catalog-4',
          title: 'Web Development',
          code: 'CS401',
          creditHours: 3,
          description: 'Modern web development using HTML, CSS, JavaScript, and frameworks. Frontend and backend development concepts.',
          department: {
            id: 'dept-1',
            name: 'Computer Science',
          },
          prerequisites: [
            {
              id: 'catalog-1',
              title: 'Introduction to Programming',
              code: 'CS101',
              creditHours: 3,
              description: '',
              department: { id: 'dept-1', name: 'Computer Science' },
            },
          ],
        },
        semester: 'Fall 2025',
        doctors: [
          { id: '2', name: 'Dr. Fatima Ali' },
        ],
        tas: [
          { id: 'ta-3', name: 'Mohamed Hassan' },
        ],
        schedule: [
          {
            day: 'Tuesday',
            startTime: '14:00',
            endTime: '17:00',
            location: 'Lab 301',
            sessionType: 'lab',
          },
        ],
        maxSeats: 35,
        gradingPolicy: {
          attendance: 10,
          assignments: 40,
          project: 20,
          finalExam: 30,
        },
      },
      {
        id: 'offering-5',
        course: {
          id: 'catalog-5',
          title: 'Operating Systems',
          code: 'CS302',
          creditHours: 3,
          description: 'Operating system concepts including process management, memory management, file systems, and concurrency.',
          department: {
            id: 'dept-1',
            name: 'Computer Science',
          },
          prerequisites: [
            {
              id: 'catalog-2',
              title: 'Data Structures and Algorithms',
              code: 'CS201',
              creditHours: 4,
              description: '',
              department: { id: 'dept-1', name: 'Computer Science' },
            },
          ],
        },
        semester: 'Fall 2025',
        doctors: [
          { id: '2', name: 'Dr. Fatima Ali' },
        ],
        tas: [],
        schedule: [
          {
            day: 'Monday',
            startTime: '12:00',
            endTime: '14:00',
            location: 'Hall 504',
            sessionType: 'lecture',
          },
          {
            day: 'Wednesday',
            startTime: '12:00',
            endTime: '14:00',
            location: 'Hall 504',
            sessionType: 'lecture',
          },
        ],
        maxSeats: 50,
        gradingPolicy: {
          attendance: 10,
          midterm: 30,
          assignments: 20,
          finalExam: 40,
        },
      },
      {
        id: 'offering-6',
        course: {
          id: 'catalog-6',
          title: 'Software Engineering',
          code: 'CS402',
          creditHours: 3,
          description: 'Software development lifecycle, requirements analysis, design patterns, testing, and project management.',
          department: {
            id: 'dept-1',
            name: 'Computer Science',
          },
          prerequisites: [
            {
              id: 'catalog-3',
              title: 'Database Systems',
              code: 'CS301',
              creditHours: 3,
              description: '',
              department: { id: 'dept-1', name: 'Computer Science' },
            },
          ],
        },
        semester: 'Fall 2025',
        doctors: [
          { id: '2', name: 'Dr. Fatima Ali' },
        ],
        tas: [
          { id: 'ta-4', name: 'Nour Ali' },
        ],
        schedule: [
          {
            day: 'Sunday',
            startTime: '12:00',
            endTime: '14:00',
            location: 'Hall 505',
            sessionType: 'lecture',
          },
          {
            day: 'Tuesday',
            startTime: '12:00',
            endTime: '14:00',
            location: 'Hall 505',
            sessionType: 'lecture',
          },
        ],
        maxSeats: 40,
        gradingPolicy: {
          attendance: 10,
          midterm: 20,
          assignments: 30,
          project: 20,
          finalExam: 20,
        },
      },
    ];

    // Filter by semester if provided
    if (semester === 'current') {
      return HttpResponse.json(mockOfferings);
    }

    return HttpResponse.json(mockOfferings);
  }),

  // Materials endpoint
  http.get(`${API_BASE_URL}/materials`, ({ request }) => {
    const url = new URL(request.url);
    const courseOffering = url.searchParams.get('courseOffering');
    
    const allMaterials = [
      {
        id: 'material-1',
        title: 'Introduction to Programming - Lecture 1',
        description: 'Overview of programming concepts and fundamentals',
        courseOffering: {
          id: 'offering-1',
          course: {
            code: 'CS101',
            title: 'Introduction to Programming',
          },
        },
        category: 'Lectures',
        isExternalLink: false,
        url: 'https://example.com/files/cs101-lecture1.pdf',
        fileName: 'CS101_Lecture_1.pdf',
        fileType: 'pdf',
        uploadedBy: {
          id: '2',
          name: 'Dr. Fatima Ali',
        },
        uploadedAt: '2024-09-15T10:00:00Z',
      },
      {
        id: 'material-2',
        title: 'Programming Assignment Sheet 1',
        description: 'Practice problems for variables and data types',
        courseOffering: {
          id: 'offering-1',
          course: {
            code: 'CS101',
            title: 'Introduction to Programming',
          },
        },
        category: 'Sheets',
        isExternalLink: false,
        url: 'https://example.com/files/cs101-assignment1.pdf',
        fileName: 'Assignment_Sheet_1.pdf',
        fileType: 'pdf',
        uploadedBy: {
          id: '2',
          name: 'Dr. Fatima Ali',
        },
        uploadedAt: '2024-09-20T14:00:00Z',
      },
      {
        id: 'material-3',
        title: 'Recommended Reading: Clean Code',
        description: 'Chapter 1-3 from Clean Code book',
        courseOffering: {
          id: 'offering-1',
          course: {
            code: 'CS101',
            title: 'Introduction to Programming',
          },
        },
        category: 'Readings',
        isExternalLink: true,
        url: 'https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882',
        fileName: undefined,
        fileType: undefined,
        uploadedBy: {
          id: '2',
          name: 'Dr. Fatima Ali',
        },
        uploadedAt: '2024-09-10T09:00:00Z',
      },
      {
        id: 'material-4',
        title: 'Data Structures - Week 1 Slides',
        description: 'Introduction to arrays and linked lists',
        courseOffering: {
          id: 'offering-2',
          course: {
            code: 'CS201',
            title: 'Data Structures',
          },
        },
        category: 'Lectures',
        isExternalLink: false,
        url: 'https://example.com/files/cs201-week1.pptx',
        fileName: 'CS201_Week1_Slides.pptx',
        fileType: 'pptx',
        uploadedBy: {
          id: '2',
          name: 'Dr. Fatima Ali',
        },
        uploadedAt: '2024-09-18T11:00:00Z',
      },
      {
        id: 'material-5',
        title: 'YouTube: Data Structures Tutorial',
        description: 'Visual explanation of binary trees',
        courseOffering: {
          id: 'offering-2',
          course: {
            code: 'CS201',
            title: 'Data Structures',
          },
        },
        category: 'Links',
        isExternalLink: true,
        url: 'https://www.youtube.com/watch?v=example',
        fileName: undefined,
        fileType: undefined,
        uploadedBy: {
          id: '2',
          name: 'Dr. Fatima Ali',
        },
        uploadedAt: '2024-09-22T16:00:00Z',
      },
    ];

    // Filter by course if specified
    if (courseOffering) {
      const filtered = allMaterials.filter(m => m.courseOffering.id === courseOffering);
      return HttpResponse.json(filtered);
    }

    return HttpResponse.json(allMaterials);
  }),
];

