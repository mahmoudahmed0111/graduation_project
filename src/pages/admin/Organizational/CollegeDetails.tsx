import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/Table';
import { School, ArrowLeft, Plus, MapPin, User, Edit } from 'lucide-react';
import { ICollege, ILocation } from '@/types';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import { logger } from '@/lib/logger';
import { useToastStore } from '@/store/toastStore';
import { mapDeanIdPopulate } from '@/lib/phase1Dean';
import { formatDate } from '@/utils/formatters';

function mapCollegeRecord(college: Record<string, unknown>): ICollege {
  const rawDean = college.dean_id;

  let dean: ICollege['dean'];
  let deanRefId: string | undefined;

  const populated = mapDeanIdPopulate(rawDean);
  if (populated) {
    dean = {
      id: populated.id,
      name: populated.name,
      email: populated.email,
      role: populated.role,
    };
  } else if (typeof rawDean === 'string' && rawDean.trim()) {
    deanRefId = rawDean.trim();
  }

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
    dean,
    deanRefId,
    departments: [],
    isArchived: Boolean(college.isArchived),
  };
}

/** Resolve `college_id` (ObjectId string or populated `{ _id, name, ... }`). */
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
    const byFilter = await api.getDepartments({
      college_id: collegeId,
      isArchived: 'all',
      page: 1,
      limit: 500,
      sort: 'name',
    });
    rows = byFilter as Array<Record<string, unknown>>;
  } catch {
    try {
      const nested = await api.getCollegeDepartments(collegeId, {
        isArchived: 'all',
        page: 1,
        limit: 500,
        sort: 'name',
      });
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
  const { t } = useTranslation();
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
          api.getCollegeResolvingArchived(id),
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
        showError(t('admin.collegeDetails.loadFail'));
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
        <p className="text-gray-500">{t('admin.collegeDetails.notFound')}</p>
        <Link to="/dashboard/organizational/colleges">
          <Button variant="secondary" className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('admin.collegeDetails.backToColleges')}
          </Button>
        </Link>
      </div>
    );
  }

  const tabs = [
    { id: 'departments' as const, label: t('admin.collegeDetails.departments'), icon: School },
    { id: 'locations' as const, label: t('admin.collegeDetails.locations'), icon: MapPin },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <nav
          aria-label="Breadcrumb"
          className="flex min-w-0 flex-wrap items-center gap-x-2 text-sm font-medium text-gray-600 dark:text-gray-400"
        >
          <span className="shrink-0">{t('admin.collegeDetails.section')}</span>
          <span className="shrink-0 text-gray-400 dark:text-gray-500" aria-hidden>
            /
          </span>
          <Link
            to="/dashboard/organizational/colleges"
            className="shrink-0 hover:text-primary-600 dark:hover:text-accent-400"
          >
            {t('admin.collegeDetails.colleges')}
          </Link>
          <span className="shrink-0 text-gray-400 dark:text-gray-500" aria-hidden>
            /
          </span>
          <span
            className="min-w-0 truncate font-semibold text-gray-900 dark:text-gray-100"
            title={college.name}
          >
            {college.name}
          </span>
        </nav>
        <div className="flex shrink-0 justify-end">
          <Link to={`/dashboard/organizational/colleges/${college.id}/edit`}>
            <Button variant="secondary" className="inline-flex items-center gap-2 rounded-xl">
              <Edit className="h-4 w-4" />
              {t('admin.collegeDetails.edit')}
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardContent className="py-4">
          <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <dt className="text-gray-500 dark:text-gray-400">{t('admin.collegeDetails.name')}</dt>
              <dd className="mt-0.5 font-medium text-gray-900 dark:text-gray-100">{college.name}</dd>
            </div>
            <div>
              <dt className="text-gray-500 dark:text-gray-400">{t('admin.collegeDetails.code')}</dt>
              <dd className="mt-0.5 font-medium text-gray-900 dark:text-gray-100">{college.code}</dd>
            </div>
            <div>
              <dt className="text-gray-500 dark:text-gray-400">{t('admin.collegeDetails.slug')}</dt>
              <dd className="mt-0.5">
                {college.slug ? (
                  <code className="rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-800 dark:bg-gray-800/80 dark:text-gray-200">
                    {college.slug}
                  </code>
                ) : (
                  <span className="text-gray-500 dark:text-gray-400">—</span>
                )}
              </dd>
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <dt className="text-gray-500 dark:text-gray-400">{t('admin.collegeDetails.description')}</dt>
              <dd className="mt-0.5 text-gray-900 dark:text-gray-100">{college.description ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-gray-500 dark:text-gray-400">{t('admin.collegeDetails.establishedYear')}</dt>
              <dd className="mt-0.5 tabular-nums text-gray-900 dark:text-gray-100">
                {college.establishedYear ?? '—'}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500 dark:text-gray-400">{t('admin.collegeDetails.dean')}</dt>
              <dd className="mt-0.5 space-y-1 text-gray-900 dark:text-gray-100">
                {college.dean ? (
                  <>
                    <div className="flex items-start gap-2">
                      <User className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                      <div className="min-w-0">
                        <div className="text-base font-semibold leading-snug">
                          {college.dean.name && college.dean.name !== '—' ? college.dean.name : '—'}
                        </div>
                        {college.dean.email ? (
                          <div className="text-xs text-gray-600 dark:text-gray-400">{college.dean.email}</div>
                        ) : null}
                        {college.dean.role ? (
                          <div className="text-xs capitalize text-gray-500 dark:text-gray-400">
                            {college.dean.role}
                          </div>
                        ) : null}
                        {college.dean.id ? (
                          <code
                            className="mt-0.5 block truncate text-xs text-gray-500 dark:text-gray-400"
                            title={college.dean.id}
                          >
                            {college.dean.id}
                          </code>
                        ) : null}
                      </div>
                    </div>
                  </>
                ) : college.deanRefId ? (
                  <code className="text-xs" title={college.deanRefId}>
                    {college.deanRefId}
                  </code>
                ) : (
                  '—'
                )}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500 dark:text-gray-400">{t('admin.collegeDetails.departments')}</dt>
              <dd className="mt-0.5 tabular-nums text-gray-900 dark:text-gray-100">
                {college.deptCount ?? college.departments?.length ?? '—'}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500 dark:text-gray-400">{t('admin.collegeDetails.students')}</dt>
              <dd className="mt-0.5 tabular-nums text-gray-900 dark:text-gray-100">
                {college.studentCount ?? '—'}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500 dark:text-gray-400">{t('admin.collegeDetails.archiveStatus')}</dt>
              <dd className="mt-0.5 space-y-1 text-gray-900 dark:text-gray-100">
                {college.isArchived ? (
                  <>
                    <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                      {t('admin.collegeDetails.archived')}
                    </span>
                    {college.archivedAt ? (
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <time dateTime={college.archivedAt} title={college.archivedAt}>
                          {formatDate(college.archivedAt, 'full')}
                        </time>
                      </div>
                    ) : null}
                  </>
                ) : (
                  <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-200">
                    {t('admin.collegeDetails.active')}
                  </span>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500 dark:text-gray-400">{t('admin.collegeDetails.created')}</dt>
              <dd className="mt-0.5 text-gray-900 dark:text-gray-100">
                {college.createdAt ? (
                  <time dateTime={college.createdAt} title={college.createdAt}>
                    {formatDate(college.createdAt, 'full')}
                  </time>
                ) : (
                  '—'
                )}
              </dd>
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
              <div className="flex items-center justify-end mb-4">
                <Link to="/dashboard/organizational/departments/create">
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    {t('admin.collegeDetails.addDepartment')}
                  </Button>
                </Link>
              </div>
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/80">
                    <TableHead>{t('admin.collegeDetails.code')}</TableHead>
                    <TableHead>{t('admin.collegeDetails.name')}</TableHead>
                    <TableHead className="text-right">{t('admin.collegeDetails.actions')}</TableHead>
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
                            {t('admin.collegeDetails.edit')}
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {(!college.departments || college.departments.length === 0) && (
                <p className="text-center py-8 text-gray-500 text-sm">{t('admin.collegeDetails.noDepartments')}</p>
              )}
            </div>
          )}
          {activeTab === 'locations' && (
            <div>
              <div className="flex items-center justify-end mb-4">
                <Link to="/dashboard/organizational/locations/create">
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    {t('admin.collegeDetails.addLocation')}
                  </Button>
                </Link>
              </div>
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/80">
                    <TableHead>{t('admin.collegeDetails.name')}</TableHead>
                    <TableHead>{t('admin.collegeDetails.building')}</TableHead>
                    <TableHead>{t('admin.collegeDetails.floor')}</TableHead>
                    <TableHead>{t('admin.collegeDetails.room')}</TableHead>
                    <TableHead>{t('admin.collegeDetails.capacity')}</TableHead>
                    <TableHead>{t('admin.collegeDetails.type')}</TableHead>
                    <TableHead>{t('admin.collegeDetails.status')}</TableHead>
                    <TableHead>{t('admin.collegeDetails.slug')}</TableHead>
                    <TableHead className="text-right">{t('admin.collegeDetails.actions')}</TableHead>
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
                            {t('admin.collegeDetails.maintenance')}
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
                            {t('admin.collegeDetails.active')}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">{loc.slug ?? '—'}</TableCell>
                      <TableCell className="text-right">
                        <Link to={`/dashboard/organizational/locations/${loc.id}/edit`}>
                          <Button variant="ghost" size="sm">
                            {t('admin.collegeDetails.edit')}
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {locations.length === 0 && (
                <p className="text-center py-8 text-gray-500 text-sm">{t('admin.collegeDetails.noLocations')}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
