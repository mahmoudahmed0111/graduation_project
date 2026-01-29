import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { 
  Building2, 
  ArrowLeft,
  Save
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToastStore } from '@/store/toastStore';
import { logger } from '@/lib/logger';

export function CreateCollege() {
  const navigate = useNavigate();
  const { success, error: showError } = useToastStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    deanId: '',
  });

  // Mock deans list - in real app, fetch from API
  const deans = [
    { id: 'dean-1', name: 'Dr. Mohamed Hassan' },
    { id: 'dean-2', name: 'Dr. Sarah Ahmed' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      // In real app: await api.createCollege(formData);
      await new Promise(resolve => setTimeout(resolve, 1000));
      success('College created successfully');
      navigate('/dashboard/organizational/colleges');
    } catch (error) {
      logger.error('Failed to create college', { context: 'CreateCollege', error });
      showError('Failed to create college');
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
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create College</h1>
          <p className="text-gray-600 mt-1">Add a new college or faculty</p>
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
              <Select
                value={formData.deanId}
                onChange={(e) => setFormData({ ...formData, deanId: e.target.value })}
                options={[
                  { value: '', label: 'Select a dean...' },
                  ...deans.map(dean => ({ value: dean.id, label: dean.name })),
                ]}
              />
            </div>

            <div className="flex items-center gap-2 pt-4">
              <Button type="submit" isLoading={loading}>
                <Save className="h-4 w-4 mr-2" />
                Create College
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

