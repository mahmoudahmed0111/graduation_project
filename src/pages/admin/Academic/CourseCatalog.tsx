import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminDataTableShell, AdminPageShell } from '@/components/admin';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/Table';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Select2 } from '@/components/ui/Select2';
import { Modal } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { Library, Search, Plus, Edit, Archive, RotateCcw, School } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useToastStore } from '@/store/toastStore';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useColleges } from '@/hooks/queries/useColleges';
import { useDepartments } from '@/hooks/queries/useDepartments';
import {
  useCourseCatalogs,
  useCourseCatalog,
  useUpdateCourseCatalog,
  useArchiveCourseCatalog,
  useRestoreCourseCatalog,
} from '@/hooks/queries/usePhase3CourseCatalog';
import { getApiErrorMessage } from '@/lib/http/client';
import { formatPrerequisites, p3Id, p3RefName } from '@/lib/phase3Ui';

const ARCHIVE_FILTERS = [
  { value: 'false', label: 'Active' },
  { value: 'true', label: 'Archived' },
  { value: 'all', label: 'All' },
];

export function CourseCatalog() {
  const { user } = useAuthStore();
  const isUA = user?.role === 'universityAdmin';
  const { success, error: showError } = useToastStore();

  const [page, setPage] = useState(1);
  const [isArchived, setIsArchived] = useState<'true' | 'false' | 'all'>('false');
  const [departmentId, setDepartmentId] = useState('');
  const [collegeId, setCollegeId] = useState('');
  const [search, setSearch] = useState('');

  const [editRow, setEditRow] = useState<Record<string, unknown> | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<Record<string, unknown> | null>(null);

  const { data: collegesData } = useColleges(
    { limit: 100, isArchived: 'false' },
    { enabled: isUA }
  );
  const collegeOptions = useMemo(() => {
    const items = collegesData?.items ?? [];
    return [
      { value: '', label: 'All colleges' },
      ...items.map((c) => {
        const r = c as Record<string, unknown>;
        return { value: String(r._id ?? r.id ?? ''), label: String(r.name ?? '') };
      }),
    ];
  }, [collegesData?.items]);

  const deptCollege = isUA ? collegeId || undefined : user?.collegeId;
  const { data: departmentsData } = useDepartments(
    { college_id: deptCollege, limit: 100, isArchived: 'false' },
    { enabled: isUA ? true : Boolean(user?.collegeId) }
  );
  const departmentOptions = useMemo(() => {
    const items = departmentsData?.items ?? [];
    return [
      { value: '', label: 'All departments' },
      ...items.map((d) => {
        const r = d as Record<string, unknown>;
        return { value: String(r._id ?? r.id ?? ''), label: String(r.name ?? '') };
      }),
    ];
  }, [departmentsData?.items]);

  const listParams = useMemo(
    () => ({
      page,
      limit: 25,
      sort: 'code',
      isArchived,
      department_id: departmentId || undefined,
      college_id: isUA ? collegeId || undefined : undefined,
      search: search.trim() || undefined,
    }),
    [page, isArchived, departmentId, collegeId, isUA, search]
  );

  const { data, isLoading, isError, refetch } = useCourseCatalogs(listParams);
  const editCatalogId = editRow ? p3Id(editRow) : undefined;
  const {
    data: editCatalogDetail,
    isLoading: editCatalogLoading,
    isError: editCatalogDetailError,
  } = useCourseCatalog(editCatalogId);
  const updateMut = useUpdateCourseCatalog();
  const archiveMut = useArchiveCourseCatalog();
  const restoreMut = useRestoreCourseCatalog();

  const { data: prereqPicker } = useCourseCatalogs({
    limit: 100,
    isArchived: 'false',
    college_id: isUA ? collegeId || undefined : undefined,
    department_id: departmentId || undefined,
  });

  const items = data?.items ?? [];
  const totalPages = Math.max(1, data?.totalPages ?? 1);

  if (isLoading) {
    return (
      <AdminPageShell titleStack={{ section: 'Academic', page: 'Course catalog' }} subtitle="Loading…">
        <div className="flex min-h-[320px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-accent" />
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading course catalog…</p>
          </div>
        </div>
      </AdminPageShell>
    );
  }

  if (isError) {
    return (
      <AdminPageShell titleStack={{ section: 'Academic', page: 'Course catalog' }} subtitle="Could not load data">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-500/40 dark:bg-red-500/10">
          <p className="font-medium text-red-800 dark:text-red-200">Could not load course catalog</p>
          <p className="mt-1 text-sm text-red-600 dark:text-red-300">
            Check permissions, API URL, or try again.
          </p>
          <Button variant="secondary" className="mt-4" type="button" onClick={() => void refetch()}>
            Retry
          </Button>
        </div>
      </AdminPageShell>
    );
  }

  return (
    <AdminPageShell titleStack={{ section: 'Academic', page: 'Course catalog' }}>
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full min-w-0 sm:max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search code, title, description…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            {(user?.role === 'universityAdmin' || user?.role === 'collegeAdmin') && (
              <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
                <Link to="/dashboard/academic/catalog/create">
                  <Button type="button" variant="primary" className="inline-flex items-center gap-2 rounded-xl">
                    <Plus className="h-4 w-4" />
                    Add course
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 rounded-xl border border-gray-100 bg-gray-50/60 p-4 dark:border-dark-border dark:bg-dark-bg/50 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {isUA && (
              <Select2 label="College" options={collegeOptions} value={collegeId} onChange={setCollegeId} />
            )}
            <Select2 label="Department" options={departmentOptions} value={departmentId} onChange={setDepartmentId} />
            <Select2
              label="Record status"
              options={ARCHIVE_FILTERS}
              value={isArchived}
              onChange={(v) => setIsArchived(v as 'true' | 'false' | 'all')}
              searchable={false}
            />
          </div>

          {items.length === 0 ? (
            <div className="py-12 text-center">
              <Library className="mx-auto mb-3 h-12 w-12 text-gray-300 dark:text-gray-600" />
              <p className="text-gray-500 dark:text-gray-400">No courses match these filters.</p>
            </div>
          ) : (
            <AdminDataTableShell>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Credits</TableHead>
                    <TableHead>Prerequisites</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-end">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((course) => {
                    const id = p3Id(course);
                    const archived = course.isArchived === true;
                    return (
                      <TableRow key={id}>
                        <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                          {String(course.code ?? '')}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-gray-900 dark:text-gray-100">{String(course.title ?? '')}</div>
                          {course.description ? (
                            <div className="text-sm text-gray-600 dark:text-gray-400">{String(course.description)}</div>
                          ) : null}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <School className="h-4 w-4 shrink-0 text-gray-400" />
                            {p3RefName(course.department_id)}
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-400">{String(course.creditHours ?? '')}</TableCell>
                        <TableCell className="text-sm text-gray-600 dark:text-gray-400">{formatPrerequisites(course)}</TableCell>
                        <TableCell>
                          <span
                            className={
                              archived
                                ? 'inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                                : 'inline-flex rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                            }
                          >
                            {archived ? 'Archived' : 'Active'}
                          </span>
                        </TableCell>
                        <TableCell className="text-end">
                          <div className="flex justify-end gap-2">
                            {(user?.role === 'universityAdmin' || user?.role === 'collegeAdmin') && (
                              <>
                                <Button
                                  type="button"
                                  variant="secondary"
                                  size="sm"
                                  title="Edit"
                                  className="inline-flex items-center gap-1 rounded-xl"
                                  onClick={() => setEditRow(course)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                {!archived ? (
                                  <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    title="Archive"
                                    className="inline-flex items-center gap-1 rounded-xl"
                                    onClick={() => setArchiveTarget(course)}
                                  >
                                    <Archive className="h-4 w-4" />
                                  </Button>
                                ) : (
                                  <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    title="Restore"
                                    className="inline-flex items-center gap-1 rounded-xl"
                                    onClick={() => {
                                      void (async () => {
                                        try {
                                          await restoreMut.mutateAsync(id);
                                          success('Course restored.');
                                          void refetch();
                                        } catch (e) {
                                          showError(getApiErrorMessage(e));
                                        }
                                      })();
                                    }}
                                  >
                                    <RotateCcw className="h-4 w-4" />
                                  </Button>
                                )}
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </AdminDataTableShell>
          )}

          {items.length > 0 && (
            <div className="flex flex-col items-center gap-2 border-t border-gray-100 pt-4 dark:border-dark-border sm:flex-row sm:justify-between">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Page {data?.currentPage ?? page} of {totalPages} · {data?.totalResults ?? items.length} courses
              </p>
              <Pagination currentPage={data?.currentPage ?? page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
        </CardContent>
      </Card>

      {editRow && (
        <CatalogEditModal
          open={!!editRow}
          onClose={() => setEditRow(null)}
          initial={(editCatalogDetail as Record<string, unknown> | undefined) ?? editRow}
          detailLoading={Boolean(editCatalogId) && editCatalogLoading && !editCatalogDetail}
          detailError={Boolean(editCatalogId) && editCatalogDetailError}
          prerequisiteOptions={
            (prereqPicker?.items ?? [])
              .filter((c) => p3Id(c as Record<string, unknown>) !== p3Id(editRow))
              .map((c) => {
                const r = c as Record<string, unknown>;
                return { value: p3Id(r), label: `${String(r.code ?? '')} — ${String(r.title ?? '')}` };
              })
          }
          onUpdate={async (payload) => {
            try {
              await updateMut.mutateAsync({ id: p3Id(editRow), data: payload });
              success('Course updated.');
              setEditRow(null);
            } catch (e) {
              showError(getApiErrorMessage(e));
            }
          }}
          loading={updateMut.isPending}
        />
      )}

      <ConfirmDialog
        isOpen={!!archiveTarget}
        onClose={() => setArchiveTarget(null)}
        onConfirm={() => {
          if (!archiveTarget) return;
          void (async () => {
            try {
              await archiveMut.mutateAsync(p3Id(archiveTarget));
              success('Course archived.');
              setArchiveTarget(null);
              void refetch();
            } catch (e) {
              showError(getApiErrorMessage(e));
            }
          })();
        }}
        title="Archive course"
        message={`Archive "${String(archiveTarget?.title ?? '')}"? Active offerings must be cleared first.`}
        confirmText="Archive"
        variant="danger"
      />
    </AdminPageShell>
  );
}

function CatalogEditModal({
  open,
  onClose,
  initial,
  detailLoading,
  detailError,
  prerequisiteOptions,
  onUpdate,
  loading,
}: {
  open: boolean;
  onClose: () => void;
  initial?: Record<string, unknown> | null;
  /** True while `GET /course-catalog/:id` is in flight (edit mode). */
  detailLoading?: boolean;
  /** True when detail fetch failed; form still uses list row as fallback. */
  detailError?: boolean;
  prerequisiteOptions: { value: string; label: string }[];
  onUpdate: (data: {
    title?: string;
    description?: string;
    creditHours?: number;
    prerequisites_ids?: string[];
  }) => Promise<void>;
  loading: boolean;
}) {
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [creditHours, setCreditHours] = useState('3');
  const [selectedPrereq, setSelectedPrereq] = useState<string[]>([]);

  useEffect(() => {
    if (!open || !initial) return;
    setTitle(String(initial.title ?? ''));
    setCode(String(initial.code ?? ''));
    setDescription(String(initial.description ?? ''));
    setCreditHours(String(initial.creditHours ?? 3));
    const raw = initial.prerequisites_ids;
    if (Array.isArray(raw)) {
      setSelectedPrereq(
        raw
          .map((p) =>
            typeof p === 'string'
              ? p
              : p && typeof p === 'object' && '_id' in p
                ? String((p as { _id: string })._id)
                : ''
          )
          .filter(Boolean)
      );
    } else setSelectedPrereq([]);
  }, [open, initial]);

  const togglePrereq = (id: string) => {
    setSelectedPrereq((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  return (
    <Modal isOpen={open} onClose={onClose} title="Edit catalog course" size="lg">
      <div className="space-y-4">
        {detailLoading ? (
          <p className="text-sm text-amber-700 dark:text-amber-300">Loading latest course from server…</p>
        ) : null}
        {detailError ? (
          <p className="text-sm text-amber-800 dark:text-amber-200">
            Could not refresh this course from the server. Showing list data — save may fail if the record changed.
          </p>
        ) : null}
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Code and department cannot be changed (API allowlist). Update title, description, credits, or prerequisites.
        </p>
        <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Input label="Code (read-only)" value={code} disabled />
        <Input label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <Input
          label="Credit hours"
          type="number"
          min={1}
          value={creditHours}
          onChange={(e) => setCreditHours(e.target.value)}
        />
        <div>
          <p className="mb-2 text-sm font-medium text-gray-700">Prerequisites</p>
          <div className="max-h-40 space-y-2 overflow-y-auto rounded-lg border border-gray-200 p-2">
            {prerequisiteOptions.length === 0 ? (
              <p className="text-sm text-gray-500">No other courses loaded for selection.</p>
            ) : (
              prerequisiteOptions.map((o) => (
                <label key={o.value} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedPrereq.includes(o.value)}
                    onChange={() => togglePrereq(o.value)}
                  />
                  {o.label}
                </label>
              ))
            )}
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            disabled={loading}
            onClick={() => {
              const ch = Number(creditHours);
              if (!title.trim() || !Number.isFinite(ch) || ch < 1) return;
              void onUpdate({
                title: title.trim(),
                description: description.trim() || undefined,
                creditHours: ch,
                prerequisites_ids: selectedPrereq,
              });
            }}
          >
            {loading ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
