import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/Table';
import { Building2, School, ArrowLeft, Plus, MapPin } from 'lucide-react';
import { ICollege, ILocation } from '@/types';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import { logger } from '@/lib/logger';
import { useToastStore } from '@/store/toastStore';

function mapCollegeRecord(college: Record<string, unknown>): ICollege {
  const dean = college.dean_id as Record<string, unknown> | undefined;

  return {
    id: String(college._id ?? college.id ?? ''),
    name: String(college.name ?? ''),
    code: String(college.code ?? '').toUpperCase(),
    slug: typeof college.slug === 'string' ? college.slug : undefined,
    description: typeof college.description === 'string' ? college.description : undefined,
    establishedYear: typeof college.establishedYear === 'number' ? college.establishedYear : undefined,
    deptCount: typeof college.deptCount === 'number' ? college.deptCount : undefined,
    studentCount: typeof college.studentCount === 'number' ? college.studentCount : undefined,
    archivedAt: college.archivedAt === null || college.archivedAt === undefined ? null : String(college.archivedAt),
    createdAt: typeof college.createdAt === 'string' ? college.createdAt : undefined,
    dean: dean
      ? {
          id: String(dean._id ?? dean.id ?? ''),
          name: String(dean.name ?? '—'),
        }
      : undefined,
    departments: [],
    isArchived: Boolean(college.isArchived),
  };
}

/** Resolve Phase 1 `college_id` (ObjectId string or populated `{ _id, name, ... }`). */
function collegeIdFromDepartment(rec: Record<string, unknown>): string | null {
  const c = rec.college_id;
  if (c == null) return null;
  if (typeof c === 'string') return c;
  if (typeof c === 'object' && c !== null) {
    const o = c as Record<string, unknown>;
    const id = o._id ?? o.id;
    return id != null ? String(id) : null;
  }
  return null;
}

/**
 * When the API mistakenly returns all departments, keep only rows for this college.
 * If no row includes `college_id`, assume the endpoint was already scoped (nested route).
 */
function filterDepartmentsToCollege(rows: Array<Record<string, unknown>>, collegeId: string): Array<Record<string, unknown>> {
  const want = String(collegeId);
  const anyCollegeId = rows.some((r) => {
    const cid = collegeIdFromDepartment(r);
    return cid != null && cid !== '';
  });
  if (!anyCollegeId) return rows;
  return rows.filter((r) => collegeIdFromDepartment(r) === want);
}

async function fetchDepartmentsForCollegeDetail(collegeId: string): Promise<Array<Record<string, unknown>>> {
  let rows: Array<Record<string, unknown>> = [];
  try {
    const byFilter = await api.getDepartments({ college_id: collegeId, isArchived: 'all', limit: 500 });
    rows = byFilter as Array<Record<string, unknown>>;
  } catch {
    try {
      const nested = await api.getCollegeDepartments(collegeId, { isArchived: 'all', limit: 500 });
      rows = nested as Array<Record<string, unknown>>;
    } catch (error) {
      logger.error('Failed to load departments for college', { context: 'CollegeDetails', error });
      throw error;
    }
  }
  return filterDepartmentsToCollege(rows, collegeId);
}

