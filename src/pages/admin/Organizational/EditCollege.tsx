import { useState, useEffect } from 'react';
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
import { formatDate } from '@/utils/formatters';

const FORM_ID = 'edit-college-form';

export function EditCollege() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success, error: showError } = useToastStore();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    slug: '',
    description: '',
    deanId: '',
    establishedYear: '' as string,
  });
  const [recordMeta, setRecordMeta] = useState<{
    createdAt?: string;
    isArchived: boolean;
    archivedAt: string | null;
  }>({ isArchived: false, archivedAt: null });

  useEffect(() => {
    const fetchCollege = async () => {
      if (!id) return;
      try {
        setFetching(true);
        const raw = await api.getCollegeResolvingArchived(id);
        const rawDean = raw.dean_id;
        let deanId = '';
        if (rawDean != null && typeof rawDean === 'object' && !Array.isArray(rawDean)) {
          const d = rawDean as Record<string, unknown>;
          deanId = String(d._id ?? d.id ?? '');
        } else if (typeof rawDean === 'string' && rawDean.trim()) {
          deanId = rawDean.trim();
        }
        const year =
          typeof raw.establishedYear === 'number'
            ? String(raw.establishedYear)
            : '';
        setFormData({
          name: String(raw.name ?? ''),
          code: String(raw.code ?? '').toUpperCase(),
          slug: typeof raw.slug === 'string' ? raw.slug : '',
          description: typeof raw.description === 'string' ? raw.description : '',
          deanId,
          establishedYear: year,
        });
        setRecordMeta({
          createdAt: typeof raw.createdAt === 'string' ? raw.createdAt : undefined,
          isArchived: Boolean(raw.isArchived),
          archivedAt:
            raw.archivedAt === null || raw.archivedAt === undefined ? null : String(raw.archivedAt),
        });
      } catch (error) {
        logger.error('Failed to fetch college', { context: 'EditCollege', error });
        showError(getApiErrorMessage(error, 'Failed to load college'));
      } finally {
        setFetching(false);
      }
    };
    void fetchCollege();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      setLoading(true);
      const year = formData.establishedYear.trim() ? parseInt(formData.establishedYear, 10) : undefined;
      await api.updateCollege(id, {
        name: formData.name.trim(),
        ...(formData.description.trim() && { description: formData.description.trim() }),
        dean_id: formData.deanId.trim() || null,
        ...(year != null && !Number.isNaN(year) ? { establishedYear: year } : {}),
      });
      success('College updated successfully');
      navigate(`/dashboard/organizational/colleges/${id}`);
    } catch (error) {
      logger.error('Failed to update college', { context: 'EditCollege', error });
      showError(getApiErrorMessage(error, 'Failed to update college'));
    } finally {
      setLoading(false);
    }
  };

  if (fetching || !id) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-primary-500 dark:border-accent" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading college…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <OrganizationalEditBreadcrumb
        segments={[
          { label: 'University Structure' },
          { label: 'Colleges', href: '/dashboard/organizational/colleges' },
          {
            label: formData.name.trim() || 'College',
            href: `/dashboard/organizational/colleges/${id}`,
          },
          { label: 'Edit' },
        ]}
      />

      <Card>
        <CardContent className="py-4">
          <div className="mb-4 flex flex-wrap gap-3 rounded-xl border border-gray-200 bg-gray-50/80 px-3 py-2 text-xs dark:border-dark-border dark:bg-slate-900/40">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Created</span>{' '}
              <span className="font-medium text-gray-800 dark:text-gray-200">
                {recordMeta.createdAt ? formatDate(recordMeta.createdAt, 'full') : '—'}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Status</span>{' '}
              {recordMeta.isArchived ? (
                <span className="font-medium text-gray-800 dark:text-gray-200">Archived</span>
              ) : (
                <span className="font-medium text-emerald-800 dark:text-emerald-300">Active</span>
              )}
            </div>
            {recordMeta.isArchived && recordMeta.archivedAt ? (
              <div>
                <span className="text-gray-500 dark:text-gray-400">Archived at</span>{' '}
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  {formatDate(recordMeta.archivedAt, 'full')}
                </span>
              </div>
            ) : null}
          </div>
          <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
            College code cannot be changed after creation.
          </p>
          <form id={FORM_ID} onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="md:col-span-1">
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  College name <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Faculty of Engineering"
                  required
                />
              </div>
              <div className="md:col-span-1">
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">College code</label>
                <Input
                  value={formData.code}
                  readOnly
                  className="bg-gray-50 text-gray-600 dark:bg-slate-800/50 dark:text-gray-300"
                  title="Code is set at creation and cannot be changed"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="md:col-span-1">
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Slug <span className="font-normal text-gray-400">(read-only)</span>
                </label>
                <Input
                  value={formData.slug}
                  readOnly
                  className="bg-gray-50 text-gray-600 dark:bg-slate-800/50 dark:text-gray-300"
                  title="Read-only: supplied by the server"
                />
              </div>
              <div className="md:col-span-1">
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Established year</label>
                <Input
                  type="number"
                  value={formData.establishedYear}
                  onChange={(e) => setFormData({ ...formData, establishedYear: e.target.value })}
                  placeholder="e.g. 1985"
                  min={1800}
                  max={2100}
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the college"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="md:col-span-1">
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Dean user ID <span className="font-normal text-gray-400">(optional)</span>
                </label>
                <Input
                  value={formData.deanId}
                  onChange={(e) => setFormData({ ...formData, deanId: e.target.value })}
                  placeholder="MongoDB ObjectId — field dean_id"
                />
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="flex flex-wrap justify-end gap-2">
        <Link to={`/dashboard/organizational/colleges/${id}`}>
          <Button type="button" variant="secondary" className="rounded-xl">
            Cancel
          </Button>
        </Link>
        <Button
          type="submit"
          form={FORM_ID}
          isLoading={loading}
          className="inline-flex items-center gap-2 rounded-xl"
        >
          <Save className="h-4 w-4" />
          Save
        </Button>
      </div>
    </div>
  );
}
