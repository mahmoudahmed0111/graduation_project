import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/Table';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Select2 } from '@/components/ui/Select2';
import { 
  School, 
  Search, 
  Plus,
  Edit,
  Archive,
  User,
  Building2,
  Filter
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { IDepartment } from '@/types';
import { useToastStore } from '@/store/toastStore';
import { logger } from '@/lib/logger';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

export function Departments() {
  const { t, i18n } = useTranslation();
  const { success, error: showError } = useToastStore();
  const [departments, setDepartments] = useState<IDepartment[]>([]);
  const [colleges, setColleges] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCollege, setSelectedCollege] = useState<string>('');
  const [archiveDialog, setArchiveDialog] = useState<{ open: boolean; department: IDepartment | null }>({
    open: false,
    department: null,
  });

  useEffect(() => {
    fetchColleges();
    fetchDepartments();
  }, [selectedCollege, searchTerm]);

  const fetchColleges = async () => {
    // Mock colleges
    setColleges([
      { id: 'college-1', name: 'Faculty of Engineering' },
      { id: 'college-2', name: 'Faculty of Science' },
    ]);
  };

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      // Mock data
      const mockDepartments: IDepartment[] = [
        {
          id: 'dept-1',
          name: 'Computer Science',
          code: 'CS',
          description: 'Computer Science and Software Engineering',
          head: { id: 'head-1', name: 'Dr. Ahmed Toba' },
          college: { id: 'college-1', name: 'Faculty of Engineering', code: 'ENG' },
          isArchived: false,
        },
        {
          id: 'dept-2',
          name: 'Electrical Engineering',
          code: 'EE',
          description: 'Electrical and Electronics Engineering',
          head: { id: 'head-2', name: 'Dr. Mohamed Ali' },
          college: { id: 'college-1', name: 'Faculty of Engineering', code: 'ENG' },
          isArchived: false,
        },
        {
          id: 'dept-3',
          name: 'Mathematics',
          code: 'MATH',
          description: 'Pure and Applied Mathematics',
          head: { id: 'head-3', name: 'Dr. Fatima Hassan' },
          college: { id: 'college-2', name: 'Faculty of Science', code: 'SCI' },
          isArchived: false,
        },
      ];
      setDepartments(mockDepartments);
    } catch (error) {
      logger.error('Failed to fetch departments', { context: 'Departments', error });
      showError('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async (department: IDepartment) => {
    try {
      // In real app: await api.archiveDepartment(department.id);
      success(`Department "${department.name}" archived successfully`);
      fetchDepartments();
      setArchiveDialog({ open: false, department: null });
    } catch (error) {
      showError('Failed to archive department');
    }
  };

  const filteredDepartments = departments.filter(dept => {
    const matchesSearch = 
      dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCollege = !selectedCollege || dept.college.id === selectedCollege;
    return matchesSearch && matchesCollege;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading departments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Departments</h1>
          <p className="text-gray-600 mt-1">Manage academic departments</p>
        </div>
        <Link to="/dashboard/organizational/departments/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Department
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Departments</CardTitle>
            <div className="flex items-center gap-2">
              <Select2
                value={selectedCollege}
                onChange={setSelectedCollege}
                options={[
                  { value: '', label: 'All Colleges' },
                  ...colleges.map(c => ({ value: c.id, label: c.name })),
                ]}
                className="w-64"
              />
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search departments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredDepartments.length === 0 ? (
            <div className="text-center py-12">
              <School className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No departments found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>College</TableHead>
                  <TableHead>Head</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDepartments.map((dept) => (
                  <TableRow key={dept.id}>
                    <TableCell className="font-medium">{dept.code}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{dept.name}</div>
                        {dept.description && (
                          <div className="text-sm text-gray-500">{dept.description}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-gray-400" />
                        <span>{dept.college.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {dept.head ? (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span>{dept.head.name}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">Not assigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {dept.isArchived ? (
                        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                          Archived
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
                          Active
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/dashboard/organizational/departments/${dept.id}/edit`}>
                          <Button variant="secondary" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        {!dept.isArchived && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setArchiveDialog({ open: true, department: dept })}
                          >
                            <Archive className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={archiveDialog.open}
        onClose={() => setArchiveDialog({ open: false, department: null })}
        onConfirm={() => archiveDialog.department && handleArchive(archiveDialog.department)}
        title="Archive Department"
        message={`Are you sure you want to archive "${archiveDialog.department?.name}"?`}
        confirmText="Archive"
        variant="danger"
      />
    </div>
  );
}

