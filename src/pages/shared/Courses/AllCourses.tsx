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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { AdminDataTableShell } from '@/components/admin/AdminDataTableShell';
import { AdminPageShell } from '@/components/admin/AdminPageShell';
import { BookOpen } from 'lucide-react';
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
              <AdminDataTableShell>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('shared.allCourses.colCode')}</TableHead>
                      <TableHead>{t('shared.allCourses.colCourse')}</TableHead>
                      <TableHead className="text-center">{t('shared.allCourses.colCredits')}</TableHead>
                      <TableHead>{t('shared.allCourses.colInstructors')}</TableHead>
                      <TableHead>{t('shared.allCourses.colSchedule')}</TableHead>
                      <TableHead className="text-center">{t('shared.allCourses.colSeats')}</TableHead>
                      <TableHead className="text-end">{t('shared.allCourses.colActions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOfferings.map((offering) => (
                      <TableRow key={offering.id}>
                        <TableCell>
                          <span className="rounded-lg bg-primary-50 px-2 py-1 text-sm font-semibold text-primary-600 dark:bg-primary-900/30 dark:text-primary-300">
                            {offering.course.code}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {offering.course.title}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-slate-400">
                            {offering.course.department.name}
                          </div>
                        </TableCell>
                        <TableCell className="text-center text-gray-700 dark:text-slate-300">
                          {offering.course.creditHours}
                        </TableCell>
                        <TableCell className="text-gray-700 dark:text-slate-300">
                          {offering.doctors.length > 0
                            ? offering.doctors.map((d) => d.name).join(', ')
                            : t('shared.allCourses.none')}
                        </TableCell>
                        <TableCell className="text-gray-600 dark:text-slate-400">
                          {offering.schedule.length > 0 ? (
                            <div className="space-y-0.5">
                              {offering.schedule.map((session, idx) => (
                                <div key={idx} className="whitespace-nowrap text-xs">
                                  <span className="capitalize">{session.day}</span>
                                  {' · '}
                                  <span>
                                    {session.startTime}
                                    {session.endTime ? ` - ${session.endTime}` : ''}
                                  </span>
                                  {session.location ? ` · ${session.location}` : ''}
                                </div>
                              ))}
                            </div>
                          ) : (
                            t('shared.allCourses.none')
                          )}
                        </TableCell>
                        <TableCell className="text-center text-gray-700 dark:text-slate-300">
                          {t('shared.allCourses.seatsCount', { count: offering.maxSeats })}
                        </TableCell>
                        <TableCell className="text-end">
                          <Link to={`/dashboard/courses/enroll?offering=${offering.id}`}>
                            <Button variant="ghost" size="sm" className="rounded-xl">
                              {t('shared.allCourses.viewDetails')}
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </AdminDataTableShell>

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
