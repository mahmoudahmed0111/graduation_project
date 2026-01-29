import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from './store/authStore';
import { useTenantStore } from './store/tenantStore';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Layout } from './components/layout/Layout';
import { Toaster } from './components/ui/Toaster';
import { Landing } from './pages/Landing';
import { Login } from './pages/auth/Login';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { OTP } from './pages/auth/OTP';
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
import { Settings } from './pages/shared/Settings';
import { Students, CreateStudent, EditStudent, ShowStudent } from './pages/admin/Students';
import { ManageMaterials, UploadMaterial } from './pages/doctor/Materials';
import { CreateAssessment, GradeSubmissions } from './pages/doctor/Assessments';
import { AttendanceSessions } from './pages/doctor/Attendance';
import { CalculateFinalGrades } from './pages/doctor/Grades';
import { Colleges, CreateCollege, EditCollege, Departments, CreateDepartment, EditDepartment } from './pages/admin/Organizational';
import { CourseCatalog, CourseOfferings } from './pages/admin/Academic';
import { AllUsers } from './pages/admin/Users';
import { SystemSettings } from './pages/admin/SystemSettings';
import './styles/index.css';
import './lib/i18n';

function App() {
  const { t } = useTranslation();
  const { isAuthenticated, user } = useAuthStore();
  const { loadUniversityMeta, loadUniversities } = useTenantStore();

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
    <BrowserRouter>
      <Toaster />
      <Routes>
        <Route
          path="/"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Landing />}
        />
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
          <Route path="materials" element={<Materials />} />
          <Route 
            path="materials/upload" 
            element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <UploadMaterial />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="materials/manage" 
            element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <ManageMaterials />
              </ProtectedRoute>
            } 
          />
          <Route path="assessments/my-assessments" element={<MyAssessments />} />
          <Route path="assessments/submissions" element={<MySubmissions />} />
          <Route 
            path="assessments/create" 
            element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <CreateAssessment />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="assessments/grade" 
            element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <GradeSubmissions />
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
          <Route path="students" element={<Students />} />
          <Route path="students/create" element={<CreateStudent />} />
          <Route path="students/:id" element={<ShowStudent />} />
          <Route path="students/:id/edit" element={<EditStudent />} />
          
          {/* User Management */}
          <Route
            path="users/students"
            element={
              <ProtectedRoute allowedRoles={['universityAdmin', 'collegeAdmin']}>
                <Students />
              </ProtectedRoute>
            }
          />
          <Route
            path="users/doctors"
            element={
              <ProtectedRoute allowedRoles={['universityAdmin', 'collegeAdmin']}>
                <AllUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="users/tas"
            element={
              <ProtectedRoute allowedRoles={['universityAdmin', 'collegeAdmin']}>
                <AllUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="users/admins"
            element={
              <ProtectedRoute allowedRoles={['universityAdmin']}>
                <AllUsers />
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
            path="academic/offerings"
            element={
              <ProtectedRoute allowedRoles={['universityAdmin', 'collegeAdmin']}>
                <CourseOfferings />
              </ProtectedRoute>
            }
          />
          
          <Route path="settings" element={<Settings />} />
          <Route
            path="system-settings"
            element={
              <ProtectedRoute allowedRoles={['universityAdmin']}>
                <SystemSettings />
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

