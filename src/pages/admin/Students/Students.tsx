import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/Table';
import { Input } from '@/components/ui/Input';
import { Select2 } from '@/components/ui/Select2';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { 
  Users, 
  Search, 
  Filter,
  Download,
  UserPlus,
  GraduationCap,
  Award,
  Building2,
  Eye,
  Edit,
  Mail,
  Calendar,
  BookOpen,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { IStudent } from '@/types';
import { logger } from '@/lib/logger';
import { getGPAColor } from '@/constants/ui';
import { getStatusBadge } from '@/utils/status';

// Mock students data - in real app, this would come from API
const mockStudents: IStudent[] = [
  {
    id: '1',
    name: 'Mahmoud Ahmed',
    email: 'mahmoud.ahmed@university.edu',
    role: 'student',
    universityId: 'university-1',
    nationalId: '12345678901234',
    year: 3,
    semester: 1,
    creditsEarned: 90,
    gpa: 3.75,
    department: {
      id: 'dept-1',
      name: 'Computer Science',
      code: 'CS',
      college: {
        id: 'college-1',
        name: 'Faculty of Engineering',
        code: 'ENG',
      },
    },
    academicStatus: 'good_standing',
  } as IStudent,
  {
    id: '2',
    name: 'Fatima Ali',
    email: 'fatima.ali@university.edu',
    role: 'student',
    universityId: 'university-1',
    nationalId: '12345678901235',
    year: 2,
    semester: 2,
    creditsEarned: 60,
    gpa: 3.9,
    department: {
      id: 'dept-1',
      name: 'Computer Science',
      code: 'CS',
      college: {
        id: 'college-1',
        name: 'Faculty of Engineering',
        code: 'ENG',
      },
    },
    academicStatus: 'honors',
  } as IStudent,
  {
    id: '3',
    name: 'Ahmed Mohamed',
    email: 'ahmed.mohamed@university.edu',
    role: 'student',
    universityId: 'university-1',
    nationalId: '12345678901236',
    year: 4,
    semester: 1,
    creditsEarned: 120,
    gpa: 3.2,
    department: {
      id: 'dept-2',
      name: 'Mathematics',
      code: 'MATH',
      college: {
        id: 'college-2',
        name: 'Faculty of Science',
        code: 'SCI',
      },
    },
    academicStatus: 'good_standing',
  } as IStudent,
  {
    id: '4',
    name: 'Sara Hassan',
    email: 'sara.hassan@university.edu',
    role: 'student',
    universityId: 'university-1',
    nationalId: '12345678901237',
    year: 1,
    semester: 1,
    creditsEarned: 15,
    gpa: 2.8,
    department: {
      id: 'dept-1',
      name: 'Computer Science',
      code: 'CS',
      college: {
        id: 'college-1',
        name: 'Faculty of Engineering',
        code: 'ENG',
      },
    },
    academicStatus: 'probation',
  } as IStudent,
];

export function Students() {
  const [students, setStudents] = useState<IStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        // In real app, fetch from API: await api.getStudents()
        // For now, using mock data
        setStudents(mockStudents);
      } catch (error) {
        logger.error('Failed to fetch students', {
          context: 'Students',
          error,
        });
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- fetchStudents run once on mount

  // Get unique departments and years for filters
  const departments = Array.from(new Set(students.map(s => s.department?.name).filter(Boolean))) as string[];
  const years = Array.from(new Set(students.map(s => s.year).filter(Boolean))).sort();

  // Filter students
  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.nationalId?.includes(searchQuery);
    const matchesYear = !selectedYear || student.year === parseInt(selectedYear);
    const matchesDepartment = !selectedDepartment || student.department?.name === selectedDepartment;
    const matchesStatus = !selectedStatus || student.academicStatus === selectedStatus;
    
    return matchesSearch && matchesYear && matchesDepartment && matchesStatus;
  });

  // Calculate statistics
  const stats = {
    total: students.length,
    byYear: years.reduce((acc, year) => {
      acc[year] = students.filter(s => s.year === year).length;
      return acc;
    }, {} as Record<number, number>),
    honors: students.filter(s => s.academicStatus === 'honors').length,
    probation: students.filter(s => s.academicStatus === 'probation').length,
    averageGPA: students.length > 0
      ? (students.reduce((sum, s) => sum + (s.gpa || 0), 0) / students.length).toFixed(2)
      : '0.00',
  };

  // Pagination
  const totalPages = Math.ceil(filteredStudents.length / pageSize);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const renderStatusBadge = (status?: string) => {
    const badge = getStatusBadge(status);
    return (
      <span className={`px-2 py-1 text-xs rounded-full font-medium ${badge.className}`}>
        {badge.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Students Management</h1>
          <p className="text-gray-600 mt-1">View and manage all registered students</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Link to="/dashboard/students/create">
            <Button variant="primary" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Add Student
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1">Total Students</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-xs text-gray-500 mt-1">Registered students</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1">Average GPA</p>
                <p className="text-3xl font-bold text-gray-900">{stats.averageGPA}</p>
                <p className="text-xs text-gray-500 mt-1">Overall performance</p>
              </div>
              <div className="p-3 rounded-lg bg-green-50">
                <Award className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1">Honors Students</p>
                <p className="text-3xl font-bold text-gray-900">{stats.honors}</p>
                <p className="text-xs text-gray-500 mt-1">High achievers</p>
              </div>
              <div className="p-3 rounded-lg bg-accent-50">
                <GraduationCap className="h-6 w-6 text-accent-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1">On Probation</p>
                <p className="text-3xl font-bold text-gray-900">{stats.probation}</p>
                <p className="text-xs text-gray-500 mt-1">Need attention</p>
              </div>
              <div className="p-3 rounded-lg bg-red-50">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="rounded-2xl border border-gray-100 shadow-sm">
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-primary-600" />
              Filters & Search
            </CardTitle>
            <div className="text-sm text-gray-600">
              Showing {filteredStudents.length} of {students.length} students
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, email, or ID..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10"
              />
            </div>
            <Select2
              value={selectedYear}
              onChange={(value) => {
                setSelectedYear(value);
                setCurrentPage(1);
              }}
              options={[
                { value: '', label: 'All Years' },
                ...years.map((year) => ({ value: year.toString(), label: `Year ${year}` })),
              ]}
              placeholder="Filter by year..."
            />
            <Select2
              value={selectedDepartment}
              onChange={(value) => {
                setSelectedDepartment(value);
                setCurrentPage(1);
              }}
              options={[
                { value: '', label: 'All Departments' },
                ...departments.map((dept) => ({ value: dept, label: dept })),
              ]}
              placeholder="Filter by department..."
            />
            <Select2
              value={selectedStatus}
              onChange={(value) => {
                setSelectedStatus(value);
                setCurrentPage(1);
              }}
              options={[
                { value: '', label: 'All Status' },
                { value: 'good_standing', label: 'Good Standing' },
                { value: 'honors', label: 'Honors' },
                { value: 'probation', label: 'Probation' },
              ]}
              placeholder="Filter by status..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle>Students List</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Credits</TableHead>
                  <TableHead>GPA</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="px-0 py-16">
                      <div className="flex flex-col items-center justify-center w-full">
                        <Users className="h-16 w-16 text-gray-300 mb-4" />
                        <p className="text-lg font-semibold text-gray-900 mb-1">No students found</p>
                        <p className="text-sm text-gray-500">Try adjusting your search or filters</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedStudents.map((student) => (
                    <TableRow key={student.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium text-primary-600">
                        {student.nationalId?.slice(-6) || student.id.slice(0, 6)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                            <span className="text-primary-600 font-semibold text-sm">
                              {student.name?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="font-medium">{student.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-gray-600">
                          <Mail className="h-3 w-3" />
                          <span className="text-sm">{student.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Building2 className="h-3 w-3 text-gray-400" />
                          <span className="text-sm">{student.department?.name || 'N/A'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          <span>Year {student.year}, Sem {student.semester}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <BookOpen className="h-3 w-3 text-gray-400" />
                          <span>{student.creditsEarned || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={getGPAColor(student.gpa || 0)}>
                          {(student.gpa || 0).toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {renderStatusBadge(student.academicStatus)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Link to={`/dashboard/students/${student.id}`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link to={`/dashboard/students/${student.id}/edit`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              title="Edit Student"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-gray-200">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

