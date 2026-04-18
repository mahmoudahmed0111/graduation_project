import { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/Table';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import {
  School,
  Search,
  Plus,
  Edit,
  Archive,
  User,
  Building2,
  RotateCcw,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { IDepartment } from '@/types';
import { useToastStore } from '@/store/toastStore';
import { logger } from '@/lib/logger';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { AdminPageShell, AdminDataTableShell } from '@/components/admin';
import { api, getApiErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

function mapDepartment(department: Record<string, unknown>): IDepartment {
  const college = department.college_id as Record<string, unknown> | undefined;
  const head = department.head_id as Record<string, unknown> | undefined;

  return {
    id: String(department._id ?? department.id ?? ''),
    name: String(department.name ?? ''),
    code: String(department.code ?? '').toUpperCase(),
    description: typeof department.description === 'string' ? department.description : undefined,
    head: head
      ? {
          id: String(head._id ?? head.id ?? ''),
          name: String(head.name ?? 'Unknown'),
        }
      : undefined,
    college: {
      id: String(college?._id ?? college?.id ?? ''),
      name: String(college?.name ?? 'Unknown College'),
      code: String(college?.code ?? '').toUpperCase(),
    },
    isArchived: Boolean(department.isArchived),
  };
}

export function Departments() {
  const { user } = useAuthStore();
  const { success, error: showError } = useToastStore();
  const isUniversityAdmin = user?.role === 'universityAdmin';
  /** All departments (incl. archived); filter by search in UI */
  const [allDepartments, setAllDepartments] = useState<IDepartment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [archiveDialog, setArchiveDialog] = useState<{ open: boolean; department: IDepartment | null }>({
    open: false,
    department: null,
  });
  const [restoreDialog, setRestoreDialog] = useState<{ open: boolean; department: IDepartment | null }>({
    open: false,
    department: null,
  });

  useEffect(() => {
    void loadPage();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadPage = async () => {
    try {
      setLoading(true);
      const deptRes = await api.getDepartments({ isArchived: 'all' });
      setAllDepartments(deptRes.map(mapDepartment));
    } catch (error) {
      logger.error('Failed to load departments page', { context: 'Departments', error });
      showError('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async (department: IDepartment) => {
    try {
      await api.archiveDepartment(department.id);
      success(`Department "${department.name}" archived successfully`);
      void loadPage();
      setArchiveDialog({ open: false, department: null });
    } catch (error) {
      showError(getApiErrorMessage(error, 'Failed to archive department'));
    }
  };

  const handleRestore = async (department: IDepartment) => {
    try {
      await api.restoreDepartment(department.id);
      success(`Department "${department.name}" restored`);
      void loadPage();
      setRestoreDialog({ open: false, department: null });
    } catch (error) {
      showError(getApiErrorMessage(error, 'Failed to restore department'));
    }
  };

  const filteredDepartments = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return allDepartments;
    return allDepartments.filter(
      (dept) =>
        dept.name.toLowerCase().includes(q) ||
        dept.code.toLowerCase().includes(q)
    );
  }, [allDepartments, searchTerm]);

  const visibleCount = filteredDepartments.length;
  const totalCount = allDepartments.length;

  const subtitleParts = `${totalCount} departments${
    searchTerm.trim() ? ` · ${visibleCount} match search` : ''
  }`;

  if (loading) {
    return (
      <AdminPageShell title="Departments" subtitle="Loading…">
        <div className="flex min-h-[320px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-accent" />
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading departments...</p>
          </div>
        </div>
      </AdminPageShell>
    );
  }

  return (
    <AdminPageShell
      title="Departments"
      subtitle={subtitleParts}
      breadcrumbs={[{ label: 'University Structure' }, { label: 'Departments' }]}
      actions={
        <Link to="/dashboard/organizational/departments/create">
          <Button className="inline-flex items-center gap-2 rounded-xl">
            <Plus className="h-4 w-4" />
            Add Department
          </Button>
        </Link>
      }
    >

      <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>All departments</CardTitle>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Showing <span className="font-medium text-gray-700 dark:text-gray-200">{visibleCount}</span>
                  {searchTerm.trim() ? ' matching search' : ''}
                </p>
              </div>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search by name or code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
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
            <AdminDataTableShell>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
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
                    <TableCell className="font-medium">{dept.name}</TableCell>
                    <TableCell className="max-w-md text-sm text-gray-600 break-words dark:text-gray-400">
                      <span title={dept.description}>{dept.description ?? '—'}</span>
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
                        {dept.isArchived && isUniversityAdmin && (
                          <Button
                            variant="secondary"
                            size="sm"
                            title="Restore (UA only)"
                            onClick={() => setRestoreDialog({ open: true, department: dept })}
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </AdminDataTableShell>
          )}
          </CardContent>
        </Card>

      <ConfirmDialog
        isOpen={archiveDialog.open}
        onClose={() => setArchiveDialog({ open: false, department: null })}
        onConfirm={() => archiveDialog.department && handleArchive(archiveDialog.department)}
        title="Archive Department"
        message={`Are you sure you want to archive "${archiveDialog.department?.name}"?`}
        confirmText="Archive"
        variant="danger"
      />
      <ConfirmDialog
        isOpen={restoreDialog.open}
        onClose={() => setRestoreDialog({ open: false, department: null })}
        onConfirm={() => restoreDialog.department && handleRestore(restoreDialog.department)}
        title="Restore Department"
        message={`Restore "${restoreDialog.department?.name}"? (PATCH /departments/:id/restore — UA only)`}
        confirmText="Restore"
        variant="info"
      />
    </AdminPageShell>
  );
}

