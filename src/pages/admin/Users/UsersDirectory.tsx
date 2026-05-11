import { useCallback, useEffect, useMemo, useState, type KeyboardEvent, type MouseEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AdminPageShell } from '@/components/admin';
import { AdminDataTableShell } from '@/components/admin/AdminDataTableShell';
import { IndeterminateCheckbox } from '@/components/admin/AdminIndexBulkBar';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Pagination } from '@/components/ui/Pagination';
import { Select2 } from '@/components/ui/Select2';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { NationalIdLookupModal } from '@/components/users/NationalIdLookupModal';
import { UserBulkActionsPanel } from '@/components/users/UserBulkActionsPanel';
import { useColleges } from '@/hooks/queries/useColleges';
import { useDepartments } from '@/hooks/queries/useDepartments';
import { useUsers } from '@/hooks/queries/useUsers';
import { phase2DepartmentDisplayName, phase2UserId, phase2UserIsActive } from '@/lib/phase2UserUi';
import { apiRoleForSegment, listPathForSegment, type UserListSegment } from '@/lib/userListPaths';
import { useAuthStore } from '@/store/authStore';
import type { Phase2ApiUser } from '@/types/phase2-user';
import { Eye, FileUp, Fingerprint, Plus, Search, Users } from 'lucide-react';

const STATUS_FILTERS = [
  { value: 'false', labelKey: 'admin.usersDirectory.statusActive' },
  { value: 'true', labelKey: 'admin.usersDirectory.statusDeactivated' },
  { value: 'all', labelKey: 'admin.usersDirectory.statusAll' },
];

const SORT_OPTIONS = [
  { value: '-createdAt', labelKey: 'admin.usersDirectory.sortNewest' },
  { value: 'createdAt', labelKey: 'admin.usersDirectory.sortOldest' },
  { value: 'name', labelKey: 'admin.usersDirectory.sortNameAZ' },
  { value: '-name', labelKey: 'admin.usersDirectory.sortNameZA' },
  { value: 'email', labelKey: 'admin.usersDirectory.sortEmailAZ' },
];

const ACADEMIC_OPTIONS = [
  { value: '', labelKey: 'admin.usersDirectory.academicAny' },
  { value: 'active', labelKey: 'admin.usersDirectory.academicActive' },
  { value: 'graduated', labelKey: 'admin.usersDirectory.academicGraduated' },
  { value: 'good_standing', labelKey: 'admin.usersDirectory.academicGoodStanding' },
  { value: 'probation', labelKey: 'admin.usersDirectory.academicProbation' },
];

const ADMIN_TYPE_OPTIONS = [
  { value: 'universityAdmin', labelKey: 'admin.usersDirectory.adminTypeUniversity' },
  { value: 'collegeAdmin', labelKey: 'admin.usersDirectory.adminTypeCollege' },
];

/** Match `/dashboard/organizational/colleges`: load a batch once, filter in the browser (no refetch while typing). */
const USERS_LIST_FETCH_LIMIT = 500;
const CLIENT_PAGE_SIZE = 25;

function userMatchesLocalSearch(u: Phase2ApiUser, q: string): boolean {
  const s = q.trim().toLowerCase();
  if (!s) return true;
  if (u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s)) return true;
  if (String(u.role ?? '').toLowerCase().includes(s)) return true;
  if (u.phoneNumber?.toLowerCase().includes(s)) return true;
  if (u.nationalID?.toLowerCase().includes(s)) return true;
  if (u.realNationalID?.toLowerCase().includes(s)) return true;
  if (u.academicStatus?.toLowerCase().includes(s)) return true;
  if (u.level !== undefined && String(u.level).includes(s)) return true;
  return false;
}

function parseIsArchived(raw: string | null): 'true' | 'false' | 'all' {
  if (raw === 'true' || raw === 'false' || raw === 'all') return raw;
  return 'all';
}

export interface UsersDirectoryProps {
  segment: UserListSegment;
}

