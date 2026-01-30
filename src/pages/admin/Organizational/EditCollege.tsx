import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Select2 } from '@/components/ui/Select2';
import { 
  Building2, 
  ArrowLeft,
  Save
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ICollege } from '@/types';
import { useToastStore } from '@/store/toastStore';
import { logger } from '@/lib/logger';

export function EditCollege() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success, error: showError } = useToastStore();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    deanId: '',
  });

  // Mock deans list
  const deans = [
    { id: 'dean-1', name: 'Dr. Mohamed Hassan' },
    { id: 'dean-2', name: 'Dr. Sarah Ahmed' },
  ];

  useEffect(() => {
    fetchCollege();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps -- fetchCollege depends on id

  const fetchCollege = async () => {
    try {
      setFetching(true);
      // In real app: const college = await api.getCollege(id);
      const mockCollege: ICollege = {
        id: id || '',
        name: 'Faculty of Engineering',
        code: 'ENG',
        description: 'Engineering and Technology',
        dean: { id: 'dean-1', name: 'Dr. Mohamed Hassan' },
        departments: [],
        isArchived: false,
      };
      setFormData({
        name: mockCollege.name,
        code: mockCollege.code,
        description: mockCollege.description || '',
        deanId: mockCollege.dean?.id || '',
      });
    } catch (error) {
      logger.error('Failed to fetch college', { context: 'EditCollege', error });
      showError('Failed to load college');
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      // In real app: await api.updateCollege(id, formData);
      await new Promise(resolve => setTimeout(resolve, 1000));
      success('College updated successfully');
      navigate('/dashboard/organizational/colleges');
    } catch (error) {
      logger.error('Failed to update college', { context: 'EditCollege', error });
      showError('Failed to update college');
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
          <p className="text-gray-600 mt-1">Update college information</p>
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
                College Code <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="e.g., ENG"
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
                placeholder="Brief description of the college"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dean
              </label>
              <Select2
                value={formData.deanId}
                onChange={(value) => setFormData({ ...formData, deanId: value })}
                options={[
                  { value: '', label: 'Select a dean...' },
                  ...deans.map(dean => ({ value: dean.id, label: dean.name })),
                ]}
                placeholder="Search and select a dean..."
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

