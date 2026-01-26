import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/Table';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Select2 } from '@/components/ui/Select2';
import { 
  Calendar, 
  Search, 
  Plus,
  Edit,
  Users,
  BookOpen,
  Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ICourseOffering } from '@/types';
import { useToastStore } from '@/store/toastStore';
import { logger } from '@/lib/logger';

export function CourseOfferings() {
  const { error: showError } = useToastStore();
  const [offerings, setOfferings] = useState<ICourseOffering[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSemester, setSelectedSemester] = useState<string>('current');

  useEffect(() => {
    fetchOfferings();
  }, [selectedSemester, searchTerm]);

  const fetchOfferings = async () => {
    try {
      setLoading(true);
      // Mock data - in real app: await api.getCourseOfferings({ semester: selectedSemester });
      const mockOfferings: ICourseOffering[] = [
        {
          id: 'offering-1',
          course: {
            id: 'catalog-1',
            title: 'Introduction to Programming',
            code: 'CS101',
            creditHours: 3,
            department: { id: 'dept-1', name: 'Computer Science' },
          },
          semester: 'Fall 2025',
          doctors: [{ id: 'doc-1', name: 'Dr. Fatima Ali' }],
          tas: [{ id: 'ta-1', name: 'Ahmed Mohamed' }],
          schedule: [
            { day: 'Sunday', startTime: '10:00', endTime: '12:00', location: 'Hall 501', sessionType: 'lecture' },
          ],
          maxSeats: 50,
          gradingPolicy: { attendance: 10, midterm: 20, assignments: 20, finalExam: 50 },
        },
      ];
      setOfferings(mockOfferings);
    } catch (error) {
      logger.error('Failed to fetch offerings', { context: 'CourseOfferings', error });
      showError('Failed to load course offerings');
    } finally {
      setLoading(false);
    }
  };

  const filteredOfferings = offerings.filter(offering =>
    offering.course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    offering.course.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading course offerings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Course Offerings</h1>
          <p className="text-gray-600 mt-1">Manage semester course offerings</p>
        </div>
        <Link to="/dashboard/academic/offerings/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Offering
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Offerings</CardTitle>
            <div className="flex items-center gap-2">
              <Select2
                value={selectedSemester}
                onChange={setSelectedSemester}
                options={[
                  { value: 'current', label: 'Current Semester' },
                  { value: 'Fall 2025', label: 'Fall 2025' },
                  { value: 'Spring 2026', label: 'Spring 2026' },
                ]}
                className="w-48"
              />
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search offerings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredOfferings.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No course offerings found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>Semester</TableHead>
                  <TableHead>Doctors</TableHead>
                  <TableHead>TAs</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Max Seats</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOfferings.map((offering) => (
                  <TableRow key={offering.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{offering.course.code}</div>
                        <div className="text-sm text-gray-500">{offering.course.title}</div>
                      </div>
                    </TableCell>
                    <TableCell>{offering.semester}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {offering.doctors.map((doc, idx) => (
                          <span key={idx} className="text-sm">{doc.name}</span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {offering.tas.map((ta, idx) => (
                          <span key={idx} className="text-sm">{ta.name}</span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Clock className="h-3 w-3" />
                        <span>{offering.schedule.length} sessions</span>
                      </div>
                    </TableCell>
                    <TableCell>{offering.maxSeats}</TableCell>
                    <TableCell className="text-right">
                      <Link to={`/dashboard/academic/offerings/${offering.id}/edit`}>
                        <Button variant="secondary" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

