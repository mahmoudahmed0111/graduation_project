import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/Table';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Select2 } from '@/components/ui/Select2';
import { MapPin, Search, Plus, Edit, Archive, RotateCcw, Wrench } from 'lucide-react';
import { ILocation } from '@/types';
import { useToastStore } from '@/store/toastStore';
import { api, getApiErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useLocations, useInvalidateLocations } from '@/hooks/queries';
import { AdminPageShell, AdminDataTableShell } from '@/components/admin';
import { formatDate } from '@/utils/formatters';

function mapLocation(raw: Record<string, unknown>): ILocation {
  const college = raw.college_id as Record<string, unknown> | undefined;
  const type = String(raw.type ?? 'lecture_hall');
  const status = String(raw.status ?? 'active');
  return {
    id: String(raw._id ?? raw.id ?? ''),
    name: String(raw.name ?? ''),
    slug: typeof raw.slug === 'string' ? raw.slug : undefined,
    college: {
      id: String(college?._id ?? college?.id ?? ''),
      name: String(college?.name ?? '—'),
    },
    building: typeof raw.building === 'string' ? raw.building : undefined,
    floor: typeof raw.floor === 'number' ? raw.floor : undefined,
    roomNumber: typeof raw.roomNumber === 'string' ? raw.roomNumber : undefined,
    capacity: typeof raw.capacity === 'number' ? raw.capacity : 0,
    type: type as ILocation['type'],
    status: status === 'maintenance' ? 'maintenance' : 'active',
    readerId: typeof raw.readerId === 'string' ? raw.readerId : undefined,
    isArchived: Boolean(raw.isArchived),
    archivedAt: raw.archivedAt === null || raw.archivedAt === undefined ? undefined : String(raw.archivedAt),
  };
}

const TYPE_OPTS = [
  { value: '', label: 'All types' },
  { value: 'lecture_hall', label: 'Lecture hall' },
  { value: 'lab', label: 'Lab' },
  { value: 'section_room', label: 'Section room' },
  { value: 'auditorium', label: 'Auditorium' },
];

const STATUS_OPTS = [
  { value: '', label: 'All statuses' },
  { value: 'active', label: 'Active' },
  { value: 'maintenance', label: 'Maintenance' },
];

const ARCHIVE_FILTER_OPTS = [
  { value: 'all', label: 'All records' },
  { value: 'false', label: 'Active (not archived)' },
  { value: 'true', label: 'Archived' },
] as const;

