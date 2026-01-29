import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { ICourseOffering } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  BookOpen, 
  Users, 
  Clock, 
  MapPin, 
  Calendar,
  Search,
  User,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToastStore } from '@/store/toastStore';
import { logger } from '@/lib/logger';

export function AllCourses() {
  const { t } = useTranslation();
  useAuthStore();
  const { error: showError } = useToastStore();
  const [offerings, setOfferings] = useState<ICourseOffering[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');


  useEffect(() => {
    const fetchOfferings = async () => {
      try {
        setLoading(true);
        const data = await api.getCourseOfferings({ semester: 'current' });
        // Ensure data is always an array
        const offeringsArray = Array.isArray(data) ? data : [];
        setOfferings(offeringsArray);
      } catch (error) {
        logger.error('Failed to fetch course offerings', {
          context: 'AllCourses',
          error,
        });
        showError('Failed to load courses');
        setOfferings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOfferings();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- showError stable, fetch once

  // Get unique departments for filter - ensure offerings is an array
  const departments = Array.isArray(offerings) 
    ? Array.from(
        new Set(offerings.map(o => o?.course?.department?.name).filter(Boolean))
      )
    : [];

  // Filter offerings - ensure offerings is an array
  const filteredOfferings = Array.isArray(offerings)
    ? offerings.filter(offering => {
        if (!offering?.course) return false;
        const matchesSearch = 
          offering.course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          offering.course.code?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDepartment = !selectedDepartment || 
          offering.course.department?.name === selectedDepartment;
        return matchesSearch && matchesDepartment;
      })
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('nav.allCourses')}</h1>
          <p className="text-gray-600 mt-1">Browse available courses for the current semester</p>
        </div>
        <Link to="/dashboard/courses/enroll">
          <Button variant="primary">
            <BookOpen className="h-4 w-4 mr-2" />
            Enroll in Course
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <>
          {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by course code or title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Course Grid */}
      {filteredOfferings.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No courses found matching your criteria</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOfferings.map((offering) => (
            <Card key={offering.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-primary-600 bg-primary-50 px-2 py-1 rounded">
                        {offering.course.code}
                      </span>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {offering.course.creditHours} Credits
                      </span>
                    </div>
                    <CardTitle className="text-lg mb-2">{offering.course.title}</CardTitle>
                    <p className="text-sm text-gray-600">{offering.course.department.name}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Instructors */}
                {offering.doctors.length > 0 && (
                  <div className="flex items-start gap-2">
                    <User className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">Instructors</p>
                      <p className="text-sm text-gray-700">
                        {offering.doctors.map(d => d.name).join(', ')}
                      </p>
                    </div>
                  </div>
                )}

                {/* Schedule */}
                {offering.schedule.length > 0 && (
                  <div className="space-y-1">
                    {offering.schedule.map((session, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="capitalize">{session.day}</span>
                        <Clock className="h-4 w-4 text-gray-400 ml-2" />
                        <span>{session.startTime}{session.endTime ? ` - ${session.endTime}` : ''}</span>
                        <MapPin className="h-4 w-4 text-gray-400 ml-2" />
                        <span>{session.location}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Capacity */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">
                      {offering.maxSeats} seats available
                    </span>
                  </div>
                </div>

                {/* Action Button */}
                <Link to={`/dashboard/courses/enroll?offering=${offering.id}`} className="block mt-4">
                  <Button variant="primary" className="w-full" size="sm">
                    View Details
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

          {/* Results Count */}
          <div className="text-center text-sm text-gray-600">
            Showing {filteredOfferings.length} of {offerings.length} courses
          </div>
        </>
      )}
    </div>
  );
}

