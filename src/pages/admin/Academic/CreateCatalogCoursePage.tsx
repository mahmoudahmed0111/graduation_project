import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Select2 } from '@/components/ui/Select2';
import { ArrowLeft, Library, Save } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useToastStore } from '@/store/toastStore';
import { useColleges } from '@/hooks/queries/useColleges';
import { useDepartments } from '@/hooks/queries/useDepartments';
import { useCourseCatalogs, useCreateCourseCatalog } from '@/hooks/queries/usePhase3CourseCatalog';
import { getApiErrorMessage } from '@/lib/http/client';
import { p3Id } from '@/lib/phase3Ui';

export function CreateCatalogCoursePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isUA = user?.role === 'universityAdmin';
  const { success, error: showError } = useToastStore();
  const createMut = useCreateCourseCatalog();

  const [collegeId, setCollegeId] = useState('');
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [creditHours, setCreditHours] = useState('3');
  const [department_id, setDepartment_id] = useState('');
  const [selectedPrereq, setSelectedPrereq] = useState<string[]>([]);

  const { data: collegesData } = useColleges({ limit: 100, isArchived: 'false' }, { enabled: isUA });
  const collegeOptions = useMemo(() => {
    const items = collegesData?.items ?? [];
    return [
      { value: '', label: t('admin.createCatalogCoursePage.selectCollege') },
      ...items.map((c) => {
        const r = c as Record<string, unknown>;
        return { value: String(r._id ?? r.id ?? ''), label: String(r.name ?? '') };
      }),
    ];
  }, [collegesData?.items]);

  const deptCollege = isUA ? collegeId || undefined : user?.collegeId;
  const { data: departmentsData } = useDepartments(
    { college_id: deptCollege, limit: 100, isArchived: 'false' },
    { enabled: isUA ? true : Boolean(user?.collegeId) }
  );
  const departmentOptions = useMemo(() => {
    const items = departmentsData?.items ?? [];
    return [
      { value: '', label: t('admin.createCatalogCoursePage.selectDepartment') },
      ...items.map((d) => {
        const r = d as Record<string, unknown>;
        return { value: String(r._id ?? r.id ?? ''), label: String(r.name ?? '') };
      }),
    ];
  }, [departmentsData?.items]);

  const { data: prereqPicker } = useCourseCatalogs({
    limit: 100,
    isArchived: 'false',
    college_id: isUA ? collegeId || undefined : undefined,
    department_id: department_id || undefined,
  });

  const prerequisiteOptions = useMemo(() => {
    return (prereqPicker?.items ?? []).map((c) => {
      const r = c as Record<string, unknown>;
      return { value: p3Id(r), label: `${String(r.code ?? '')} — ${String(r.title ?? '')}` };
    });
  }, [prereqPicker?.items]);

  useEffect(() => {
    if (user?.role === 'collegeAdmin' && user.collegeId) {
      setCollegeId(user.collegeId);
    }
  }, [user?.role, user?.collegeId]);

  const togglePrereq = (id: string) => {
    setSelectedPrereq((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ch = Number(creditHours);
    if (!title.trim() || !code.trim() || !Number.isFinite(ch) || ch < 1) {
      showError(t('admin.createCatalogCoursePage.titleCodeRequired'));
      return;
    }
    if (!department_id) {
      showError(t('admin.createCatalogCoursePage.selectDepartmentError'));
      return;
    }
    try {
      await createMut.mutateAsync({
        title: title.trim(),
        code: code.trim(),
        description: description.trim() || undefined,
        creditHours: ch,
        department_id,
        prerequisites_ids: selectedPrereq.length ? selectedPrereq : undefined,
      });
      success(t('admin.createCatalogCoursePage.courseCreated'));
      navigate('/dashboard/academic/catalog');
    } catch (err) {
      showError(getApiErrorMessage(err));
    }
  };

  return (
    <div className="w-full max-w-full space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/dashboard/academic/catalog">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-1 h-4 w-4" />
            {t('admin.createCatalogCoursePage.back')}
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('admin.createCatalogCoursePage.title')}</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Library className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            {t('admin.createCatalogCoursePage.details')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {isUA && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('admin.createCatalogCoursePage.collegeRequired')}</label>
                  <Select2
                    options={collegeOptions}
                    value={collegeId}
                    onChange={(v) => {
                      setCollegeId(v);
                      setDepartment_id('');
                      setSelectedPrereq([]);
                    }}
                  />
                </div>
              )}
              <div className={isUA ? undefined : 'md:col-span-2'}>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('admin.createCatalogCoursePage.departmentRequired')}</label>
                <Select2
                  options={departmentOptions}
                  value={department_id}
                  onChange={(v) => {
                    setDepartment_id(v);
                    setSelectedPrereq([]);
                  }}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('admin.createCatalogCoursePage.titleRequired')}</label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('admin.createCatalogCoursePage.codeRequired')}</label>
                <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder={t('admin.createCatalogCoursePage.codePlaceholder')} required />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('admin.createCatalogCoursePage.description')}</label>
                <Input value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('admin.createCatalogCoursePage.creditHoursRequired')}</label>
                <Input type="number" min={1} value={creditHours} onChange={(e) => setCreditHours(e.target.value)} required />
              </div>
              <div className="md:col-span-2">
                <p className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">{t('admin.createCatalogCoursePage.prerequisitesOptional')}</p>
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                  {t('admin.createCatalogCoursePage.prerequisitesHelp')}
                </p>
                <div className="max-h-48 space-y-2 overflow-y-auto rounded-lg border border-gray-200 p-3 dark:border-dark-border">
                  {!department_id ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('admin.createCatalogCoursePage.selectDeptHint')}</p>
                  ) : prerequisiteOptions.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('admin.createCatalogCoursePage.noOtherCourses')}</p>
                  ) : (
                    prerequisiteOptions.map((o) => (
                      <label key={o.value} className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300"
                          checked={selectedPrereq.includes(o.value)}
                          onChange={() => togglePrereq(o.value)}
                        />
                        {o.label}
                      </label>
                    ))
                  )}
                </div>
              </div>
            </div>
            <Button type="submit" variant="primary" disabled={createMut.isPending} className="w-full sm:w-auto">
              <Save className="mr-2 h-4 w-4" />
              {createMut.isPending ? t('admin.createCatalogCoursePage.saving') : t('admin.createCatalogCoursePage.create')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
