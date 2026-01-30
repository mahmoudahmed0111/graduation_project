import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/Table';
import { Building2, School, UserPlus, ArrowLeft, Plus } from 'lucide-react';
import { ICollege } from '@/types';
import { cn } from '@/lib/utils';

export function CollegeDetails() {
  const { id } = useParams<{ id: string }>();
  const [college, setCollege] = useState<ICollege | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'departments' | 'admins'>('departments');

  useEffect(() => {
    const fetchCollege = async () => {
      if (!id) return;
      try {
        setLoading(true);
        // In real app: const data = await api.getCollege(id);
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
        const found = mockColleges.find((c) => c.id === id) || null;
        setCollege(found);
      } catch {
        setCollege(null);
      } finally {
        setLoading(false);
      }
    };
    fetchCollege();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
      </div>
    );
  }

  if (!college) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">College not found</p>
        <Link to="/dashboard/organizational/colleges">
          <Button variant="secondary" className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Colleges
          </Button>
        </Link>
      </div>
    );
  }

  const tabs = [
    { id: 'departments' as const, label: 'Departments', icon: School },
    { id: 'admins' as const, label: 'College Admins', icon: UserPlus },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/dashboard/organizational/colleges">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
              <Building2 className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{college.name}</h1>
              <p className="text-sm text-gray-500">{college.code}</p>
            </div>
          </div>
        </div>
        <Link to={`/dashboard/organizational/colleges/${college.id}/edit`}>
          <Button variant="secondary">Edit College</Button>
        </Link>
      </div>

      <Card>
        <div className="border-b border-gray-200">
          <nav className="flex gap-1 p-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    activeTab === tab.id
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
        <CardContent className="pt-6">
          {activeTab === 'departments' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-600">Add and modify internal departments</p>
                <Link to="/dashboard/organizational/departments/create">
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Department
                  </Button>
                </Link>
              </div>
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/80">
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(college.departments || []).map((dept: { id: string; name: string; code: string }) => (
                    <TableRow key={dept.id}>
                      <TableCell className="font-medium">{dept.code}</TableCell>
                      <TableCell>{dept.name}</TableCell>
                      <TableCell className="text-right">
                        <Link to={`/dashboard/organizational/departments/${dept.id}/edit`}>
                          <Button variant="ghost" size="sm">Edit</Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {(!college.departments || college.departments.length === 0) && (
                <p className="text-center py-8 text-gray-500 text-sm">No departments yet</p>
              )}
            </div>
          )}
          {activeTab === 'admins' && (
            <div>
              <p className="text-sm text-gray-600 mb-4">Assign staff responsible for this college</p>
              <div className="flex items-center justify-center py-12 border border-dashed border-gray-200 rounded-lg">
                <div className="text-center">
                  <UserPlus className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">College Admins</p>
                  <p className="text-gray-400 text-xs mt-1">Assign college admins from User Management</p>
                  <Link to="/dashboard/users/admins">
                    <Button variant="secondary" size="sm" className="mt-3">Go to User Management</Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
