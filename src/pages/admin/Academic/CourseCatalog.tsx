import { useEffect, useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
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
  useCreateCourseCatalog,
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

  const [createOpen, setCreateOpen] = useState(false);
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
  const createMut = useCreateCourseCatalog();
  const updateMut = useUpdateCourseCatalog();
  const archiveMut = useArchiveCourseCatalog();
  const restoreMut = useRestoreCourseCatalog();

  const items = data?.items ?? [];
  const totalPages = Math.max(1, data?.totalPages ?? 1);

  const { data: prereqPicker } = useCourseCatalogs({
    limit: 100,
    isArchived: 'false',
    college_id: isUA ? collegeId || undefined : undefined,
    department_id: departmentId || undefined,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Course catalog</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">Phase 3 — GET/POST/PATCH /api/v1/course-catalog</p>
        </div>
        {(user?.role === 'universityAdmin' || user?.role === 'collegeAdmin') && (
          <Button type="button" onClick={() => setCreateOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add course
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <CardTitle>All courses</CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              {isUA && (
                <Select2
                  label=""
                  options={collegeOptions}
                  value={collegeId}
                  onChange={setCollegeId}
                  className="w-48"
                  placeholder="College"
                />
              )}
              <Select2
                label=""
                options={departmentOptions}
                value={departmentId}
                onChange={setDepartmentId}
                className="w-56"
                placeholder="Department"
              />
              <Select2
                label=""
                options={ARCHIVE_FILTERS}
                value={isArchived}
                onChange={(v) => setIsArchived(v as 'true' | 'false' | 'all')}
                searchable={false}
                className="w-36"
              />
              <div className="relative min-w-[200px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  className="pl-10"
                  placeholder="Search…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-16 text-center text-gray-500">Loading…</div>
          ) : isError ? (
            <div className="py-16 text-center text-red-600">Failed to load catalog. Check permissions or API URL.</div>
          ) : items.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              <Library className="mx-auto mb-3 h-12 w-12 text-gray-300" />
              No courses found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Credits</TableHead>
                  <TableHead>Prerequisites</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((course) => {
                  const id = p3Id(course);
                  const archived = course.isArchived === true;
                  return (
                    <TableRow key={id}>
                      <TableCell className="font-medium">{String(course.code ?? '')}</TableCell>
                      <TableCell>
                        <div className="font-medium">{String(course.title ?? '')}</div>
                        {course.description ? (
                          <div className="text-sm text-gray-500">{String(course.description)}</div>
                        ) : null}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <School className="h-4 w-4 text-gray-400" />
                          {p3RefName(course.department_id)}
                        </div>
                      </TableCell>
                      <TableCell>{String(course.creditHours ?? '')}</TableCell>
                      <TableCell className="text-sm">{formatPrerequisites(course)}</TableCell>
                      <TableCell>
                        <span
                          className={
                            archived
                              ? 'rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700'
                              : 'rounded-full bg-emerald-50 px-2 py-1 text-xs text-emerald-800'
                          }
                        >
                          {archived ? 'Archived' : 'Active'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {(user?.role === 'universityAdmin' || user?.role === 'collegeAdmin') && (
                            <>
                              <Button type="button" variant="secondary" size="sm" onClick={() => setEditRow(course)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              {!archived ? (
                                <Button
                                  type="button"
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => setArchiveTarget(course)}
                                >
                                  <Archive className="h-4 w-4" />
                                </Button>
                              ) : (
                                <Button
                                  type="button"
                                  variant="secondary"
                                  size="sm"
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
          )}
          {!isLoading && items.length > 0 && (
            <div className="mt-4 flex justify-center">
              <Pagination currentPage={data?.currentPage ?? page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
        </CardContent>
      </Card>

      <CatalogFormModal
        mode="create"
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        departmentOptions={departmentOptions.filter((o) => o.value)}
        prerequisiteOptions={
          (prereqPicker?.items ?? []).map((c) => {
            const r = c as Record<string, unknown>;
            return { value: p3Id(r), label: `${String(r.code ?? '')} — ${String(r.title ?? '')}` };
          })
        }
        onCreate={async (payload) => {
          try {
            await createMut.mutateAsync(payload);
            success('Course created.');
            setCreateOpen(false);
          } catch (e) {
            showError(getApiErrorMessage(e));
          }
        }}
        onUpdate={undefined}
        loading={createMut.isPending}
      />

      {editRow && (
        <CatalogFormModal
          mode="edit"
          open={!!editRow}
          onClose={() => setEditRow(null)}
          initial={editRow}
          departmentOptions={departmentOptions.filter((o) => o.value)}
          prerequisiteOptions={
            (prereqPicker?.items ?? [])
              .filter((c) => p3Id(c as Record<string, unknown>) !== p3Id(editRow))
              .map((c) => {
                const r = c as Record<string, unknown>;
                return { value: p3Id(r), label: `${String(r.code ?? '')} — ${String(r.title ?? '')}` };
              })
          }
          onCreate={undefined}
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
    </div>
  );
}

function CatalogFormModal({
  mode,
  open,
  onClose,
  initial,
  departmentOptions,
  prerequisiteOptions,
  onCreate,
  onUpdate,
  loading,
}: {
  mode: 'create' | 'edit';
  open: boolean;
  onClose: () => void;
  initial?: Record<string, unknown> | null;
  departmentOptions: { value: string; label: string }[];
  prerequisiteOptions: { value: string; label: string }[];
  onCreate?: (data: {
    title: string;
    code: string;
    description?: string;
    creditHours: number;
    department_id: string;
    prerequisites_ids?: string[];
  }) => Promise<void>;
  onUpdate?: (data: {
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
  const [department_id, setDepartment_id] = useState('');
  const [selectedPrereq, setSelectedPrereq] = useState<string[]>([]);

  useEffect(() => {
    if (!open) return;
    if (mode === 'edit' && initial) {
      setTitle(String(initial.title ?? ''));
      setCode(String(initial.code ?? ''));
      setDescription(String(initial.description ?? ''));
      setCreditHours(String(initial.creditHours ?? 3));
      const d = initial.department_id;
      const deptId =
        typeof d === 'object' && d && '_id' in d
          ? String((d as { _id: string })._id)
          : typeof d === 'string'
            ? d
            : '';
      setDepartment_id(deptId);
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
      return;
    }
    if (mode === 'create') {
      setTitle('');
      setCode('');
      setDescription('');
      setCreditHours('3');
      setDepartment_id(departmentOptions[0]?.value ?? '');
      setSelectedPrereq([]);
    }
  }, [open, initial, mode, departmentOptions]);

  const togglePrereq = (id: string) => {
    setSelectedPrereq((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title={mode === 'create' ? 'Create catalog course' : 'Edit catalog course'}
      size="lg"
    >
      <div className="space-y-4">
        {mode === 'edit' && (
          <p className="text-sm text-gray-500">
            Code and department cannot be changed (API allowlist). Update title, description, credits, or prerequisites.
          </p>
        )}
        <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        {mode === 'create' ? (
          <Input label="Code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g. CS301" />
        ) : (
          <Input label="Code (read-only)" value={code} disabled />
        )}
        <Input label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <Input
          label="Credit hours"
          type="number"
          min={1}
          value={creditHours}
          onChange={(e) => setCreditHours(e.target.value)}
        />
        {mode === 'create' && (
          <Select2 label="Department" options={departmentOptions} value={department_id} onChange={setDepartment_id} />
        )}
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
              if (mode === 'create' && onCreate) {
                if (!code.trim() || !department_id) return;
                void onCreate({
                  title: title.trim(),
                  code: code.trim(),
                  description: description.trim() || undefined,
                  creditHours: ch,
                  department_id,
                  prerequisites_ids: selectedPrereq.length ? selectedPrereq : undefined,
                });
              }
              if (mode === 'edit' && onUpdate) {
                void onUpdate({
                  title: title.trim(),
                  description: description.trim() || undefined,
                  creditHours: ch,
                  prerequisites_ids: selectedPrereq,
                });
              }
            }}
          >
            {loading ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
