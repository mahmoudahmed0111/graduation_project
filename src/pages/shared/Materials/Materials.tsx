import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueries } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Download, ExternalLink, FileText, Search } from 'lucide-react';
import { AdminPageShell } from '@/components/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select2 } from '@/components/ui/Select2';
import { useToastStore } from '@/store/toastStore';
import { useAuthStore } from '@/store/authStore';
import { categoryColors, categoryIcons } from '@/constants/ui';
import { listMaterials } from '@/services/materials.service';
import { materialsListQueryKey } from '@/hooks/queries/usePhase4Materials';
import { useMyTeachingOfferings } from '@/hooks/queries/useMyOfferings';
import { api } from '@/lib/api';
import type { IEnrollment, IPhase4Material } from '@/types';

interface OfferingMeta {
  id: string;
  code: string;
  title: string;
}

export function Materials() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { error: showError } = useToastStore();

  const [enrollments, setEnrollments] = useState<IEnrollment[]>([]);
  const [enrollmentsLoading, setEnrollmentsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Source the user's offerings: students from enrollments, staff from teaching offerings.
  const isStaff =
    user?.role === 'doctor' ||
    user?.role === 'teacher' ||
    user?.role === 'ta' ||
    user?.role === 'collegeAdmin' ||
    user?.role === 'universityAdmin' ||
    user?.role === 'admin' ||
    user?.role === 'superAdmin';
  // The Phase 4 Materials API allows reads for DR/TA/ST/CA. UA is not in that
  // list, so we skip the per-offering fetch loop and just show offering cards
  // that deep-link to each offering's materials page.
  const isUniversityAdmin =
    user?.role === 'universityAdmin' || user?.role === 'admin' || user?.role === 'superAdmin';
  const teaching = useMyTeachingOfferings();

  useEffect(() => {
    if (isStaff) {
      setEnrollmentsLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        setEnrollmentsLoading(true);
        const rows = await api.getMyCourses({ semester: 'current' });
        if (!cancelled) setEnrollments(Array.isArray(rows) ? rows : []);
      } catch (err) {
        if (!cancelled) showError(t('shared.materials.failedLoadCourses'));
      } finally {
        if (!cancelled) setEnrollmentsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isStaff, showError]);

  const offerings = useMemo<OfferingMeta[]>(() => {
    if (isStaff) {
      return teaching.offerings.map((o) => ({
        id: o.id,
        code: o.courseCode ?? '',
        title: o.courseTitle ?? '',
      }));
    }
    return enrollments
      .map((e) => {
        const co = e.courseOffering;
        if (!co?.id) return null;
        return { id: co.id, code: co.course?.code ?? '', title: co.course?.title ?? '' };
      })
      .filter((x): x is OfferingMeta => Boolean(x));
  }, [isStaff, teaching.offerings, enrollments]);

  // Fetch materials for each offering in parallel.
  // UA is not authorised on `GET /course-offerings/:id/materials` so we skip
  // the loop entirely for them and let the aggregated view fall through to
  // a "browse offerings" UI.
  const materialQueries = useQueries({
    queries: offerings.map((o) => ({
      queryKey: materialsListQueryKey(o.id),
      queryFn: () => listMaterials(o.id),
      enabled: Boolean(o.id) && !isUniversityAdmin,
      retry: false,
    })),
  });

  const allLoading =
    enrollmentsLoading || teaching.isLoading || (!isUniversityAdmin && materialQueries.some((q) => q.isLoading));

  const offeringsForBrowse = useMemo(() => {
    if (selectedCourse === 'all') return offerings;
    return offerings.filter((o) => o.id === selectedCourse);
  }, [offerings, selectedCourse]);

  const grouped = useMemo(() => {
    const out: Record<string, { offering: OfferingMeta; materials: IPhase4Material[] }> = {};
    materialQueries.forEach((q, idx) => {
      const offering = offerings[idx];
      if (!offering) return;
      const items = q.data?.items ?? [];
      const filtered = items.filter((m) => {
        const matchesCategory = selectedCategory === 'all' || m.category === selectedCategory;
        const q1 = searchTerm.trim().toLowerCase();
        const matchesSearch = !q1 || m.title.toLowerCase().includes(q1) || (m.description ?? '').toLowerCase().includes(q1);
        return matchesCategory && matchesSearch;
      });
      if (selectedCourse !== 'all' && offering.id !== selectedCourse) return;
      if (filtered.length === 0 && selectedCourse !== 'all' && selectedCourse !== offering.id) return;
      if (filtered.length === 0) return;
      out[offering.id] = { offering, materials: filtered };
    });
    return out;
  }, [materialQueries, offerings, searchTerm, selectedCategory, selectedCourse]);

  const totalCount = useMemo(
    () => Object.values(grouped).reduce((acc, g) => acc + g.materials.length, 0),
    [grouped]
  );

  if (allLoading) {
    return (
      <AdminPageShell titleStack={{ section: t('shared.materials.section'), page: t('shared.materials.page') }} subtitle={t('shared.materials.loadingSubtitle')}>
        <div className="flex min-h-[320px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-accent" />
            <p className="mt-4 text-gray-600 dark:text-gray-400">{t('shared.materials.loadingMaterials')}</p>
          </div>
        </div>
      </AdminPageShell>
    );
  }

  return (
    <AdminPageShell
      titleStack={{ section: t('shared.materials.section'), page: t('shared.materials.page') }}
      subtitle={t('shared.materials.subtitle')}
    >
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder={t('shared.materials.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="w-full sm:w-72">
              <Select2
                value={selectedCourse}
                onChange={setSelectedCourse}
                options={[
                  { value: 'all', label: t('shared.materials.allCourses') },
                  ...offerings.map((o) => ({ value: o.id, label: `${o.code} — ${o.title}` })),
                ]}
                placeholder={t('shared.materials.allCourses')}
              />
            </div>
            <div className="w-full sm:w-56">
              <Select2
                value={selectedCategory}
                onChange={setSelectedCategory}
                options={[
                  { value: 'all', label: t('shared.materials.allCategories') },
                  { value: 'Lectures', label: t('shared.materials.catLectures') },
                  { value: 'Sheets', label: t('shared.materials.catSheets') },
                  { value: 'Readings', label: t('shared.materials.catReadings') },
                  { value: 'Links', label: t('shared.materials.catLinks') },
                ]}
                placeholder={t('shared.materials.allCategories')}
                searchable={false}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {isUniversityAdmin ? (
        offeringsForBrowse.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">{t('shared.materials.noOfferings')}</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>{t('shared.materials.browseByCourse')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-4">
                {t('shared.materials.uaHint')}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {offeringsForBrowse.map((o) => (
                  <Link
                    key={o.id}
                    to={`/dashboard/course-offerings/${o.id}/materials`}
                    className="border border-gray-200 rounded-lg p-4 hover:border-primary-400 hover:shadow-md transition-all flex items-center justify-between gap-2"
                  >
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">{o.code}</div>
                      <div className="text-sm text-gray-600 line-clamp-2">{o.title}</div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-primary-600 flex-shrink-0" />
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )
      ) : totalCount === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">{t('shared.materials.noMaterials')}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.values(grouped).map(({ offering, materials }) => (
            <Card key={offering.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary-600" />
                  {offering.code} — {offering.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {materials.map((m) => {
                    const Icon = categoryIcons[m.category];
                    return (
                      <Link
                        key={m._id}
                        to={`/dashboard/course-offerings/${offering.id}/materials/${m._id}`}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow block"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className={`p-2 rounded-lg ${categoryColors[m.category]}`}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <span className={`text-xs font-medium px-2 py-1 rounded ${categoryColors[m.category]}`}>
                              {m.category}
                            </span>
                          </div>
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">{m.title}</h3>
                        {m.description && <p className="text-sm text-gray-600 mb-3 line-clamp-2">{m.description}</p>}
                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            {m.isExternalLink ? <ExternalLink className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                            <span>{m.isExternalLink ? t('shared.materials.link') : (m.fileType ?? t('shared.materials.fileFallback')).toUpperCase()}</span>
                          </div>
                          <span className="flex items-center gap-1 text-sm text-primary-600 font-medium">
                            {m.isExternalLink ? <ExternalLink className="h-4 w-4" /> : <Download className="h-4 w-4" />}
                            {m.isExternalLink ? t('shared.materials.open') : t('shared.materials.download')}
                          </span>
                        </div>
                        <div className="mt-2 text-xs text-gray-400">
                          {new Date(m.createdAt).toLocaleDateString()}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isUniversityAdmin && totalCount > 0 && (
        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          {t('shared.materials.showingCount', { count: totalCount })}
        </div>
      )}
    </AdminPageShell>
  );
}
