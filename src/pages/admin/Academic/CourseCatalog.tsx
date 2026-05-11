import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
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

export function CourseCatalog() {
  const { t } = useTranslation();
  const ARCHIVE_FILTERS = [
    { value: 'false', label: t('admin.courseCatalog.active') },
    { value: 'true', label: t('admin.courseCatalog.archived') },
    { value: 'all', label: t('admin.courseCatalog.all') },
  ];
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
      { value: '', label: t('admin.courseCatalog.allColleges') },
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
      { value: '', label: t('admin.courseCatalog.allDepartments') },
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
      <AdminPageShell titleStack={{ section: t('admin.courseCatalog.section'), page: t('admin.courseCatalog.page') }} subtitle={t('admin.courseCatalog.loadingShort')}>
        <div className="flex min-h-[320px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-accent" />
            <p className="mt-4 text-gray-600 dark:text-gray-400">{t('admin.courseCatalog.loading')}</p>
          </div>
        </div>
      </AdminPageShell>
    );
  }

  if (isError) {
    return (
      <AdminPageShell titleStack={{ section: t('admin.courseCatalog.section'), page: t('admin.courseCatalog.page') }} subtitle={t('admin.courseCatalog.loadFailSubtitle')}>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-500/40 dark:bg-red-500/10">
          <p className="font-medium text-red-800 dark:text-red-200">{t('admin.courseCatalog.loadFail')}</p>
          <p className="mt-1 text-sm text-red-600 dark:text-red-300">
            {t('admin.courseCatalog.loadFailHint')}
          </p>
          <Button variant="secondary" className="mt-4" type="button" onClick={() => void refetch()}>
            {t('admin.courseCatalog.retry')}
          </Button>
        </div>
      </AdminPageShell>
    );
  }

  return (
    <AdminPageShell titleStack={{ section: t('admin.courseCatalog.section'), page: t('admin.courseCatalog.page') }}>
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full min-w-0 sm:max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder={t('admin.courseCatalog.searchPlaceholder')}
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
                    {t('admin.courseCatalog.addCourse')}
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 rounded-xl border border-gray-100 bg-gray-50/60 p-4 dark:border-dark-border dark:bg-dark-bg/50 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {isUA && (
              <Select2 label={t('admin.courseCatalog.college')} options={collegeOptions} value={collegeId} onChange={setCollegeId} />
            )}
            <Select2 label={t('admin.courseCatalog.department')} options={departmentOptions} value={departmentId} onChange={setDepartmentId} />
            <Select2
              label={t('admin.courseCatalog.recordStatus')}
              options={ARCHIVE_FILTERS}
              value={isArchived}
              onChange={(v) => setIsArchived(v as 'true' | 'false' | 'all')}
              searchable={false}
            />
          </div>

          {items.length === 0 ? (
            <div className="py-12 text-center">
              <Library className="mx-auto mb-3 h-12 w-12 text-gray-300 dark:text-gray-600" />
              <p className="text-gray-500 dark:text-gray-400">{t('admin.courseCatalog.noResults')}</p>
            </div>
          ) : (
            <AdminDataTableShell>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('admin.courseCatalog.code')}</TableHead>
                    <TableHead>{t('admin.courseCatalog.title')}</TableHead>
                    <TableHead>{t('admin.courseCatalog.department')}</TableHead>
                    <TableHead>{t('admin.courseCatalog.credits')}</TableHead>
                    <TableHead>{t('admin.courseCatalog.prerequisites')}</TableHead>
                    <TableHead>{t('admin.courseCatalog.status')}</TableHead>
                    <TableHead className="text-end">{t('admin.courseCatalog.actions')}</TableHead>
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
                            {archived ? t('admin.courseCatalog.archived') : t('admin.courseCatalog.active')}
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
                                  title={t('admin.courseCatalog.edit')}
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
                                    title={t('admin.courseCatalog.archive')}
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
                                    title={t('admin.courseCatalog.restore')}
                                    className="inline-flex items-center gap-1 rounded-xl"
                                    onClick={() => {
                                      void (async () => {
                                        try {
                                          await restoreMut.mutateAsync(id);
                                          success(t('admin.courseCatalog.restoredToast'));
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
                {t('admin.courseCatalog.pageInfo', { current: data?.currentPage ?? page, total: totalPages, count: data?.totalResults ?? items.length })}
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
              success(t('admin.courseCatalog.updatedToast'));
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
              success(t('admin.courseCatalog.archivedToast'));
              setArchiveTarget(null);
              void refetch();
            } catch (e) {
              showError(getApiErrorMessage(e));
            }
          })();
        }}
        title={t('admin.courseCatalog.archiveCourse')}
        message={t('admin.courseCatalog.archiveConfirm', { title: String(archiveTarget?.title ?? '') })}
        confirmText={t('admin.courseCatalog.archive')}
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
  const { t } = useTranslation();
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
    <Modal isOpen={open} onClose={onClose} title={t('admin.courseCatalog.editModalTitle')} size="lg">
      <div className="space-y-4">
        {detailLoading ? (
          <p className="text-sm text-amber-700 dark:text-amber-300">{t('admin.courseCatalog.loadingLatest')}</p>
        ) : null}
        {detailError ? (
          <p className="text-sm text-amber-800 dark:text-amber-200">
            {t('admin.courseCatalog.refreshFail')}
          </p>
        ) : null}
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t('admin.courseCatalog.editHint')}
        </p>
        <Input label={t('admin.courseCatalog.title')} value={title} onChange={(e) => setTitle(e.target.value)} />
        <Input label={t('admin.courseCatalog.codeReadOnly')} value={code} disabled />
        <Input label={t('admin.courseCatalog.description')} value={description} onChange={(e) => setDescription(e.target.value)} />
        <Input
          label={t('admin.courseCatalog.creditHours')}
          type="number"
          min={1}
          value={creditHours}
          onChange={(e) => setCreditHours(e.target.value)}
        />
        <div>
          <p className="mb-2 text-sm font-medium text-gray-700">{t('admin.courseCatalog.prerequisites')}</p>
          <div className="max-h-40 space-y-2 overflow-y-auto rounded-lg border border-gray-200 p-2">
            {prerequisiteOptions.length === 0 ? (
              <p className="text-sm text-gray-500">{t('admin.courseCatalog.noOtherCourses')}</p>
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
            {t('admin.courseCatalog.cancel')}
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
            {loading ? t('admin.courseCatalog.saving') : t('admin.courseCatalog.save')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
