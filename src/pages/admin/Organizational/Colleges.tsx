import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/Table';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { 
  Building2, 
  Search, 
  Plus,
  Edit,
  Archive,
  User,
  School,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ICollege } from '@/types';
import { useToastStore } from '@/store/toastStore';
import { logger } from '@/lib/logger';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

export function Colleges() {
  const { t, i18n } = useTranslation();
  const { success, error: showError } = useToastStore();
  const [colleges, setColleges] = useState<ICollege[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [archiveDialog, setArchiveDialog] = useState<{ open: boolean; college: ICollege | null }>({
    open: false,
    college: null,
  });

  useEffect(() => {
    fetchColleges();
  }, [page, searchTerm]);

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
      setTotalPages(1);
    } catch (error) {
      logger.error('Failed to fetch colleges', { context: 'Colleges', error });
      showError('Failed to load colleges');
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async (college: ICollege) => {
    try {
      // In real app: await api.archiveCollege(college.id);
      success(`College "${college.name}" archived successfully`);
      fetchColleges();
      setArchiveDialog({ open: false, college: null });
    } catch (error) {
      showError('Failed to archive college');
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Colleges</h1>
          <p className="text-gray-600 mt-1">Manage university colleges and faculties</p>
        </div>
        <Link to="/dashboard/organizational/colleges/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add College
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Colleges</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search colleges..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredColleges.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No colleges found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Dean</TableHead>
                  <TableHead>Departments</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredColleges.map((college) => (
                  <TableRow key={college.id}>
                    <TableCell className="font-medium">{college.code}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{college.name}</div>
                        {college.description && (
                          <div className="text-sm text-gray-500">{college.description}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {college.dean ? (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span>{college.dean.name}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">Not assigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <School className="h-4 w-4 text-gray-400" />
                        <span>{college.departments?.length || 0} departments</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {college.isArchived ? (
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
                        <Link to={`/dashboard/organizational/colleges/${college.id}/edit`}>
                          <Button variant="secondary" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        {!college.isArchived && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setArchiveDialog({ open: true, college })}
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
          {totalPages > 1 && (
            <div className="mt-4">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={archiveDialog.open}
        onClose={() => setArchiveDialog({ open: false, college: null })}
        onConfirm={() => archiveDialog.college && handleArchive(archiveDialog.college)}
        title="Archive College"
        message={`Are you sure you want to archive "${archiveDialog.college?.name}"? This will also archive all associated departments.`}
        confirmText="Archive"
        variant="danger"
      />
    </div>
  );
}

