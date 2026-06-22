import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { ICourseOffering } from '@/types';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FilterBar } from '@/components/ui/FilterBar';
import { Select2 } from '@/components/ui/Select2';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { AdminPageShell } from '@/components/admin/AdminPageShell';
import { BookOpen, Users, Clock, MapPin, Calendar, User } from 'lucide-react';
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
        const offeringsArray = Array.isArray(data) ? data : [];
        setOfferings(offeringsArray);
      } catch (error) {
        logger.error('Failed to fetch course offerings', { context: 'AllCourses', error });
        showError(t('shared.allCourses.failedLoad'));
        setOfferings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOfferings();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- showError stable, fetch once

  const departments = Array.isArray(offerings)
    ? Array.from(new Set(offerings.map((o) => o?.course?.department?.name).filter(Boolean)))
    : [];

  const departmentOptions = [
    { value: '', label: t('shared.allCourses.allDepartments') },
    ...departments.map((dept) => ({ value: dept as string, label: dept as string })),
  ];

  const filteredOfferings = Array.isArray(offerings)
    ? offerings.filter((offering) => {
        if (!offering?.course) return false;
        const matchesSearch =
          offering.course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          offering.course.code?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDepartment =
          !selectedDepartment || offering.course.department?.name === selectedDepartment;
        return matchesSearch && matchesDepartment;
      })
    : [];

  return (
    <AdminPageShell
      titleStack={{ section: t('nav.courses'), page: t('nav.allCourses') }}
      subtitle={t('shared.allCourses.subtitle')}
      actions={
        <Link to="/dashboard/courses/enroll">
          <Button className="inline-flex items-center gap-2 rounded-xl">
            <BookOpen className="h-4 w-4" />
            {t('shared.allCourses.enrollInCourse')}
          </Button>
        </Link>
      }
    >
      <Card bare>
        <CardContent className="space-y-6">
          <FilterBar
            search={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder={t('shared.allCourses.searchPlaceholder')}
            activeFilterCount={selectedDepartment ? 1 : 0}
            onClearFilters={() => setSelectedDepartment('')}
            filters={
              <Select2
                label={t('shared.allCourses.allDepartments')}
                value={selectedDepartment}
                onChange={setSelectedDepartment}
                options={departmentOptions}
                placeholder={t('shared.allCourses.allDepartments')}
              />
            }
          />

          {loading ? (
            <div className="flex min-h-[280px] items-center justify-center">
              <Spinner size="lg" label={t('common.loading')} />
            </div>
          ) : filteredOfferings.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title={t('shared.allCourses.noCourses')}
              description={t('shared.allCourses.subtitle')}
            />
          ) : (
            <>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {filteredOfferings.map((offering) => (
                  <div
                    key={offering.id}
                    className="flex flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-card transition-shadow hover:shadow-card-hover dark:border-dark-border dark:bg-dark-surface"
                  >
                    <div className="mb-3 flex items-center gap-2">
                      <span className="rounded-lg bg-primary-50 px-2 py-1 text-sm font-semibold text-primary-600 dark:bg-primary-900/30 dark:text-primary-300">
                        {offering.course.code}
                      </span>
                      <span className="rounded-lg bg-gray-100 px-2 py-1 text-xs text-gray-500 dark:bg-dark-surface-2 dark:text-slate-400">
                        {t('shared.allCourses.credits', { count: offering.course.creditHours })}
                      </span>
                    </div>
                    <h3 className="mb-1 text-lg font-bold text-gray-900 dark:text-white">
                      {offering.course.title}
                    </h3>
                    <p className="mb-4 text-sm text-gray-600 dark:text-slate-400">
                      {offering.course.department.name}
                    </p>

                    <div className="space-y-3 text-sm">
                      {offering.doctors.length > 0 && (
                        <div className="flex items-start gap-2">
                          <User className="mt-0.5 h-4 w-4 text-gray-400" />
                          <div className="flex-1">
                            <p className="text-xs text-gray-500 dark:text-slate-500">
                              {t('shared.allCourses.instructors')}
                            </p>
                            <p className="text-gray-700 dark:text-slate-300">
                              {offering.doctors.map((d) => d.name).join(', ')}
                            </p>
                          </div>
                        </div>
                      )}

                      {offering.schedule.length > 0 && (
                        <div className="space-y-1">
                          {offering.schedule.map((session, idx) => (
                            <div
                              key={idx}
                              className="flex flex-wrap items-center gap-x-2 gap-y-1 text-gray-600 dark:text-slate-400"
                            >
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span className="capitalize">{session.day}</span>
                              <Clock className="ms-1 h-4 w-4 text-gray-400" />
                              <span>
                                {session.startTime}
                                {session.endTime ? ` - ${session.endTime}` : ''}
                              </span>
                              <MapPin className="ms-1 h-4 w-4 text-gray-400" />
                              <span>{session.location}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="mt-4 flex items-center gap-2 border-t border-gray-100 pt-3 text-sm dark:border-dark-border">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600 dark:text-slate-400">
                        {t('shared.allCourses.seatsAvailable', { count: offering.maxSeats })}
                      </span>
                    </div>

                    <Link to={`/dashboard/courses/enroll?offering=${offering.id}`} className="mt-4 block">
                      <Button variant="primary" size="sm" className="w-full">
                        {t('shared.allCourses.viewDetails')}
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>

              <p className="text-center text-sm text-gray-500 dark:text-slate-400">
                {t('shared.allCourses.showingOf', {
                  shown: filteredOfferings.length,
                  total: offerings.length,
                })}
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </AdminPageShell>
  );
}
