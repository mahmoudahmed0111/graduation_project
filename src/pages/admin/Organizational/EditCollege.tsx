import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { 
  Building2, 
  ArrowLeft,
  Save
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToastStore } from '@/store/toastStore';
import { logger } from '@/lib/logger';
import { api, getApiErrorMessage } from '@/lib/api';

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

  useEffect(() => {
    const fetchCollege = async () => {
      if (!id) return;
      try {
        setFetching(true);
        const raw = await api.getCollege(id);
        const dean = raw.dean_id as Record<string, unknown> | undefined;
        const deanId = dean && typeof dean === 'object' ? String(dean._id ?? dean.id ?? '') : '';
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
      navigate('/dashboard/organizational/colleges');
    } catch (error) {
      logger.error('Failed to update college', { context: 'EditCollege', error });
      showError(getApiErrorMessage(error, 'Failed to update college'));
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading college...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/dashboard/organizational/colleges">
          <Button variant="secondary" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit College</h1>
          <p className="text-gray-600 mt-1">PATCH /api/v1/colleges/:id — code cannot be changed</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            College Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                College Name <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Faculty of Engineering"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                College Code
              </label>
              <Input
                value={formData.code}
                readOnly
                className="bg-gray-50 text-gray-600"
                title="Code is set at creation and cannot be changed via PATCH"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slug <span className="text-gray-400 font-normal">(read-only)</span>
              </label>
              <Input
                value={formData.slug}
                readOnly
                className="bg-gray-50 text-gray-600"
                title="From Phase 1 API response"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the college"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Established year
              </label>
              <Input
                type="number"
                value={formData.establishedYear}
                onChange={(e) => setFormData({ ...formData, establishedYear: e.target.value })}
                placeholder="e.g. 1985"
                min={1800}
                max={2100}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dean user ID <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <Input
                value={formData.deanId}
                onChange={(e) => setFormData({ ...formData, deanId: e.target.value })}
                placeholder="MongoDB ObjectId — field dean_id"
              />
            </div>

            <div className="flex items-center gap-2 pt-4">
              <Button type="submit" isLoading={loading}>
                <Save className="h-4 w-4 mr-2" />
                Update College
              </Button>
              <Link to="/dashboard/organizational/colleges">
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
