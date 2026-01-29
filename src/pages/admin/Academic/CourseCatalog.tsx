import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/Table';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Select2 } from '@/components/ui/Select2';
import { 
  Library, 
  Search, 
  Plus,
  Edit,
  Archive,
  School
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ICourseCatalog } from '@/types';
import { useToastStore } from '@/store/toastStore';
import { logger } from '@/lib/logger';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

export function CourseCatalog() {
  const { success, error: showError } = useToastStore();
  const [courses, setCourses] = useState<ICourseCatalog[]>([]);
  const [departments, setDepartments] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [archiveDialog, setArchiveDialog] = useState<{ open: boolean; course: ICourseCatalog | null }>({
    open: false,
    course: null,
  });

  useEffect(() => {
    fetchDepartments();
    fetchCourses();
  }, [selectedDepartment, searchTerm]); // eslint-disable-line react-hooks/exhaustive-deps -- fetchCourses/fetchDepartments stable

  const fetchDepartments = async () => {
    setDepartments([
      { id: 'dept-1', name: 'Computer Science' },
      { id: 'dept-2', name: 'Electrical Engineering' },
      { id: 'dept-3', name: 'Mathematics' },
    ]);
  };

  const fetchCourses = async () => {
    try {
      setLoading(true);
      // Mock data
      const mockCourses: ICourseCatalog[] = [
        {
          id: 'catalog-1',
          title: 'Introduction to Programming',
          code: 'CS101',
          creditHours: 3,
          description: 'Fundamentals of programming',
          department: { id: 'dept-1', name: 'Computer Science' },
          prerequisites: [],
        },
        {
          id: 'catalog-2',
          title: 'Data Structures',
          code: 'CS201',
          creditHours: 4,
          description: 'Advanced data structures and algorithms',
          department: { id: 'dept-1', name: 'Computer Science' },
          prerequisites: [{ id: 'catalog-1', title: 'Introduction to Programming', code: 'CS101', creditHours: 3, department: { id: 'dept-1', name: 'Computer Science' } }],
        },
        {
          id: 'catalog-3',
          title: 'Calculus I',
          code: 'MATH101',
          creditHours: 3,
          description: 'Differential and integral calculus',
          department: { id: 'dept-3', name: 'Mathematics' },
          prerequisites: [],
        },
      ];
      setCourses(mockCourses);
    } catch (error) {
      logger.error('Failed to fetch courses', { context: 'CourseCatalog', error });
      showError('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async (course: ICourseCatalog) => {
    try {
      // In real app: await api.archiveCourseCatalog(course.id);
      success(`Course "${course.title}" archived successfully`);
      fetchCourses();
      setArchiveDialog({ open: false, course: null });
    } catch (error) {
      showError('Failed to archive course');
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = 
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = !selectedDepartment || course.department.id === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Course Catalog</h1>
          <p className="text-gray-600 mt-1">Manage course templates and prerequisites</p>
        </div>
        <Link to="/dashboard/academic/catalog/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Course
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Courses</CardTitle>
            <div className="flex items-center gap-2">
              <Select2
                value={selectedDepartment}
                onChange={setSelectedDepartment}
                options={[
                  { value: '', label: 'All Departments' },
                  ...departments.map(d => ({ value: d.id, label: d.name })),
                ]}
                className="w-64"
              />
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredCourses.length === 0 ? (
            <div className="text-center py-12">
              <Library className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No courses found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Credit Hours</TableHead>
                  <TableHead>Prerequisites</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCourses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell className="font-medium">{course.code}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{course.title}</div>
                        {course.description && (
                          <div className="text-sm text-gray-500">{course.description}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <School className="h-4 w-4 text-gray-400" />
                        <span>{course.department.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{course.creditHours} hrs</TableCell>
                    <TableCell>
                      {course.prerequisites && course.prerequisites.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {course.prerequisites.map((prereq, idx) => (
                            <span key={idx} className="px-2 py-0.5 text-xs rounded bg-blue-100 text-blue-700">
                              {prereq.code}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400">None</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
                        Active
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/dashboard/academic/catalog/${course.id}/edit`}>
                          <Button variant="secondary" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setArchiveDialog({ open: true, course })}
                        >
                          <Archive className="h-4 w-4" />
                        </Button>
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
        isOpen={archiveDialog.open}
        onClose={() => setArchiveDialog({ open: false, course: null })}
        onConfirm={() => archiveDialog.course && handleArchive(archiveDialog.course)}
        title="Archive Course"
        message={`Are you sure you want to archive "${archiveDialog.course?.title}"?`}
        confirmText="Archive"
        variant="danger"
      />
    </div>
  );
}

