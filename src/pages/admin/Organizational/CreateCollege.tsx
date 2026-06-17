import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select2 } from '@/components/ui/Select2';
import { Button } from '@/components/ui/Button';
import { useUsers } from '@/hooks/queries/useUsers';
import { 
  Building2, 
  ArrowLeft,
  Save
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToastStore } from '@/store/toastStore';
import { logger } from '@/lib/logger';
import { api, getApiErrorMessage } from '@/lib/api';

export function CreateCollege() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { success, error: showError } = useToastStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    deanId: '',
    establishedYear: '' as string,
  });

  // Eligible deans — active doctors in scope. The dropdown replaces the old
  // free-text "dean user ID" field so admins pick a real user, not type an id.
  const deansQuery = useUsers({ role: 'doctor', limit: 200 });
  const deanOptions = useMemo(() => {
    const items = (deansQuery.data?.items ?? []) as unknown as Array<Record<string, unknown>>;
    const opts = items
      .map((u) => {
        const id = typeof u._id === 'string' ? u._id : typeof u.id === 'string' ? u.id : '';
        const name = typeof u.name === 'string' ? u.name : '';
        const email = typeof u.email === 'string' ? u.email : '';
        return { value: id, label: `${name}${email ? ` · ${email}` : ''}`.trim() || id };
      })
      .filter((o) => o.value);
    return [{ value: '', label: '—' }, ...opts];
  }, [deansQuery.data]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const year = formData.establishedYear.trim() ? parseInt(formData.establishedYear, 10) : undefined;
      await api.createCollege({
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        ...(formData.description.trim() && { description: formData.description.trim() }),
        ...(formData.deanId.trim() && { dean_id: formData.deanId.trim() }),
        ...(year != null && !Number.isNaN(year) && { establishedYear: year }),
      });
      success(t('admin.createCollege.created'));
      navigate('/dashboard/organizational/colleges');
    } catch (error) {
      logger.error('Failed to create college', { context: 'CreateCollege', error });
      showError(getApiErrorMessage(error, t('admin.createCollege.createFail')));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/dashboard/organizational/colleges">
          <Button variant="secondary" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('admin.createCollege.back')}
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('admin.createCollege.title')}</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {t('admin.createCollege.collegeInformation')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('admin.createCollege.collegeName')} <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t('admin.createCollege.namePlaceholder')}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('admin.createCollege.collegeCode')} <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder={t('admin.createCollege.codePlaceholder')}
                required
                maxLength={10}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('admin.createCollege.description')}
              </label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={t('admin.createCollege.descriptionPlaceholder')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('admin.createCollege.establishedYear')}
              </label>
              <Input
                type="number"
                value={formData.establishedYear}
                onChange={(e) => setFormData({ ...formData, establishedYear: e.target.value })}
                placeholder={t('admin.createCollege.yearPlaceholder')}
                min={1800}
                max={2100}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                {t('admin.createCollege.deanUserId')} <span className="text-gray-400 font-normal">{t('admin.createCollege.optional')}</span>
              </label>
              <Select2
                value={formData.deanId}
                onChange={(v) => setFormData({ ...formData, deanId: v })}
                options={deanOptions}
                placeholder={deansQuery.isLoading ? t('common.loading') : t('admin.createCollege.deanPlaceholder')}
              />
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                {t('admin.createCollege.deanHint')}
              </p>
            </div>

            <div className="flex items-center gap-2 pt-4">
              <Button type="submit" isLoading={loading}>
                <Save className="h-4 w-4 mr-2" />
                {t('admin.createCollege.title')}
              </Button>
              <Link to="/dashboard/organizational/colleges">
                <Button type="button" variant="secondary">
                  {t('admin.createCollege.cancel')}
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
