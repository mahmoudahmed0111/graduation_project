import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Building2, Search, Plus, User, School } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ICollege } from '@/types';
import { useToastStore } from '@/store/toastStore';
import { logger } from '@/lib/logger';
export function Colleges() {
  const { error: showError } = useToastStore();
  const [colleges, setColleges] = useState<ICollege[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchColleges();
  }, [searchTerm]); // eslint-disable-line react-hooks/exhaustive-deps -- fetchColleges stable

  const fetchColleges = async () => {
    try {
      setLoading(true);
      // In real app: const data = await api.getColleges({ page, search: searchTerm });
      // Mock data for now
      const mockColleges: ICollege[] = [
        {
          id: 'college-1',
          name: 'Faculty of Engineering',
          code: 'ENG',
          description: 'Engineering and Technology',
          dean: { id: 'dean-1', name: 'Dr. Mohamed Hassan' },
          departments: [
            { id: 'dept-1', name: 'Computer Science', code: 'CS' },
            { id: 'dept-2', name: 'Electrical Engineering', code: 'EE' },
          ],
          isArchived: false,
        },
        {
          id: 'college-2',
          name: 'Faculty of Science',
          code: 'SCI',
          description: 'Natural Sciences',
          dean: { id: 'dean-2', name: 'Dr. Sarah Ahmed' },
          departments: [
            { id: 'dept-3', name: 'Mathematics', code: 'MATH' },
            { id: 'dept-4', name: 'Physics', code: 'PHY' },
          ],
          isArchived: false,
        },
      ];
      setColleges(mockColleges);
    } catch (error) {
      logger.error('Failed to fetch colleges', { context: 'Colleges', error });
      showError('Failed to load colleges');
    } finally {
      setLoading(false);
    }
  };

  const filteredColleges = colleges.filter(college =>
    college.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    college.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading colleges...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">University Structure</h1>
          <p className="text-gray-600 mt-1">Page for managing academic entities</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search colleges..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Link to="/dashboard/organizational/colleges/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add College
            </Button>
          </Link>
        </div>
      </div>

      {filteredColleges.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No colleges found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredColleges.map((college) => (
            <Link key={college.id} to={`/dashboard/organizational/colleges/${college.id}`}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-primary-200">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-primary-100 flex items-center justify-center">
                      <Building2 className="h-8 w-8 text-primary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{college.name}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">{college.code}</p>
                      <div className="mt-3 space-y-1.5 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <School className="h-4 w-4 text-gray-400" />
                          <span>{college.departments?.length || 0} departments</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span>{college.dean?.name || 'No dean assigned'}</span>
                        </div>
                        <div className="text-gray-500">0 students</div>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        {college.isArchived ? (
                          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">Archived</span>
                        ) : (
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">Active</span>
                        )}
                        <span className="text-primary-600 text-sm font-medium">View details →</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

    </div>
  );
}