export function Locations() {
  const { user } = useAuthStore();
  const { success, error: showError } = useToastStore();
  const invalidateLocations = useInvalidateLocations();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [archiveFilter, setArchiveFilter] = useState<'all' | 'true' | 'false'>('all');
  const [archiveOpen, setArchiveOpen] = useState<{ open: boolean; loc: ILocation | null }>({
    open: false,
    loc: null,
  });

  const isUa = user?.role === 'universityAdmin';
  const isCa = user?.role === 'collegeAdmin';
  const canMutate = isUa || isCa;
  const canArchive = isUa;
  /** `isArchived` query is for UA/CA only (Phase 1 security notes). */
  const canFilterArchive = canMutate;

  const listParams = useMemo(
    () => ({
      page: 1,
      limit: 100,
      sort: 'name',
      ...(typeFilter ? { type: typeFilter } : {}),
      ...(statusFilter ? { status: statusFilter } : {}),
      ...(canFilterArchive ? { isArchived: archiveFilter } : {}),
    }),
    [archiveFilter, canFilterArchive, statusFilter, typeFilter]
  );

  const { data, isLoading, isError, error, refetch } = useLocations(listParams);

  const rows = useMemo(
    () => (data?.items ?? []).map((r) => mapLocation(r as Record<string, unknown>)),
    [data]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        (r.slug?.toLowerCase().includes(q) ?? false) ||
        r.college.name.toLowerCase().includes(q) ||
        (r.building?.toLowerCase().includes(q) ?? false) ||
        (r.roomNumber?.toLowerCase().includes(q) ?? false) ||
        (r.readerId?.toLowerCase().includes(q) ?? false)
    );
  }, [rows, search]);

  const toggleStatus = async (loc: ILocation) => {
    const next = loc.status === 'active' ? 'maintenance' : 'active';
    try {
      await api.patchLocationStatus(loc.id, next);
      success(`Location set to ${next}`);
      invalidateLocations();
    } catch (error) {
      showError(getApiErrorMessage(error, 'Could not update status'));
    }
  };

  const doArchive = async (loc: ILocation) => {
    try {
      await api.archiveLocation(loc.id);
      success('Location archived');
      setArchiveOpen({ open: false, loc: null });
      invalidateLocations();
    } catch (error) {
      showError(getApiErrorMessage(error, 'Could not archive'));
    }
  };

  const doRestore = async (loc: ILocation) => {
    try {
      await api.restoreLocation(loc.id);
      success('Location restored');
      invalidateLocations();
    } catch (error) {
      showError(getApiErrorMessage(error, 'Could not restore'));
    }
  };

  if (isLoading && !data) {
    return (
      <AdminPageShell
        titleStack={{ section: 'University Structure', page: 'Locations' }}
        subtitle="Loading…"
      >
        <div className="flex min-h-[320px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-accent" />
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading locations…</p>
          </div>
        </div>
      </AdminPageShell>
    );
  }

  if (isError) {
    return (
      <AdminPageShell
        titleStack={{ section: 'University Structure', page: 'Locations' }}
        subtitle="Could not load data"
      >
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-500/40 dark:bg-red-500/10">
          <p className="font-medium text-red-800 dark:text-red-200">Could not load locations</p>
          <p className="mt-1 text-sm text-red-600 dark:text-red-300">
            {error instanceof Error ? error.message : 'Unknown error'}
          </p>
          <Button variant="secondary" className="mt-4" type="button" onClick={() => void refetch()}>
            Retry
          </Button>
        </div>
      </AdminPageShell>
    );
  }

  return (
    <AdminPageShell titleStack={{ section: 'University Structure', page: 'Locations' }}>
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <div className="relative w-full min-w-0 sm:max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search name, slug, college, building…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select2
                value={typeFilter}
                onChange={setTypeFilter}
                options={TYPE_OPTS}
                placeholder="Type"
                className="sm:w-44"
              />
              <Select2
                value={statusFilter}
                onChange={setStatusFilter}
                options={STATUS_OPTS}
                placeholder="Status"
                className="sm:w-44"
              />
              {canFilterArchive && (
                <Select2
                  value={archiveFilter}
                  onChange={(v) => setArchiveFilter(v as 'all' | 'true' | 'false')}
                  options={[...ARCHIVE_FILTER_OPTS]}
                  placeholder="Archive filter"
                  className="sm:w-52"
                />
              )}
            </div>
            {canMutate && (
              <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
                <Link to="/dashboard/organizational/locations/create">
                  <Button className="inline-flex items-center gap-2 rounded-xl">
                    <Plus className="h-4 w-4" />
                    Add Location
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="py-12 text-center">
              <MapPin className="mx-auto mb-3 h-12 w-12 text-gray-300 dark:text-gray-600" />
              <p className="text-gray-500 dark:text-gray-400">
                {rows.length === 0 ? 'No locations found' : 'No locations match your search or filters'}
              </p>
            </div>
          ) : (
            <AdminDataTableShell>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>College</TableHead>
                    <TableHead>Building</TableHead>
                    <TableHead>Floor</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reader ID</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Archived</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((loc) => (
                    <TableRow key={loc.id}>
                      <TableCell className="break-words font-medium">{loc.name}</TableCell>
                      <TableCell>{loc.college.name}</TableCell>
                      <TableCell>{loc.building ?? '—'}</TableCell>
                      <TableCell>{loc.floor ?? '—'}</TableCell>
                      <TableCell>{loc.roomNumber ?? '—'}</TableCell>
                      <TableCell>{loc.capacity}</TableCell>
                      <TableCell className="text-sm">{loc.type.replace(/_/g, ' ')}</TableCell>
                      <TableCell>
                        {loc.status === 'maintenance' ? (
                          <span className="rounded-full bg-amber-100 px-2 py-1 text-xs text-amber-800">
                            Maintenance
                          </span>
                        ) : (
                          <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">
                            Active
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">{loc.readerId ?? '—'}</TableCell>
                      <TableCell className="text-sm text-gray-600">{loc.slug ?? '—'}</TableCell>
                      <TableCell>
                        {loc.isArchived ? (
                          <div className="space-y-0.5">
                            <span className="inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                              Archived
                            </span>
                            {loc.archivedAt ? (
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                <time dateTime={loc.archivedAt}>{formatDate(loc.archivedAt, 'short')}</time>
                              </div>
                            ) : null}
                          </div>
                        ) : (
                          <span className="inline-flex rounded-full bg-emerald-50 px-2 py-1 text-xs text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                            Active
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-wrap justify-end gap-1">
                          {canMutate && (
                            <Link to={`/dashboard/organizational/locations/${loc.id}/edit`}>
                              <Button variant="secondary" size="sm" title="Edit">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                          )}
                          {canMutate && !loc.isArchived && (
                            <Button
                              variant="secondary"
                              size="sm"
                              title="Toggle active / maintenance"
                              onClick={() => void toggleStatus(loc)}
                            >
                              <Wrench className="h-4 w-4" />
                            </Button>
                          )}
                          {canArchive && !loc.isArchived && (
                            <Button
                              variant="secondary"
                              size="sm"
                              title="Archive (UA only)"
                              onClick={() => setArchiveOpen({ open: true, loc })}
                            >
                              <Archive className="h-4 w-4" />
                            </Button>
                          )}
                          {canMutate && loc.isArchived && (
                            <Button
                              variant="secondary"
                              size="sm"
                              title="Restore"
                              onClick={() => void doRestore(loc)}
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
        isOpen={archiveOpen.open}
        onClose={() => setArchiveOpen({ open: false, loc: null })}
        onConfirm={() => archiveOpen.loc && void doArchive(archiveOpen.loc)}
        title="Archive location"
        message={`Archive “${archiveOpen.loc?.name ?? ''}”?`}
        confirmText="Archive"
        variant="danger"
      />
    </AdminPageShell>
  );
}
