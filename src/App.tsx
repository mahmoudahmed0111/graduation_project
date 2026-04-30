import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from './store/authStore';
import { useTenantStore } from './store/tenantStore';
import { useThemeStore } from './store/themeStore';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Layout } from './components/layout/Layout';
import { Toaster } from './components/ui/Toaster';
import { Landing } from './pages/Landing';
import { PublicLayout } from './pages/public/PublicLayout';
import { Home as PublicHome } from './pages/public/Home';
import { About as PublicAbout } from './pages/public/About';
import { Colleges as PublicColleges } from './pages/public/Colleges';
import { Academics as PublicAcademics } from './pages/public/Academics';
import { Admissions as PublicAdmissions } from './pages/public/Admissions';
import { Research as PublicResearch } from './pages/public/Research';
import { CampusLife as PublicCampusLife } from './pages/public/CampusLife';
import { News as PublicNews } from './pages/public/News';
import { Contact as PublicContact } from './pages/public/Contact';
import { PrivacyPolicy as PublicPrivacy } from './pages/public/PrivacyPolicy';
import { TermsOfUse as PublicTerms } from './pages/public/TermsOfUse';
import { Sitemap as PublicSitemap } from './pages/public/Sitemap';
import { Login } from './pages/auth/Login';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { OTP } from './pages/auth/OTP';
import { ResetPassword } from './pages/auth/ResetPassword';
import { ComingSoon } from './pages/auth/ComingSoon';
import { Error403 } from './pages/auth/Error403';
import { Maintenance } from './pages/auth/Maintenance';
import { Lock } from './pages/auth/Lock';
import { StudentDashboard } from './pages/student/StudentDashboard';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { DoctorDashboard } from './pages/doctor/DoctorDashboard';
import { TeacherRoster } from './pages/doctor/TeacherRoster';
import { Analytics } from './pages/shared/Analytics';
import { AllCourses } from './pages/shared/Courses';
import { StaticUiDashboard } from './pages/shared/StaticUiDashboard';
import { MyCourses } from './pages/student/Courses';
import { EnrollCourse } from './pages/student/Courses';
import { Enrollments } from './pages/student/Enrollment';
import { Materials } from './pages/shared/Materials';
import { MyAssessments } from './pages/student/Assessments';
import { MySubmissions } from './pages/student/Assessments';
import { Attendance } from './pages/student/Attendance';
import { Announcements } from './pages/shared/Announcements';
import { Chatbot } from './pages/shared/Chatbot';
import { Notifications } from './pages/shared/Notifications';
import { Profile } from './pages/shared/Profile';
import { ManageMaterials, UploadMaterial, EditMaterial } from './pages/doctor/Materials';
import { MaterialDetail } from './pages/shared/Materials';
import { AssessmentDetail } from './pages/shared/Assessments';
import { CreateAssessment, EditAssessment, AssessmentList, GradeSubmissions } from './pages/doctor/Assessments';
import { TakeAssessment, SubmissionResult } from './pages/student/Assessments';
import { CourseGradebook } from './pages/doctor/Gradebook';
import { FinalExamEntry, StudentGpaRebuild } from './pages/admin/Gradebook';
import { MyGrades } from './pages/student/Grades';
import { AttendanceSessions } from './pages/doctor/Attendance';
import { CalculateFinalGrades } from './pages/doctor/Grades';
import {
  Colleges,
  CreateCollege,
  EditCollege,
  CollegeDetails,
  Departments,
  CreateDepartment,
  EditDepartment,
  Locations,
  CreateLocation,
  EditLocation,
} from './pages/admin/Organizational';
import {
  CourseCatalog,
  CourseOfferings,
  AdminEnrollments,
  CreateCatalogCoursePage,
  CreateCourseOfferingPage,
  EditCourseOfferingPage,
  ForceEnrollPage,
} from './pages/admin/Academic';
import {
  UsersDirectory,
  UserDetailsPage,
  CreateUserPage,
  BulkImportUsersPage,
  LegacyUsersDirectoryRedirect,
  UserFromLegacyDirectoryRedirect,
  RedirectToUsersStudents,
  RedirectToUsersStudentsCreate,
  RedirectToUsersStudentProfile,
  RedirectUserEditToDetail,
} from './pages/admin/Users';
import { ChangePasswordPage } from './pages/shared/Account/ChangePasswordPage';
import { SystemSettings } from './pages/admin/SystemSettings';
import { AuditLogs } from './pages/admin/AuditLogs';
import './styles/index.css';
import './lib/i18n';

