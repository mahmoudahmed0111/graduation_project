import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { IEnrollment, ICourseOffering } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  Clock, 
  Play,
  Square,
  Radio,
  BookOpen,
  MapPin,
  Users,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useToastStore } from '@/store/toastStore';
import { Select2 } from '@/components/ui/Select2';
import { logger } from '@/lib/logger';
import { formatDate } from '@/utils/formatters';

interface AttendanceSession {
  id: string;
  courseOffering: ICourseOffering;
  location: string;
  rfidReaderId: string;
  startTime: string;
  endTime?: string;
  status: 'active' | 'ended';
  attendedStudents: number;
  totalStudents: number;
}

export function AttendanceSessions() {
  const { t, i18n } = useTranslation();
  const { user } = useAuthStore();
  const { success, error: showError } = useToastStore();
  const [myCourses, setMyCourses] = useState<IEnrollment[]>([]);
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [startingSession, setStartingSession] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [availableLocations, setAvailableLocations] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const coursesData = await api.getMyCourses({ semester: 'current' }).catch(() => []);
        setMyCourses(Array.isArray(coursesData) ? coursesData : []);
        
        // Mock sessions - in real app, fetch from API
        const mockSessions: AttendanceSession[] = [
          {
            id: 'session-1',
            courseOffering: coursesData[0]?.courseOffering || {} as ICourseOffering,
            location: 'Hall 501',
            rfidReaderId: 'RFID-001',
            startTime: new Date().toISOString(),
            status: 'active',
            attendedStudents: 15,
            totalStudents: 20,
          },
        ];
        setSessions(mockSessions);
        
        // Mock locations - in real app, fetch from API
        setAvailableLocations(['Hall 501', 'Hall 502', 'Lab 201', 'Lab 202']);
      } catch (error) {
        logger.error('Failed to fetch data', {
          context: 'AttendanceSessions',
          error,
        });
        showError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleStartSession = async () => {
    if (!selectedCourse || !selectedLocation) {
      showError(
        i18n.language === 'ar'
          ? 'يرجى اختيار المقرر والموقع'
          : 'Please select a course and location'
      );
      return;
    }

    try {
      setStartingSession(true);
      
      // In real app, call API to start session
      // await api.startAttendanceSession({
      //   courseOffering: selectedCourse,
      //   location: selectedLocation,
      //   rfidReaderId: 'RFID-001', // Would come from location selection
      // });
      
      const course = myCourses.find(c => c.courseOffering?.id === selectedCourse);
      const newSession: AttendanceSession = {
        id: `session-${Date.now()}`,
        courseOffering: course?.courseOffering || {} as ICourseOffering,
        location: selectedLocation,
        rfidReaderId: 'RFID-001',
        startTime: new Date().toISOString(),
        status: 'active',
        attendedStudents: 0,
        totalStudents: 20, // Would come from enrollment count
      };
      
      setSessions([newSession, ...sessions]);
      success(
        i18n.language === 'ar'
          ? 'تم بدء جلسة الحضور بنجاح'
          : 'Attendance session started successfully'
      );
      
      // Reset form
      setSelectedCourse('');
      setSelectedLocation('');
    } catch (error) {
      logger.error('Failed to start session', {
        context: 'AttendanceSessions',
        error,
      });
      showError('Failed to start attendance session');
    } finally {
      setStartingSession(false);
    }
  };

  const handleStopSession = async (sessionId: string) => {
    try {
      // In real app, call API to stop session
      // await api.stopAttendanceSession(sessionId);
      
      setSessions(sessions.map(s => 
        s.id === sessionId 
          ? { ...s, status: 'ended', endTime: new Date().toISOString() }
          : s
      ));
      
      success(
        i18n.language === 'ar'
          ? 'تم إنهاء جلسة الحضور بنجاح'
          : 'Attendance session stopped successfully'
      );
    } catch (error) {
      logger.error('Failed to stop session', {
        context: 'AttendanceSessions',
        error,
      });
      showError('Failed to stop attendance session');
    }
  };

  const activeSessions = sessions.filter(s => s.status === 'active');
  const endedSessions = sessions.filter(s => s.status === 'ended');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {i18n.language === 'ar' ? 'إدارة جلسات الحضور' : 'Manage Attendance Sessions'}
        </h1>
        <p className="text-gray-600 mt-1">
          {i18n.language === 'ar'
            ? 'بدء وإيقاف جلسات الحضور باستخدام RFID'
            : 'Start and stop RFID attendance sessions'}
        </p>
      </div>

      {/* Start New Session */}
      <Card className="border-2 border-primary-200 bg-primary-50/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Radio className="h-5 w-5 text-primary-600" />
            {i18n.language === 'ar' ? 'بدء جلسة حضور جديدة' : 'Start New Attendance Session'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {i18n.language === 'ar' ? 'المقرر' : 'Course'} *
              </label>
              <Select2
                value={selectedCourse}
                onChange={setSelectedCourse}
                options={[
                  { value: '', label: i18n.language === 'ar' ? 'اختر المقرر...' : 'Select a course...' },
                  ...myCourses.map(course => ({
                    value: course.courseOffering?.id || '',
                    label: `${course.courseOffering?.course?.code} - ${course.courseOffering?.course?.title}`,
                  })),
                ]}
                placeholder={i18n.language === 'ar' ? 'اختر المقرر...' : 'Select a course...'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {i18n.language === 'ar' ? 'الموقع / قارئ RFID' : 'Location / RFID Reader'} *
              </label>
              <Select2
                value={selectedLocation}
                onChange={setSelectedLocation}
                options={[
                  { value: '', label: i18n.language === 'ar' ? 'اختر الموقع...' : 'Select location...' },
                  ...availableLocations.map(loc => ({
                    value: loc,
                    label: loc,
                  })),
                ]}
                placeholder={i18n.language === 'ar' ? 'اختر الموقع...' : 'Select location...'}
              />
            </div>
          </div>
          <Button
            onClick={handleStartSession}
            isLoading={startingSession}
            disabled={!selectedCourse || !selectedLocation}
            className="w-full md:w-auto"
          >
            <Play className="h-4 w-4 mr-2" />
            {i18n.language === 'ar' ? 'بدء الجلسة' : 'Start Session'}
          </Button>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      {activeSessions.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            {i18n.language === 'ar' ? 'الجلسات النشطة' : 'Active Sessions'} ({activeSessions.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeSessions.map((session) => (
              <Card key={session.id} className="border-2 border-green-200 bg-green-50/30">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Radio className="h-5 w-5 text-green-600 animate-pulse" />
                      <span>{session.courseOffering.course?.code}</span>
                    </CardTitle>
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                      {i18n.language === 'ar' ? 'نشط' : 'Active'}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <BookOpen className="h-4 w-4" />
                    <span>{session.courseOffering.course?.title}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{session.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Radio className="h-4 w-4" />
                    <span>RFID: {session.rfidReaderId}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>
                      {i18n.language === 'ar' ? 'بدأت في:' : 'Started:'} {formatDate(session.startTime)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>
                      {session.attendedStudents} / {session.totalStudents} {i18n.language === 'ar' ? 'طالب' : 'students'}
                    </span>
                  </div>
                  <div className="pt-3 border-t border-gray-200">
                    <Button
                      variant="danger"
                      onClick={() => handleStopSession(session.id)}
                      className="w-full"
                      size="sm"
                    >
                      <Square className="h-4 w-4 mr-2" />
                      {i18n.language === 'ar' ? 'إيقاف الجلسة' : 'Stop Session'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Ended Sessions */}
      {endedSessions.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-gray-400" />
            {i18n.language === 'ar' ? 'الجلسات المنتهية' : 'Ended Sessions'} ({endedSessions.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {endedSessions.map((session) => (
              <Card key={session.id} className="border border-gray-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Radio className="h-5 w-5 text-gray-400" />
                      <span>{session.courseOffering.course?.code}</span>
                    </CardTitle>
                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                      {i18n.language === 'ar' ? 'منتهي' : 'Ended'}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <BookOpen className="h-4 w-4" />
                    <span>{session.courseOffering.course?.title}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{session.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>
                      {i18n.language === 'ar' ? 'من:' : 'From:'} {formatDate(session.startTime)}
                    </span>
                  </div>
                  {session.endTime && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>
                        {i18n.language === 'ar' ? 'إلى:' : 'To:'} {formatDate(session.endTime)}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>
                      {session.attendedStudents} / {session.totalStudents} {i18n.language === 'ar' ? 'طالب' : 'students'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* No Sessions Message */}
      {sessions.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Radio className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              {i18n.language === 'ar' ? 'لا توجد جلسات حضور' : 'No attendance sessions'}
            </p>
            <p className="text-sm text-gray-500">
              {i18n.language === 'ar'
                ? 'ابدأ جلسة حضور جديدة لبدء تسجيل الحضور'
                : 'Start a new attendance session to begin recording attendance'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

