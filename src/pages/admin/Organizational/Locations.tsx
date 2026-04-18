import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
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

export function Locations() {
  const { user } = useAuthStore();
  const { success, error: showError } = useToastStore();
  const invalidateLocations = useInvalidateLocations();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [archiveOpen, setArchiveOpen] = useState<{ open: boolean; loc: ILocation | null }>({
    open: false,
    loc: null,
  });

  const isUa = user?.role === 'universityAdmin';
  const isCa = user?.role === 'collegeAdmin';
  const canMutate = isUa || isCa;
  const canArchive = isUa;

  const { data, isLoading, isError, error, refetch } = useLocations({
    isArchived: 'all',
    ...(typeFilter ? { type: typeFilter } : {}),
    ...(statusFilter ? { status: statusFilter } : {}),
  });

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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto" />
          <p className="mt-4 text-gray-600">Loading locations…</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-red-800 font-medium">Could not load locations</p>
        <p className="text-sm text-red-600 mt-1">{error instanceof Error ? error.message : 'Unknown error'}</p>
        <Button variant="secondary" className="mt-4" type="button" onClick={() => void refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Locations</h1>
          <p className="text-gray-600 mt-1">GET /api/v1/locations — Phase 1 Module 4</p>
        </div>
        {canMutate && (
          <Link to="/dashboard/organizational/locations/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add location
            </Button>
          </Link>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary-600" />
              All locations
            </CardTitle>
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <div className="relative flex-1 min-w-[200px]">
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
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
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
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={12} className="text-center py-12 text-gray-500">
                      No locations match your filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((loc) => (
                    <TableRow key={loc.id}>
                      <TableCell className="font-medium break-words">{loc.name}</TableCell>
                      <TableCell>{loc.college.name}</TableCell>
                      <TableCell>{loc.building ?? '—'}</TableCell>
                      <TableCell>{loc.floor ?? '—'}</TableCell>
                      <TableCell>{loc.roomNumber ?? '—'}</TableCell>
                      <TableCell>{loc.capacity}</TableCell>
                      <TableCell className="text-sm">{loc.type.replace(/_/g, ' ')}</TableCell>
                      <TableCell>
                        {loc.status === 'maintenance' ? (
                          <span className="px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-800">
                            Maintenance
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
                            Active
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">{loc.readerId ?? '—'}</TableCell>
                      <TableCell className="text-sm text-gray-600">{loc.slug ?? '—'}</TableCell>
                      <TableCell>
                        {loc.isArchived ? (
                          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">Yes</span>
                        ) : (
                          <span className="px-2 py-1 text-xs rounded-full bg-green-50 text-green-800">No</span>
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
                  ))
                )}
              </TableBody>
            </Table>
          </div>
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
    </div>
  );
}