export function UsersDirectory({ segment }: UsersDirectoryProps) {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user: authUser } = useAuthStore();
  const isUA = authUser?.role === 'universityAdmin';
  const isCA = authUser?.role === 'collegeAdmin';

  const listBase = listPathForSegment(segment);

  const pageTitle =
    segment === 'students'
      ? t('admin.usersDirectory.pageStudents')
      : segment === 'doctors'
        ? t('admin.usersDirectory.pageDoctors')
        : segment === 'tas'
          ? t('admin.usersDirectory.pageTas')
          : t('admin.usersDirectory.pageAdmins');

  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
  const sort = searchParams.get('sort') || '-createdAt';
  const isArchived = parseIsArchived(searchParams.get('isArchived'));
  const collegeId = isUA ? searchParams.get('college_id') ?? '' : '';
  const departmentId = searchParams.get('department_id') ?? '';
  const academicStatus = searchParams.get('academicStatus') ?? '';
  const levelStr = searchParams.get('level') ?? '';
  const adminSubtypeRaw = searchParams.get('adminRole');
  const adminSubtype: 'universityAdmin' | 'collegeAdmin' =
    isCA && !isUA ? 'collegeAdmin' : adminSubtypeRaw === 'collegeAdmin' ? 'collegeAdmin' : 'universityAdmin';

  const [searchTerm, setSearchTerm] = useState(() => searchParams.get('search') ?? '');
  const [lookupOpen, setLookupOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const patchParams = useCallback(
    (updates: Record<string, string | null | undefined>) => {
      setSearchParams(
        (prev) => {
          const n = new URLSearchParams(prev);
          for (const [k, val] of Object.entries(updates)) {
            if (val === undefined || val === null || val === '') n.delete(k);
            else n.set(k, val);
          }
          return n;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  useEffect(() => {
    if (!searchParams.get('search')) return;
    patchParams({ search: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-time: drop legacy ?search= from URL; term stays in state
  }, [patchParams, searchParams]);

  const collegeScope = isUA ? collegeId || undefined : authUser?.collegeId;

  const { data: collegesData } = useColleges({ limit: 100, isArchived: 'false' }, { enabled: isUA });
  const { data: departmentsData } = useDepartments(
    {
      college_id: collegeScope,
      limit: 100,
      isArchived: 'false',
    },
    { enabled: isUA ? true : Boolean(authUser?.collegeId) }
  );

  const collegeOptions = useMemo(() => {
    const items = collegesData?.items ?? [];
    return [
      { value: '', label: t('admin.usersDirectory.allColleges') },
      ...items.map((c) => {
        const rec = c as Record<string, unknown>;
        const id = String(rec._id ?? rec.id ?? '');
        const name = String(rec.name ?? id);
        return { value: id, label: name };
      }),
    ];
  }, [collegesData?.items, t]);

  const departmentOptions = useMemo(() => {
    const items = departmentsData?.items ?? [];
    return [
      { value: '', label: t('admin.usersDirectory.allDepartments') },
      ...items.map((d) => {
        const rec = d as Record<string, unknown>;
        const id = String(rec._id ?? rec.id ?? '');
        const name = String(rec.name ?? id);
        return { value: id, label: name };
      }),
    ];
  }, [departmentsData?.items, t]);

  const departmentNameById = useMemo(() => {
    const m = new Map<string, string>();
    for (const o of departmentOptions) {
      if (o.value) m.set(o.value, o.label);
    }
    return m;
  }, [departmentOptions]);

  const levelNum = levelStr.trim() === '' ? undefined : Number(levelStr);
  const levelValid = levelStr.trim() === '' || (Number.isFinite(levelNum) && levelNum! >= 1);

  const apiRole = apiRoleForSegment(segment, adminSubtype);

  const listParams = useMemo(
    () => ({
      page: 1,
      limit: USERS_LIST_FETCH_LIMIT,
      sort,
      isArchived,
      role: apiRole,
      department_id: departmentId || undefined,
      college_id: isUA ? collegeId || undefined : undefined,
      academicStatus: segment === 'students' && academicStatus ? academicStatus : undefined,
      level: segment === 'students' && levelValid && levelNum !== undefined ? levelNum : undefined,
    }),
    [
      sort,
      isArchived,
      apiRole,
      departmentId,
      collegeId,
      isUA,
      academicStatus,
      segment,
      levelValid,
      levelNum,
    ]
  );

  useEffect(() => {
    setSelected(new Set());
  }, [page, segment, apiRole, departmentId, collegeId, isArchived, academicStatus, levelStr, searchTerm]);

  const query = useUsers(listParams);

  const items = query.data?.items ?? [];
  const apiTotal = query.data?.totalResults ?? items.length;

  const filteredItems = useMemo(
    () => items.filter((u) => userMatchesLocalSearch(u, searchTerm)),
    [items, searchTerm]
  );

  const totalFilteredPages = Math.max(1, Math.ceil(filteredItems.length / CLIENT_PAGE_SIZE));

  useEffect(() => {
    if (page > totalFilteredPages) {
      patchParams({ page: totalFilteredPages <= 1 ? null : String(totalFilteredPages) });
    }
  }, [page, totalFilteredPages, patchParams]);

  const paginatedItems = useMemo(() => {
    const p = Math.min(Math.max(1, page), totalFilteredPages);
    const start = (p - 1) * CLIENT_PAGE_SIZE;
    return filteredItems.slice(start, start + CLIENT_PAGE_SIZE);
  }, [filteredItems, page, totalFilteredPages]);

  const selectedUsers = useMemo(() => {
    const map = new Map(items.map((u) => [phase2UserId(u), u]));
    return selected.size ? ([...selected].map((id) => map.get(id)).filter(Boolean) as Phase2ApiUser[]) : [];
  }, [items, selected]);

  const allOnPageSelected =
    paginatedItems.length > 0 && paginatedItems.every((u) => selected.has(phase2UserId(u)));
  const someOnPageSelected = paginatedItems.some((u) => selected.has(phase2UserId(u)));

  const toggleAllPage = useCallback(() => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allOnPageSelected) {
        paginatedItems.forEach((u) => next.delete(phase2UserId(u)));
      } else {
        paginatedItems.forEach((u) => next.add(phase2UserId(u)));
      }
      return next;
    });
  }, [allOnPageSelected, paginatedItems]);

  const toggleOne = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const createPath = `${listBase}/create`;

  if (query.isLoading) {
    return (
      <AdminPageShell titleStack={{ section: t('admin.usersDirectory.userManagement'), page: pageTitle }} subtitle={t('admin.usersDirectory.loadingShort')}>
        <div className="flex min-h-[320px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-accent" />
            <p className="mt-4 text-gray-600 dark:text-gray-400">{t('admin.usersDirectory.loadingUsers')}</p>
          </div>
        </div>
      </AdminPageShell>
    );
  }

  if (query.isError) {
    return (
      <AdminPageShell titleStack={{ section: t('admin.usersDirectory.userManagement'), page: pageTitle }} subtitle={t('admin.usersDirectory.loadFailSubtitle')}>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-500/40 dark:bg-red-500/10">
          <p className="font-medium text-red-800 dark:text-red-200">{t('admin.usersDirectory.loadFail')}</p>
          <p className="mt-1 text-sm text-red-600 dark:text-red-300">
            {query.error instanceof Error ? query.error.message : t('admin.usersDirectory.loadFailHint')}
          </p>
          <Button variant="secondary" className="mt-4" type="button" onClick={() => void query.refetch()}>
            {t('admin.usersDirectory.retry')}
          </Button>
        </div>
      </AdminPageShell>
    );
  }

  return (
    <AdminPageShell titleStack={{ section: t('admin.usersDirectory.userManagement'), page: pageTitle }}>
      <NationalIdLookupModal isOpen={lookupOpen} onClose={() => setLookupOpen(false)} />

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full min-w-0 sm:max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder={t('admin.usersDirectory.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                className="inline-flex items-center gap-2 rounded-xl"
                onClick={() => setLookupOpen(true)}
              >
                <Fingerprint className="h-4 w-4" />
                {t('admin.usersDirectory.lookup')}
              </Button>
              <Link to="/dashboard/users/bulk-import">
                <Button type="button" variant="secondary" className="inline-flex items-center gap-2 rounded-xl">
                  <FileUp className="h-4 w-4" />
                  {t('admin.usersDirectory.bulkImport')}
                </Button>
              </Link>
              <Link to={createPath}>
                <Button type="button" variant="primary" className="inline-flex items-center gap-2 rounded-xl">
                  <Plus className="h-4 w-4" />
                  {segment === 'students' ? t('admin.usersDirectory.addStudent') : t('admin.usersDirectory.createUser')}
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 rounded-xl border border-gray-100 bg-gray-50/60 p-4 dark:border-dark-border dark:bg-dark-bg/50 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {segment === 'admins' && isUA && (
              <Select2
                label={t('admin.usersDirectory.adminType')}
                options={ADMIN_TYPE_OPTIONS.map((o) => ({ value: o.value, label: t(o.labelKey) }))}
                value={adminSubtype}
                onChange={(v) => {
                  const next = v as 'universityAdmin' | 'collegeAdmin';
                  patchParams({
                    adminRole: next === 'universityAdmin' ? null : 'collegeAdmin',
                    page: null,
                  });
                }}
                searchable={false}
              />
            )}
            <Select2
              label={t('admin.usersDirectory.accountStatus')}
              options={STATUS_FILTERS.map((o) => ({ value: o.value, label: t(o.labelKey) }))}
              value={isArchived}
              onChange={(v) => {
                const next = v as 'true' | 'false' | 'all';
                patchParams({ isArchived: next === 'all' ? null : next, page: null });
              }}
              searchable={false}
            />
            {isUA && (
              <Select2
                label={t('admin.usersDirectory.college')}
                options={collegeOptions}
                value={collegeId}
                onChange={(v) => patchParams({ college_id: v || null, page: null })}
              />
            )}
            <Select2
              label={t('admin.usersDirectory.department')}
              options={departmentOptions}
              value={departmentId}
              onChange={(v) => patchParams({ department_id: v || null, page: null })}
            />
            <Select2
              label={t('admin.usersDirectory.sort')}
              options={SORT_OPTIONS.map((o) => ({ value: o.value, label: t(o.labelKey) }))}
              value={sort}
              onChange={(v) => patchParams({ sort: v === '-createdAt' ? null : v, page: null })}
              searchable={false}
            />
            {segment === 'students' && (
              <Select2
                label={t('admin.usersDirectory.academicStatus')}
                options={ACADEMIC_OPTIONS.map((o) => ({ value: o.value, label: t(o.labelKey) }))}
                value={academicStatus}
                onChange={(v) => patchParams({ academicStatus: v || null, page: null })}
              />
            )}
            {segment === 'students' && (
              <div className="min-w-0 sm:max-w-[11rem]">
                <Input
                  label={t('admin.usersDirectory.levelOptional')}
                  type="number"
                  min={1}
                  value={levelStr}
                  onChange={(e) => patchParams({ level: e.target.value || null, page: null })}
                  error={!levelValid ? t('admin.usersDirectory.invalidLevel') : undefined}
                />
              </div>
            )}
          </div>

          <UserBulkActionsPanel
            selectedIds={[...selected]}
            selectedUsers={selectedUsers}
            departmentOptions={departmentOptions.filter((o) => o.value)}
            currentUserId={authUser?.id}
            isCollegeAdmin={isCA}
            onClear={() => setSelected(new Set())}
          />

          {items.length === 0 ? (
            <div className="py-12 text-center">
              <Users className="mx-auto mb-3 h-12 w-12 text-gray-300 dark:text-gray-600" />
              <p className="text-gray-500 dark:text-gray-400">
                {t('admin.usersDirectory.noFiltersMatch')}
              </p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="py-12 text-center">
              <Users className="mx-auto mb-3 h-12 w-12 text-gray-300 dark:text-gray-600" />
              <p className="text-gray-500 dark:text-gray-400">
                {t('admin.usersDirectory.noSearchMatch')}
              </p>
            </div>
          ) : (
            <div
              className={
                query.isPlaceholderData && query.isFetching
                  ? 'pointer-events-none opacity-60 transition-opacity'
                  : undefined
              }
              aria-busy={query.isPlaceholderData && query.isFetching ? true : undefined}
            >
              <AdminDataTableShell>
                <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <IndeterminateCheckbox
                        checked={allOnPageSelected}
                        indeterminate={!allOnPageSelected && someOnPageSelected}
                        onChange={toggleAllPage}
                        aria-label={t('admin.usersDirectory.selectAllOnPage')}
                      />
                    </TableHead>
                    <TableHead>{t('admin.usersDirectory.name')}</TableHead>
                    <TableHead>{t('admin.usersDirectory.email')}</TableHead>
                    <TableHead>{t('admin.usersDirectory.role')}</TableHead>
                    <TableHead>{t('admin.usersDirectory.department')}</TableHead>
                    <TableHead>{t('admin.usersDirectory.status')}</TableHead>
                    <TableHead className="text-end">{t('admin.usersDirectory.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedItems.map((u) => {
                    const id = phase2UserId(u);
                    const active = phase2UserIsActive(u);
                    return (
                      <TableRow key={id}>
                        <TableCell>
                          <div
                            onClick={(e: MouseEvent) => e.stopPropagation()}
                            onKeyDown={(e: KeyboardEvent) => e.stopPropagation()}
                            role="presentation"
                          >
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-gray-300 text-primary-600"
                              checked={selected.has(id)}
                              onChange={() => toggleOne(id)}
                              aria-label={t('admin.usersDirectory.selectUser', { name: u.name })}
                            />
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-gray-900 dark:text-gray-100">{u.name}</TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-400">{u.email}</TableCell>
                        <TableCell>
                          <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                            {u.role}
                          </span>
                        </TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-400">
                          {phase2DepartmentDisplayName(u, departmentNameById)}
                        </TableCell>
                        <TableCell>
                          {active ? (
                            <span className="inline-flex rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                              {t('admin.usersDirectory.statusActive')}
                            </span>
                          ) : (
                            <span className="inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                              {t('admin.usersDirectory.statusDeactivated')}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-end">
                          <Link to={`${listBase}/${id}`}>
                            <Button variant="secondary" size="sm" title={t('admin.usersDirectory.view')} className="inline-flex items-center gap-1 rounded-xl">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              </AdminDataTableShell>
            </div>
          )}

          {filteredItems.length > 0 && (
            <div className="flex flex-col items-center gap-2 border-t border-gray-100 pt-4 dark:border-dark-border sm:flex-row sm:justify-between">
              <div className="text-center sm:text-left">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('admin.usersDirectory.pageInfo', {
                    current: Math.min(page, totalFilteredPages),
                    total: totalFilteredPages,
                    count: filteredItems.length,
                    label: searchTerm.trim() ? t('admin.usersDirectory.matchingUsers') : t('admin.usersDirectory.users'),
                  })}
                </p>
                {apiTotal > items.length ? (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {t('admin.usersDirectory.loadedInfo', { loaded: items.length, total: apiTotal })}
                  </p>
                ) : null}
              </div>
              <Pagination
                currentPage={Math.min(page, totalFilteredPages)}
                totalPages={totalFilteredPages}
                onPageChange={(p) => patchParams({ page: p <= 1 ? null : String(p) })}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </AdminPageShell>
  );
}
