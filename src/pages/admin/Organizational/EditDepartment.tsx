import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
import { IDepartment } from '@/types';
import { useToastStore } from '@/store/toastStore';
import { logger } from '@/lib/logger';

export function EditDepartment() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success, error: showError } = useToastStore();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [colleges, setColleges] = useState<Array<{ id: string; name: string }>>([]);
  const [users, setUsers] = useState<Array<{ id: string; name: string }>>([]);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    collegeId: '',
    headId: '',
  });

  useEffect(() => {
    fetchColleges();
    fetchUsers();
    fetchDepartment();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps -- fetchDepartment depends on id

  const fetchColleges = async () => {
    setColleges([
      { id: 'college-1', name: 'Faculty of Engineering' },
      { id: 'college-2', name: 'Faculty of Science' },
    ]);
  };

  const fetchUsers = async () => {
    setUsers([
      { id: 'user-1', name: 'Dr. Ahmed Toba' },
      { id: 'user-2', name: 'Dr. Mohamed Ali' },
      { id: 'user-3', name: 'Dr. Fatima Hassan' },
    ]);
  };

  const fetchDepartment = async () => {
    try {
      setFetching(true);
      // In real app: const dept = await api.getDepartment(id);
      const mockDept: IDepartment = {
        id: id || '',
        name: 'Computer Science',
        code: 'CS',
        description: 'Computer Science and Software Engineering',
        head: { id: 'user-1', name: 'Dr. Ahmed Toba' },
        college: { id: 'college-1', name: 'Faculty of Engineering', code: 'ENG' },
        isArchived: false,
      };
      setFormData({
        name: mockDept.name,
        code: mockDept.code,
        description: mockDept.description || '',
        collegeId: mockDept.college.id,
        headId: mockDept.head?.id || '',
      });
    } catch (error) {
      logger.error('Failed to fetch department', { context: 'EditDepartment', error });
      showError('Failed to load department');
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      // In real app: await api.updateDepartment(id, formData);
      await new Promise(resolve => setTimeout(resolve, 1000));
      success('Department updated successfully');
      navigate('/dashboard/organizational/departments');
    } catch (error) {
      logger.error('Failed to update department', { context: 'EditDepartment', error });
      showError('Failed to update department');
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
          <p className="text-gray-600 mt-1">Update department information</p>
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department Head
              </label>
              <Select2
                value={formData.headId}
                onChange={(value) => setFormData({ ...formData, headId: value })}
                options={[
                  { value: '', label: 'Select a department head...' },
                  ...users.map(user => ({ value: user.id, label: user.name })),
                ]}
                placeholder="Search and select a department head..."
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

