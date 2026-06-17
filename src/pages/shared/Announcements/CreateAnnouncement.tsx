import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Megaphone, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Select2 } from '@/components/ui/Select2';
import { MultiSelect } from '@/components/ui/MultiSelect';
import { useAuthStore } from '@/store/authStore';
import { useToastStore } from '@/store/toastStore';
import { getApiErrorMessage } from '@/lib/http/client';
import { useColleges } from '@/hooks/queries/useColleges';
import { useDepartments } from '@/hooks/queries/useDepartments';
import { useMyTeachingOfferings } from '@/hooks/queries/useMyOfferings';
import { useCreateAnnouncement } from '@/hooks/queries/usePhase6Announcements';
import type { ScopeLevel } from '@/types/phase6';

export function CreateAnnouncement() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { success, error: showError } = useToastStore();
  const role = user?.role ?? '';
  const isUA = role === 'universityAdmin';
  const ownCollege = (user as { collegeId?: string } | undefined)?.collegeId;

  // Scope levels available per role.
  const levelOptions = useMemo(() => {
    const all: { value: ScopeLevel; key: string }[] = [
      { value: 'Global', key: 'Global' },
      { value: 'College', key: 'College' },
      { value: 'Department', key: 'Department' },
      { value: 'Course', key: 'Course' },
    ];
    let allowed: ScopeLevel[];
    if (isUA) allowed = ['Global', 'College', 'Department', 'Course'];
    else if (role === 'collegeAdmin') allowed = ['College', 'Department', 'Course'];
    else allowed = ['Course']; // doctor / ta
    return all.filter((o) => allowed.includes(o.value)).map((o) => ({ value: o.value, label: t(`phase6.scope.${o.key}`) }));
  }, [isUA, role, t]);

  const [level, setLevel] = useState<ScopeLevel>(levelOptions[0]?.value ?? 'Course');
  const [collegeId, setCollegeId] = useState(isUA ? '' : ownCollege ?? '');
  const [deptTargets, setDeptTargets] = useState<string[]>([]);
  const [courseTargets, setCourseTargets] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [expiresAt, setExpiresAt] = useState('');

  // Option sources
  const { data: collegesData } = useColleges({ limit: 100, isArchived: 'false' }, { enabled: isUA });
  const collegeOptions = useMemo(
    () => (collegesData?.items ?? []).map((c) => {
      const r = c as Record<string, unknown>;
      return { value: String(r._id ?? r.id ?? ''), label: String(r.name ?? '') };
    }),
    [collegesData?.items]
  );

  const deptCollege = isUA ? collegeId || undefined : ownCollege;
  const { data: departmentsData } = useDepartments(
    { college_id: deptCollege, limit: 200, isArchived: 'false' },
    { enabled: Boolean(deptCollege) }
  );
  const departmentOptions = useMemo(
    () => (departmentsData?.items ?? []).map((d) => {
      const r = d as Record<string, unknown>;
      return { value: String(r._id ?? r.id ?? ''), label: String(r.name ?? '') };
    }),
    [departmentsData?.items]
  );

  const { offerings } = useMyTeachingOfferings();
  const courseOptions = useMemo(
    () => offerings.map((o) => ({ value: o.id, label: `${o.courseCode ?? ''} — ${o.courseTitle ?? o.id}`.trim() })),
    [offerings]
  );

  const createMutation = useCreateAnnouncement();

  const resolveTarget = (): string[] => {
    if (level === 'Global') return [];
    if (level === 'College') return collegeId ? [collegeId] : [];
    if (level === 'Department') return deptTargets;
    return courseTargets; // Course
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return showError(t('phase6.create.titleContentRequired'));
    const target = resolveTarget();
    if (level !== 'Global' && target.length === 0) return showError(t('phase6.create.targetRequired'));
    if (expiresAt) {
      const dt = new Date(expiresAt);
      if (Number.isNaN(dt.getTime()) || dt.getTime() <= Date.now()) return showError(t('phase6.create.expiryFuture'));
    }
    try {
      await createMutation.mutateAsync({
        title: title.trim(),
        content: content.trim(),
        scope: { level, target },
        ...(expiresAt ? { expiresAt: new Date(expiresAt).toISOString() } : {}),
      });
      success(t('phase6.create.published'));
      navigate('/dashboard/announcements');
    } catch (err) {
      showError(getApiErrorMessage(err, t('phase6.create.publishFailed')));
    }
  };

  const cancelTo = '/dashboard/announcements';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to={cancelTo}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-1 h-4 w-4 rtl:rotate-180" /> {t('phase6.create.back')}
          </Button>
        </Link>
        <h1 className="font-display text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          {t('phase6.create.title')}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <Megaphone className="h-5 w-5 shrink-0 text-primary-600 dark:text-accent-300" />
            {t('phase6.create.details')}
          </CardTitle>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">{t('phase6.create.immutableHint')}</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-slate-300">{t('phase6.create.scope')}</label>
                <Select2 value={level} onChange={(v) => setLevel(v as ScopeLevel)} options={levelOptions} searchable={false} />
              </div>

              {/* Targets per scope level */}
              {level === 'College' && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-slate-300">{t('phase6.scope.College')}</label>
                  {isUA ? (
                    <Select2 value={collegeId} onChange={setCollegeId} options={collegeOptions} placeholder={t('phase6.create.selectCollege')} />
                  ) : (
                    <div className="flex h-11 items-center rounded-xl border border-gray-200 bg-gray-50 px-3.5 text-sm text-gray-600 dark:border-dark-border dark:bg-dark-surface-2 dark:text-slate-300">
                      {t('phase6.create.ownCollege')}
                    </div>
                  )}
                </div>
              )}

              {level === 'Department' && isUA && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-slate-300">{t('phase6.create.collegeFilter')}</label>
                  <Select2 value={collegeId} onChange={(v) => { setCollegeId(v); setDeptTargets([]); }} options={collegeOptions} placeholder={t('phase6.create.selectCollege')} />
                </div>
              )}
            </div>

            {level === 'Department' && (
              <MultiSelect
                label={t('phase6.scope.Department')}
                value={deptTargets}
                onChange={setDeptTargets}
                options={departmentOptions}
                placeholder={t('phase6.create.selectDepartments')}
              />
            )}

            {level === 'Course' && (
              <MultiSelect
                label={t('phase6.scope.Course')}
                value={courseTargets}
                onChange={setCourseTargets}
                options={courseOptions}
                placeholder={t('phase6.create.selectCourses')}
              />
            )}

            <Input label={t('phase6.create.titleField')} value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} required />

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-slate-300">{t('phase6.create.content')}</label>
              <textarea className="field" rows={6} maxLength={5000} value={content} onChange={(e) => setContent(e.target.value)} placeholder={t('phase6.create.contentPlaceholder')} required />
            </div>

            <div className="sm:max-w-xs">
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-slate-300">
                {t('phase6.create.expiresAt')} <span className="font-normal text-gray-400">{t('phase6.create.optional')}</span>
              </label>
              <input type="datetime-local" className="field" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
            </div>

            <div className="flex items-center justify-end gap-2.5 border-t border-gray-100 pt-5 dark:border-dark-border">
              <Link to={cancelTo}>
                <Button type="button" variant="outline">{t('phase6.create.cancel')}</Button>
              </Link>
              <Button type="submit" isLoading={createMutation.isPending}>
                <Send className="mr-2 h-4 w-4" /> {t('phase6.create.publish')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
