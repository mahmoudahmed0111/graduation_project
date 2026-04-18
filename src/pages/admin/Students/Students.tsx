import { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/Table';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Users, Search, UserPlus, GraduationCap, Mail, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { logger } from '@/lib/logger';
import { api } from '@/lib/api';
import { useToastStore } from '@/store/toastStore';
import { useAuthStore } from '@/store/authStore';

export interface StudentListRow {
  id: string;
  name: string;
  email: string;
  nationalId: string;
  collegeName: string;
  departmentName: string;
  active: boolean;
}

function mapUserToRow(u: Record<string, unknown>): StudentListRow {
  const college = u.college_id as Record<string, unknown> | string | undefined;
  const dept = u.department_id as Record<string, unknown> | string | undefined;
  const collegeName =
    college && typeof college === 'object' && college !== null && 'name' in college
      ? String((college as { name?: string }).name ?? '—')
      : '—';
  const departmentName =
    dept && typeof dept === 'object' && dept !== null && 'name' in dept
      ? String((dept as { name?: string }).name ?? '—')
      : '—';
  return {
    id: String(u._id ?? u.id ?? ''),
    name: String(u.name ?? ''),
    email: String(u.email ?? ''),
    nationalId: String(u.nationalID ?? u.nationalId ?? ''),
    collegeName,
    departmentName,
    active: u.active !== false,
  };
}

export function Students() {
  const { user } = useAuthStore();
  const { error: showError } = useToastStore();
  const canManage = user?.role === 'universityAdmin' || user?.role === 'collegeAdmin';
  const [rows, setRows] = useState<StudentListRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const list = await api.getAllUsers({
          role: 'student',
          isArchived: 'false',
        });
        setRows(list.map((u) => mapUserToRow(u as Record<string, unknown>)));
      } catch (error) {
        logger.error('Failed to fetch students', { context: 'Students', error });
        showError('Failed to load students');
        setRows([]);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.nationalId.includes(q) ||
        r.collegeName.toLowerCase().includes(q) ||
        r.departmentName.toLowerCase().includes(q)
    );
  }, [rows, searchQuery]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading students…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Students</h1>
          <p className="text-gray-600 mt-1 max-w-2xl">
            Directory from <code className="bg-gray-100 px-1 rounded text-sm">GET /api/v1/users?role=student</code>
            (scoped for college admins). Aggregated college totals remain on the{' '}
            <Link to="/dashboard/organizational/colleges" className="text-primary-600 hover:underline">
              Colleges
            </Link>{' '}
            screen (Phase 1).
          </p>
        </div>
        {canManage && (
          <Link to="/dashboard/students/create">
            <Button variant="primary" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Add student
            </Button>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-gray-600 mb-1">Students listed</p>
            <p className="text-3xl font-bold text-gray-900">{rows.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-gray-600 mb-1">Matching search</p>
            <p className="text-3xl font-bold text-gray-900">{filtered.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            All students
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="p-4 border-b border-gray-100">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search name, email, national ID, college, department…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>National ID</TableHead>
                  <TableHead>College</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                      {rows.length === 0 ? 'No students found.' : 'No students match your search.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.name}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5 text-sm">
                          <Mail className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                          {r.email || '—'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5 text-sm font-mono">
                          <CreditCard className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                          {r.nationalId || '—'}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm">{r.collegeName}</TableCell>
                      <TableCell className="text-sm">{r.departmentName}</TableCell>
                      <TableCell>
                        {r.active ? (
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">Active</span>
                        ) : (
                          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">Inactive</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link to={`/dashboard/students/${r.id}`}>
                            <Button variant="ghost" size="sm">
                              View
                            </Button>
                          </Link>
                          {canManage && (
                            <Link to={`/dashboard/students/${r.id}/edit`}>
                              <Button variant="secondary" size="sm">
                                Edit
                              </Button>
                            </Link>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card className="border-dashed border-gray-200 bg-gray-50/50">
        <CardContent className="p-5 flex gap-3">
          <GraduationCap className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />
          <p className="text-sm text-gray-600">
            Phase 1 organizational APIs expose <strong>studentCount</strong> per college, not individual accounts. This
            table uses the user directory API so admins can manage students.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