function App() {
  const { t } = useTranslation();
  const { isAuthenticated, user } = useAuthStore();
  const { loadUniversityMeta, loadUniversities } = useTenantStore();
  const { theme, setTheme } = useThemeStore();

  // Keep <html class="dark"> in sync with the persisted theme
  useEffect(() => {
    setTheme(theme);
  }, [theme, setTheme]);

  useEffect(() => {
    // Load university metadata on mount
    const universitySlug = import.meta.env.VITE_PUBLIC_UNIVERSITY_SLUG;
    if (universitySlug) {
      // In real app, you'd fetch by slug first, then load meta
      loadUniversityMeta('university-1');
    }

    // Load universities list for tenant switcher
    if (user?.role === 'superAdmin' || user?.role === 'admin') {
      loadUniversities();
    }
  }, [user, loadUniversityMeta, loadUniversities]);

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Toaster />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<PublicHome />} />
          <Route path="/about" element={<PublicAbout />} />
          <Route path="/colleges" element={<PublicColleges />} />
          <Route path="/academics" element={<PublicAcademics />} />
          <Route path="/admissions" element={<PublicAdmissions />} />
          <Route path="/research" element={<PublicResearch />} />
          <Route path="/campus-life" element={<PublicCampusLife />} />
          <Route path="/news" element={<PublicNews />} />
          <Route path="/contact" element={<PublicContact />} />
          <Route path="/privacy" element={<PublicPrivacy />} />
          <Route path="/terms" element={<PublicTerms />} />
          <Route path="/sitemap" element={<PublicSitemap />} />
        </Route>
        <Route path="/landing-old" element={<Landing />} />
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
        />
        <Route
          path="/forgot-password"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <ForgotPassword />}
        />
        <Route
          path="/otp"
          element={<OTP />}
        />
        <Route
          path="/reset-password/:token"
          element={<ResetPassword />}
        />
        <Route
          path="/coming-soon"
          element={<ComingSoon />}
        />
        <Route
          path="/403"
          element={<Error403 />}
        />
        <Route
          path="/maintenance"
          element={<Maintenance />}
        />
        <Route
          path="/lock"
          element={<Lock />}
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route
            index
            element={
              user?.role === 'student' ? (
                <StudentDashboard />
              ) : user?.role === 'doctor' ? (
                <DoctorDashboard />
              ) : user?.role === 'universityAdmin' || user?.role === 'collegeAdmin' ? (
                <AdminDashboard />
              ) : (
                <div className="p-6">
                  <h1 className="text-2xl font-bold">{t('common.dashboard')}</h1>
                  <p className="text-gray-600 mt-2">{t('common.welcome')}, {user?.name}</p>
                </div>
              )
            }
          />
          <Route path="ui-preview" element={<StaticUiDashboard />} />
          <Route
            path="roster"
            element={
              <ProtectedRoute allowedRoles={['doctor', 'teacher', 'admin']}>
                <TeacherRoster />
              </ProtectedRoute>
            }
          />
          <Route path="courses/all" element={<AllCourses />} />
          <Route path="courses/my-courses" element={<MyCourses />} />
          <Route path="courses/enroll" element={<EnrollCourse />} />
          <Route path="enrollments" element={<Enrollments />} />
          {/* Materials — aggregated cross-course view + legacy flat routes (Phase 4 wired) */}
          <Route path="materials" element={<Materials />} />
          <Route
            path="materials/upload"
            element={
              <ProtectedRoute allowedRoles={['doctor', 'teacher', 'ta']}>
                <UploadMaterial />
              </ProtectedRoute>
            }
          />
          <Route
            path="materials/manage"
            element={
              <ProtectedRoute allowedRoles={['doctor', 'teacher', 'ta']}>
                <ManageMaterials />
              </ProtectedRoute>
            }
          />

          {/* Phase 4 nested per-offering routes */}
          <Route path="course-offerings/:offeringId/materials" element={<ManageMaterials />} />
          <Route
            path="course-offerings/:offeringId/materials/upload"
            element={
              <ProtectedRoute allowedRoles={['doctor', 'teacher', 'ta']}>
                <UploadMaterial />
              </ProtectedRoute>
            }
          />
          <Route
            path="course-offerings/:offeringId/materials/:id/edit"
            element={
              <ProtectedRoute allowedRoles={['doctor', 'teacher', 'ta']}>
                <EditMaterial />
              </ProtectedRoute>
            }
          />
          <Route path="course-offerings/:offeringId/materials/:id" element={<MaterialDetail />} />

          {/* Assessments */}
          <Route path="assessments/my-assessments" element={<MyAssessments />} />
          <Route path="assessments/submissions" element={<MySubmissions />} />
          <Route
            path="assessments/create"
            element={
              <ProtectedRoute allowedRoles={['doctor', 'teacher']}>
                <CreateAssessment />
              </ProtectedRoute>
            }
          />
          <Route
            path="assessments/grade"
            element={
              <ProtectedRoute allowedRoles={['doctor', 'teacher', 'ta']}>
                <GradeSubmissions />
              </ProtectedRoute>
            }
          />
          <Route path="course-offerings/:offeringId/assessments" element={<AssessmentList />} />
          <Route
            path="course-offerings/:offeringId/assessments/create"
            element={
              <ProtectedRoute allowedRoles={['doctor', 'teacher']}>
                <CreateAssessment />
              </ProtectedRoute>
            }
          />
          <Route path="course-offerings/:offeringId/assessments/:id" element={<AssessmentDetail />} />
          <Route
            path="course-offerings/:offeringId/assessments/:id/edit"
            element={
              <ProtectedRoute allowedRoles={['doctor', 'teacher']}>
                <EditAssessment />
              </ProtectedRoute>
            }
          />
          <Route
            path="course-offerings/:offeringId/assessments/:id/take"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <TakeAssessment />
              </ProtectedRoute>
            }
          />
          <Route
            path="course-offerings/:offeringId/assessments/:assessmentId/submissions"
            element={
              <ProtectedRoute allowedRoles={['doctor', 'teacher', 'ta', 'collegeAdmin', 'universityAdmin', 'admin', 'superAdmin']}>
                <GradeSubmissions />
              </ProtectedRoute>
            }
          />

          {/* Submission detail (read-only result for students) */}
          <Route path="submissions/:submissionId" element={<SubmissionResult />} />

          {/* Gradebook */}
          <Route
            path="course-offerings/:offeringId/gradebook"
            element={
              <ProtectedRoute allowedRoles={['doctor', 'teacher', 'ta', 'collegeAdmin', 'universityAdmin', 'admin', 'superAdmin']}>
                <CourseGradebook />
              </ProtectedRoute>
            }
          />
          <Route
            path="course-offerings/:offeringId/final-exam"
            element={
              <ProtectedRoute allowedRoles={['collegeAdmin', 'universityAdmin', 'admin', 'superAdmin']}>
                <FinalExamEntry />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/gpa-rebuild"
            element={
              <ProtectedRoute allowedRoles={['universityAdmin', 'admin', 'superAdmin']}>
                <StudentGpaRebuild />
              </ProtectedRoute>
            }
          />
          <Route
            path="my-grades"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <MyGrades />
              </ProtectedRoute>
            }
          />
          <Route
            path="gradebook"
            element={
              <ProtectedRoute allowedRoles={['doctor', 'teacher', 'ta', 'collegeAdmin', 'universityAdmin', 'admin', 'superAdmin']}>
                <CourseGradebook />
              </ProtectedRoute>
            }
          />
          <Route path="attendance" element={<Attendance />} />
          <Route 
            path="attendance/sessions" 
            element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <AttendanceSessions />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="grades" 
            element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <CalculateFinalGrades />
              </ProtectedRoute>
            } 
          />
          <Route path="announcements" element={<Announcements />} />
          <Route path="chatbot" element={<Chatbot />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="profile" element={<Profile />} />
          <Route path="account/change-password" element={<ChangePasswordPage />} />
          <Route path="students" element={<RedirectToUsersStudents />} />
          <Route path="students/create" element={<RedirectToUsersStudentsCreate />} />
          <Route path="students/:id" element={<RedirectToUsersStudentProfile />} />
          <Route path="students/:id/edit" element={<RedirectToUsersStudentProfile />} />

          {/* User management — Phase 2 `GET /users` per role; filters in URL query string */}
          <Route path="users/directory" element={<LegacyUsersDirectoryRedirect />} />
          <Route path="users/directory/create" element={<Navigate to="/dashboard/users/create" replace />} />
          <Route path="users/directory/bulk-import" element={<Navigate to="/dashboard/users/bulk-import" replace />} />
          <Route
            path="users/directory/:id"
            element={
              <ProtectedRoute allowedRoles={['universityAdmin', 'collegeAdmin']}>
                <UserFromLegacyDirectoryRedirect />
              </ProtectedRoute>
            }
          />
          <Route
            path="users/create"
            element={
              <ProtectedRoute allowedRoles={['universityAdmin', 'collegeAdmin']}>
                <CreateUserPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="users/bulk-import"
            element={
              <ProtectedRoute allowedRoles={['universityAdmin', 'collegeAdmin']}>
                <BulkImportUsersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="users/students/create"
            element={
              <ProtectedRoute allowedRoles={['universityAdmin', 'collegeAdmin']}>
                <CreateUserPage
                  defaultRole="student"
                  lockRole
                  cancelReturnPath="/dashboard/users/students"
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="users/students/:id"
            element={
              <ProtectedRoute allowedRoles={['universityAdmin', 'collegeAdmin']}>
                <UserDetailsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="users/students"
            element={
              <ProtectedRoute allowedRoles={['universityAdmin', 'collegeAdmin']}>
                <UsersDirectory segment="students" />
              </ProtectedRoute>
            }
          />
          <Route
            path="users/doctors/create"
            element={
              <ProtectedRoute allowedRoles={['universityAdmin', 'collegeAdmin']}>
                <CreateUserPage
                  defaultRole="doctor"
                  lockRole
                  cancelReturnPath="/dashboard/users/doctors"
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="users/doctors/:id/edit"
            element={
              <ProtectedRoute allowedRoles={['universityAdmin', 'collegeAdmin']}>
                <RedirectUserEditToDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="users/doctors/:id"
            element={
              <ProtectedRoute allowedRoles={['universityAdmin', 'collegeAdmin']}>
                <UserDetailsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="users/doctors"
            element={
              <ProtectedRoute allowedRoles={['universityAdmin', 'collegeAdmin']}>
                <UsersDirectory segment="doctors" />
              </ProtectedRoute>
            }
          />
          <Route
            path="users/tas/create"
            element={
              <ProtectedRoute allowedRoles={['universityAdmin', 'collegeAdmin']}>
                <CreateUserPage defaultRole="ta" lockRole cancelReturnPath="/dashboard/users/tas" />
              </ProtectedRoute>
            }
          />
          <Route
            path="users/tas/:id/edit"
            element={
              <ProtectedRoute allowedRoles={['universityAdmin', 'collegeAdmin']}>
                <RedirectUserEditToDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="users/tas/:id"
            element={
              <ProtectedRoute allowedRoles={['universityAdmin', 'collegeAdmin']}>
                <UserDetailsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="users/tas"
            element={
              <ProtectedRoute allowedRoles={['universityAdmin', 'collegeAdmin']}>
                <UsersDirectory segment="tas" />
              </ProtectedRoute>
            }
          />
          <Route
            path="users/admins/create"
            element={
              <ProtectedRoute allowedRoles={['universityAdmin', 'collegeAdmin']}>
                <CreateUserPage cancelReturnPath="/dashboard/users/admins" />
              </ProtectedRoute>
            }
          />
          <Route
            path="users/admins/:id/edit"
            element={
              <ProtectedRoute allowedRoles={['universityAdmin', 'collegeAdmin']}>
                <RedirectUserEditToDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="users/admins/:id"
            element={
              <ProtectedRoute allowedRoles={['universityAdmin', 'collegeAdmin']}>
                <UserDetailsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="users/admins"
            element={
              <ProtectedRoute allowedRoles={['universityAdmin', 'collegeAdmin']}>
                <UsersDirectory segment="admins" />
              </ProtectedRoute>
            }
          />
          
          {/* Organizational Structure */}
          <Route
            path="organizational/colleges"
            element={
              <ProtectedRoute allowedRoles={['universityAdmin']}>
                <Colleges />
              </ProtectedRoute>
            }
          />
          <Route
            path="organizational/colleges/create"
            element={
              <ProtectedRoute allowedRoles={['universityAdmin']}>
                <CreateCollege />
              </ProtectedRoute>
            }
          />
          <Route
            path="organizational/colleges/:id/edit"
            element={
              <ProtectedRoute allowedRoles={['universityAdmin']}>
                <EditCollege />
              </ProtectedRoute>
            }
          />
          <Route
            path="organizational/colleges/:id"
            element={
              <ProtectedRoute allowedRoles={['universityAdmin']}>
                <CollegeDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="organizational/departments"
            element={
              <ProtectedRoute allowedRoles={['universityAdmin', 'collegeAdmin']}>
                <Departments />
              </ProtectedRoute>
            }
          />
          <Route
            path="organizational/departments/create"
            element={
              <ProtectedRoute allowedRoles={['universityAdmin', 'collegeAdmin']}>
                <CreateDepartment />
              </ProtectedRoute>
            }
          />
          <Route
            path="organizational/departments/:id/edit"
            element={
              <ProtectedRoute allowedRoles={['universityAdmin', 'collegeAdmin']}>
                <EditDepartment />
              </ProtectedRoute>
            }
          />
          <Route
            path="organizational/locations"
            element={
              <ProtectedRoute allowedRoles={['universityAdmin', 'collegeAdmin', 'doctor', 'ta', 'teacher']}>
                <Locations />
              </ProtectedRoute>
            }
          />
          <Route
            path="organizational/locations/create"
            element={
              <ProtectedRoute allowedRoles={['universityAdmin', 'collegeAdmin']}>
                <CreateLocation />
              </ProtectedRoute>
            }
          />
          <Route
            path="organizational/locations/:id/edit"
            element={
              <ProtectedRoute allowedRoles={['universityAdmin', 'collegeAdmin']}>
                <EditLocation />
              </ProtectedRoute>
            }
          />

          {/* Academic Structure */}
          <Route
            path="academic/catalog"
            element={
              <ProtectedRoute allowedRoles={['universityAdmin', 'collegeAdmin']}>
                <CourseCatalog />
              </ProtectedRoute>
            }
          />
          <Route
            path="academic/catalog/create"
            element={
              <ProtectedRoute allowedRoles={['universityAdmin', 'collegeAdmin']}>
                <CreateCatalogCoursePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="academic/offerings"
            element={
              <ProtectedRoute allowedRoles={['universityAdmin', 'collegeAdmin']}>
                <CourseOfferings />
              </ProtectedRoute>
            }
          />
          <Route
            path="academic/offerings/create"
            element={
              <ProtectedRoute allowedRoles={['universityAdmin', 'collegeAdmin']}>
                <CreateCourseOfferingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="academic/offerings/:id/edit"
            element={
              <ProtectedRoute allowedRoles={['universityAdmin', 'collegeAdmin']}>
                <EditCourseOfferingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="academic/enrollments"
            element={
              <ProtectedRoute allowedRoles={['universityAdmin', 'collegeAdmin']}>
                <AdminEnrollments />
              </ProtectedRoute>
            }
          />
          <Route
            path="academic/enrollments/force"
            element={
              <ProtectedRoute allowedRoles={['universityAdmin', 'collegeAdmin']}>
                <ForceEnrollPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="system-settings"
            element={
              <ProtectedRoute allowedRoles={['universityAdmin']}>
                <SystemSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="audit-logs"
            element={
              <ProtectedRoute allowedRoles={['universityAdmin', 'collegeAdmin']}>
                <AuditLogs />
              </ProtectedRoute>
            }
          />
          <Route
            path="analytics"
            element={
              <ProtectedRoute allowedRoles={['universityAdmin', 'collegeAdmin', 'doctor']}>
                <Analytics />
              </ProtectedRoute>
            }
          />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

