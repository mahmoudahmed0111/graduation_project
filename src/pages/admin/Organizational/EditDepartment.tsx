import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { 
  School, 
  ArrowLeft,
  Save
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToastStore } from '@/store/toastStore';
import { logger } from '@/lib/logger';
import { api, getApiErrorMessage } from '@/lib/api';

export function EditDepartment() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
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
        const raw = await api.getDepartment(id);
        const college = raw.college_id as Record<string, unknown> | undefined;
        const collegeName = String(college?.name ?? '');
        const collegeCode = String(college?.code ?? '');
        setCollegeLabel(collegeCode ? `${collegeName} (${collegeCode})` : collegeName);
        const head = raw.head_id as Record<string, unknown> | undefined;
        setFormData({
          name: String(raw.name ?? ''),
          code: String(raw.code ?? '').toUpperCase(),
          description: typeof raw.description === 'string' ? raw.description : '',
          headId: head && typeof head === 'object' ? String(head._id ?? head.id ?? '') : '',
        });
      } catch (error) {
        logger.error('Failed to fetch department', { context: 'EditDepartment', error });
        showError(getApiErrorMessage(error, 'Failed to load department'));
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
      success('Department updated successfully');
      navigate('/dashboard/organizational/departments');
    } catch (error) {
      logger.error('Failed to update department', { context: 'EditDepartment', error });
      showError(getApiErrorMessage(error, 'Failed to update department'));
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading department...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/dashboard/organizational/departments">
          <Button variant="secondary" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Department</h1>
          <p className="text-gray-600 mt-1">PATCH /api/v1/departments/:id — college_id is not mutable</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <School className="h-5 w-5" />
            Department Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                College
              </label>
              <Input value={collegeLabel} readOnly className="bg-gray-50 text-gray-700" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department Name <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Computer Science"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department Code <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="e.g., CS"
                required
                maxLength={10}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the department"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Head user ID <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <Input
                value={formData.headId}
                onChange={(e) => setFormData({ ...formData, headId: e.target.value })}
                placeholder="MongoDB ObjectId — field head_id"
              />
            </div>

            <div className="flex items-center gap-2 pt-4">
              <Button type="submit" isLoading={loading}>
                <Save className="h-4 w-4 mr-2" />
                Update Department
              </Button>
              <Link to="/dashboard/organizational/departments">
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