function mapLocationRow(raw: Record<string, unknown>): ILocation {
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

export function CollegeDetails() {
  const { id } = useParams<{ id: string }>();
  const { error: showError } = useToastStore();
  const [college, setCollege] = useState<ICollege | null>(null);
  const [locations, setLocations] = useState<ILocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'departments' | 'locations'>('departments');

  useEffect(() => {
    const fetchCollege = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const [rawCollege, rawLocations] = await Promise.all([
          api.getCollege(id),
          api.getCollegeLocations(id, { isArchived: 'all', limit: 500 }),
        ]);
        const rawDepartments = await fetchDepartmentsForCollegeDetail(id);
        const mappedCollege = mapCollegeRecord(rawCollege);
        mappedCollege.departments = rawDepartments.map((d) => {
          const rec = d as Record<string, unknown>;
          return {
            id: String(rec._id ?? rec.id ?? ''),
            name: String(rec.name ?? ''),
            code: String(rec.code ?? '').toUpperCase(),
          };
        });
        setCollege(mappedCollege);
        setLocations(rawLocations.map((loc) => mapLocationRow(loc as Record<string, unknown>)));
      } catch (error) {
        logger.error('Failed to fetch college', { context: 'CollegeDetails', error });
        showError('Could not load college');
        setCollege(null);
        setLocations([]);
      } finally {
        setLoading(false);
      }
    };
    void fetchCollege();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps -- reload on id; archived tab uses fresh getCollege

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
      </div>
    );
  }

  if (!college) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">College not found</p>
        <Link to="/dashboard/organizational/colleges">
          <Button variant="secondary" className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Colleges
          </Button>
        </Link>
      </div>
    );
  }

  const tabs = [
    { id: 'departments' as const, label: 'Departments', icon: School },
    { id: 'locations' as const, label: 'Locations', icon: MapPin },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Link to="/dashboard/organizational/colleges">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
              <Building2 className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{college.name}</h1>
              <p className="text-sm text-gray-500">
                {college.code}
                {college.slug ? ` · ${college.slug}` : ''}
              </p>
            </div>
          </div>
        </div>
        <Link to={`/dashboard/organizational/colleges/${college.id}/edit`}>
          <Button variant="secondary">Edit College</Button>
        </Link>
      </div>

      <Card>
        <CardContent className="py-4">
          <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div>
              <dt className="text-gray-500">Description</dt>
              <dd className="text-gray-900 mt-0.5">{college.description ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Established</dt>
              <dd className="text-gray-900 mt-0.5">{college.establishedYear ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Dean (dean_id)</dt>
              <dd className="text-gray-900 mt-0.5">{college.dean?.name ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Departments (deptCount)</dt>
              <dd className="text-gray-900 mt-0.5">{college.deptCount ?? college.departments?.length ?? 0}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Students (studentCount)</dt>
              <dd className="text-gray-900 mt-0.5">{college.studentCount ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Archived</dt>
              <dd className="text-gray-900 mt-0.5">
                {college.isArchived ? `Yes${college.archivedAt ? ` (${college.archivedAt})` : ''}` : 'No'}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Created</dt>
              <dd className="text-gray-900 mt-0.5">{college.createdAt ?? '—'}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <div className="border-b border-gray-200">
          <nav className="flex gap-1 p-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    activeTab === tab.id
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
        <CardContent className="pt-6">
          {activeTab === 'departments' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-600">GET /api/v1/colleges/:id/departments</p>
                <Link to="/dashboard/organizational/departments/create">
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Department
                  </Button>
                </Link>
              </div>
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/80">
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(college.departments || []).map((dept: { id: string; name: string; code: string }) => (
                    <TableRow key={dept.id}>
                      <TableCell className="font-medium">{dept.code}</TableCell>
                      <TableCell>{dept.name}</TableCell>
                      <TableCell className="text-right">
                        <Link to={`/dashboard/organizational/departments/${dept.id}/edit`}>
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {(!college.departments || college.departments.length === 0) && (
                <p className="text-center py-8 text-gray-500 text-sm">No departments yet</p>
              )}
            </div>
          )}
          {activeTab === 'locations' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-600">GET /api/v1/colleges/:id/locations</p>
                <Link to="/dashboard/organizational/locations/create">
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add location
                  </Button>
                </Link>
              </div>
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/80">
                    <TableHead>Name</TableHead>
                    <TableHead>Building</TableHead>
                    <TableHead>Floor</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {locations.map((loc) => (
                    <TableRow key={loc.id}>
                      <TableCell className="font-medium">{loc.name}</TableCell>
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
                      <TableCell className="text-sm text-gray-600">{loc.slug ?? '—'}</TableCell>
                      <TableCell className="text-right">
                        <Link to={`/dashboard/organizational/locations/${loc.id}/edit`}>
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {locations.length === 0 && (
                <p className="text-center py-8 text-gray-500 text-sm">No locations for this college</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
