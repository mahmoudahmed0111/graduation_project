import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Select2 } from '@/components/ui/Select2';
import {
  School,
  ArrowLeft,
  Save
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToastStore } from '@/store/toastStore';
import { logger } from '@/lib/logger';
import { api, getApiErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useColleges } from '@/hooks/queries/useColleges';
import { useInvalidateDepartments } from '@/hooks/queries/useDepartments';

export function CreateDepartment() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { success, error: showError } = useToastStore();
  const invalidateDepartments = useInvalidateDepartments();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    collegeId: '',
    headId: '',
  });

  const isUniversityAdmin = user?.role === 'universityAdmin';

  const {
    data: collegesData,
    isLoading: collegesLoading,
    isError: collegesError,
    refetch: refetchColleges,
  } = useColleges(
    { page: 1, limit: 100, sort: 'name', isArchived: 'false' },
    { enabled: isUniversityAdmin }
  );

  const colleges = useMemo(() => {
    const items = collegesData?.items ?? [];
    return items.map((c) => {
      const r = c as Record<string, unknown>;
      return {
        id: String(r._id ?? r.id ?? ''),
        name: String(r.name ?? ''),
      };
    });
  }, [collegesData?.items]);

  useEffect(() => {
    if (user?.role === 'collegeAdmin' && user.collegeId) {
      setFormData((prev) => ({ ...prev, collegeId: user.collegeId! }));
    }
  }, [user?.role, user?.collegeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isUniversityAdmin && !formData.collegeId.trim()) {
      showError('Select a college');
      return;
    }
    if (!isUniversityAdmin && !formData.collegeId) {
      showError('College could not be determined');
      return;
    }
    try {
      setLoading(true);
      await api.createDepartment({
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        ...(formData.description.trim() && { description: formData.description.trim() }),
        ...(isUniversityAdmin && formData.collegeId ? { college_id: formData.collegeId } : {}),
        ...(formData.headId.trim() && { head_id: formData.headId.trim() }),
      });
      success('Department created successfully');
      invalidateDepartments();
      navigate('/dashboard/organizational/departments');
    } catch (error) {
      logger.error('Failed to create department', { context: 'CreateDepartment', error });
      showError(getApiErrorMessage(error, 'Failed to create department'));
    } finally {
      setLoading(false);
    }
  };

  if (isUniversityAdmin && collegesLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-primary-500 dark:border-accent" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading colleges…</p>
        </div>
      </div>
    );
  }

  if (isUniversityAdmin && collegesError && !collegesLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/dashboard/organizational/departments">
            <Button variant="secondary" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Create Department</h1>
        </div>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-500/40 dark:bg-red-500/10">
          <p className="font-medium text-red-800 dark:text-red-200">Could not load colleges</p>
          <Button variant="secondary" className="mt-4" type="button" onClick={() => void refetchColleges()}>
            Retry
          </Button>
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Create Department</h1>
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

            {isUniversityAdmin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  College <span className="text-red-500">*</span>
                </label>
                <Select2
                  value={formData.collegeId}
                  onChange={(value) => setFormData({ ...formData, collegeId: value })}
                  options={[
                    { value: '', label: 'Select a college...' },
                    ...colleges.map(college => ({ value: college.id, label: college.name })),
                  ]}
                  placeholder="Search and select a college..."
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Head user ID <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <Input
                value={formData.headId}
                onChange={(e) => setFormData({ ...formData, headId: e.target.value })}
                placeholder="MongoDB ObjectId — field head_id (active user in same college)"
              />
            </div>

            <div className="flex items-center gap-2 pt-4">
              <Button type="submit" isLoading={loading} disabled={isUniversityAdmin && colleges.length === 0}>
                <Save className="h-4 w-4 mr-2" />
                Create Department
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
