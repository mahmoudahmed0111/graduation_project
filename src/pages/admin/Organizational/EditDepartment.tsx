import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Save } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToastStore } from '@/store/toastStore';
import { logger } from '@/lib/logger';
import { api, getApiErrorMessage } from '@/lib/api';
import { OrganizationalEditBreadcrumb } from '@/components/admin';
import { useInvalidateDepartments } from '@/hooks/queries/useDepartments';

const FORM_ID = 'edit-department-form';

export function EditDepartment() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const invalidateDepartments = useInvalidateDepartments();
  const { success, error: showError } = useToastStore();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [collegeLabel, setCollegeLabel] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    headId: '',
  });

  useEffect(() => {
    const fetchDepartment = async () => {
      if (!id) return;
      try {
        setFetching(true);
        const raw = await api.getDepartmentResolvingArchived(id);
        const rawCollege = raw.college_id;
        let collegeName = '';
        let collegeCode = '';
        if (typeof rawCollege === 'string' && rawCollege.trim()) {
          collegeName = rawCollege.trim();
          collegeCode = '';
        } else if (rawCollege && typeof rawCollege === 'object') {
          const c = rawCollege as Record<string, unknown>;
          collegeName = String(c.name ?? '');
          collegeCode = String(c.code ?? '');
        }
        setCollegeLabel(collegeCode ? `${collegeName} (${collegeCode})` : collegeName || '—');
        const rawHead = raw.head_id;
        let headId = '';
        if (rawHead != null && typeof rawHead === 'object' && !Array.isArray(rawHead)) {
          headId = String((rawHead as Record<string, unknown>)._id ?? (rawHead as Record<string, unknown>).id ?? '');
        } else if (typeof rawHead === 'string' && rawHead.trim()) {
          headId = rawHead.trim();
        }
        setFormData({
          name: String(raw.name ?? ''),
          code: String(raw.code ?? '').toUpperCase(),
          description: typeof raw.description === 'string' ? raw.description : '',
          headId,
        });
      } catch (error) {
        logger.error('Failed to fetch department', { context: 'EditDepartment', error });
        showError(getApiErrorMessage(error, t('admin.editDepartment.loadFail')));
      } finally {
        setFetching(false);
      }
    };
    void fetchDepartment();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      setLoading(true);
      await api.updateDepartment(id, {
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        ...(formData.description.trim() && { description: formData.description.trim() }),
        head_id: formData.headId.trim() || null,
      });
      success(t('admin.editDepartment.updated'));
      invalidateDepartments();
      navigate('/dashboard/organizational/departments');
    } catch (error) {
      logger.error('Failed to update department', { context: 'EditDepartment', error });
      showError(getApiErrorMessage(error, t('admin.editDepartment.updateFail')));
    } finally {
      setLoading(false);
    }
  };

  if (fetching || !id) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-primary-500 dark:border-accent" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">{t('admin.editDepartment.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <OrganizationalEditBreadcrumb
        segments={[
          { label: t('admin.editDepartment.section') },
          { label: t('admin.editDepartment.departments'), href: '/dashboard/organizational/departments' },
          { label: formData.name.trim() || t('admin.editDepartment.departmentFallback') },
          { label: t('admin.editDepartment.edit') },
        ]}
      />

      <Card>
        <CardContent className="py-4">
          <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
            {t('admin.editDepartment.collegeImmutable')}
          </p>
          <form id={FORM_ID} onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('admin.editDepartment.college')}</label>
              <Input value={collegeLabel} readOnly className="bg-gray-50 text-gray-700 dark:bg-slate-800/50 dark:text-gray-300" />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="md:col-span-1">
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('admin.editDepartment.departmentName')} <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t('admin.editDepartment.namePlaceholder')}
                  required
                />
              </div>
              <div className="md:col-span-1">
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('admin.editDepartment.departmentCode')} <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder={t('admin.editDepartment.codePlaceholder')}
                  required
                  maxLength={10}
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('admin.editDepartment.description')}</label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={t('admin.editDepartment.descriptionPlaceholder')}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="md:col-span-1">
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('admin.editDepartment.headUserId')} <span className="font-normal text-gray-400">{t('admin.editDepartment.optional')}</span>
                </label>
                <Input
                  value={formData.headId}
                  onChange={(e) => setFormData({ ...formData, headId: e.target.value })}
                  placeholder={t('admin.editDepartment.headPlaceholder')}
                />
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="flex flex-wrap justify-end gap-2">
        <Link to="/dashboard/organizational/departments">
          <Button type="button" variant="secondary" className="rounded-xl">
            {t('admin.editDepartment.cancel')}
          </Button>
        </Link>
        <Button
          type="submit"
          form={FORM_ID}
          isLoading={loading}
          className="inline-flex items-center gap-2 rounded-xl"
        >
          <Save className="h-4 w-4" />
          {t('admin.editDepartment.save')}
        </Button>
      </div>
    </div>
  );
}
