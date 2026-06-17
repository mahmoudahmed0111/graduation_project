import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Bell, Plus, Trash2, Clock, User as UserIcon, Globe2, Building2, School, BookOpen } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import type { BadgeTone } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { Select2 } from '@/components/ui/Select2';
import { FilterBar } from '@/components/ui/FilterBar';
import { Pagination } from '@/components/ui/Pagination';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useAuthStore } from '@/store/authStore';
import { useToastStore } from '@/store/toastStore';
import { getApiErrorMessage } from '@/lib/http/client';
import { useAnnouncements, useDeleteAnnouncement } from '@/hooks/queries/usePhase6Announcements';
import type { Announcement, ScopeLevel } from '@/types/phase6';
import { formatTimeAgo, formatDate } from '@/utils/formatters';

const SCOPE_TONE: Record<ScopeLevel, BadgeTone> = {
  Global: 'brand',
  College: 'info',
  Department: 'gold',
  Course: 'success',
};
const SCOPE_ICON: Record<ScopeLevel, typeof Globe2> = {
  Global: Globe2,
  College: Building2,
  Department: School,
  Course: BookOpen,
};

const STAFF_ROLES = ['universityAdmin', 'collegeAdmin', 'doctor', 'teacher', 'ta'];
const ADMIN_ROLES = ['universityAdmin', 'collegeAdmin', 'admin', 'superAdmin'];

export function Announcements() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { success, error: showError } = useToastStore();
  const role = user?.role ?? '';
  const isAdmin = ADMIN_ROLES.includes(role);
  const canCreate = STAFF_ROLES.includes(role);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [scope, setScope] = useState<string>('all');
  const [isArchived, setIsArchived] = useState<'true' | 'false' | 'all'>('false');
  const [toDelete, setToDelete] = useState<Announcement | null>(null);

  const query = useAnnouncements({ page, limit: 12, sort: '-createdAt', ...(isAdmin ? { isArchived } : {}) });
  const deleteMutation = useDeleteAnnouncement();

  const items = query.data?.items ?? [];
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((a) => {
      const matchScope = scope === 'all' || a.scope?.level === scope;
      const matchSearch = !q || a.title.toLowerCase().includes(q) || a.content.toLowerCase().includes(q);
      return matchScope && matchSearch;
    });
  }, [items, search, scope]);

  const canDelete = (a: Announcement) => {
    if (role === 'student') return false;
    if (isAdmin) return true;
    return a.author?._id === user?.id; // DR/TA: only their own
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteMutation.mutateAsync(toDelete._id);
      success(t('phase6.announcements.deleted'));
      setToDelete(null);
    } catch (err) {
      showError(getApiErrorMessage(err, t('phase6.announcements.deleteFailed')));
    }
  };

  const scopeOptions = [
    { value: 'all', label: t('phase6.scope.all') },
    { value: 'Global', label: t('phase6.scope.Global') },
    { value: 'College', label: t('phase6.scope.College') },
    { value: 'Department', label: t('phase6.scope.Department') },
    { value: 'Course', label: t('phase6.scope.Course') },
  ];
  const archiveOptions = [
    { value: 'false', label: t('phase6.archive.active') },
    { value: 'true', label: t('phase6.archive.archived') },
    { value: 'all', label: t('phase6.archive.all') },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('phase6.announcements.title')}
        subtitle={t('phase6.announcements.subtitle')}
        actions={
          canCreate ? (
            <Link to="/dashboard/announcements/create">
              <Button className="inline-flex items-center gap-2 rounded-xl">
                <Plus className="h-4 w-4" /> {t('phase6.announcements.new')}
              </Button>
            </Link>
          ) : undefined
        }
      />

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={t('phase6.announcements.searchPlaceholder')}
        activeFilterCount={[scope !== 'all' ? scope : '', isAdmin && isArchived !== 'false' ? isArchived : ''].filter(Boolean).length}
        onClearFilters={() => { setScope('all'); setIsArchived('false'); }}
        filters={
          <>
            <Select2 label={t('phase6.announcements.scopeFilter')} value={scope} onChange={setScope} options={scopeOptions} searchable={false} />
            {isAdmin && (
              <Select2 label={t('phase6.announcements.statusFilter')} value={isArchived} onChange={(v) => { setIsArchived(v as 'true' | 'false' | 'all'); setPage(1); }} options={archiveOptions} searchable={false} />
            )}
          </>
        }
      />

      {query.isLoading ? (
        <div className="flex justify-center p-12"><Spinner /></div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Bell} title={t('phase6.announcements.emptyTitle')} description={t('phase6.announcements.emptyDesc')} />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {filtered.map((a) => {
            const Icon = SCOPE_ICON[a.scope?.level] ?? Globe2;
            return (
              <article key={a._id} className="card-soft relative p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-900/40 dark:text-accent-300">
                      <Icon className="h-[18px] w-[18px]" />
                    </span>
                    <Badge tone={SCOPE_TONE[a.scope?.level] ?? 'neutral'} size="sm">{t(`phase6.scope.${a.scope?.level}`)}</Badge>
                    {a.isArchived && <Badge tone="neutral" size="sm">{t('phase6.archive.archived')}</Badge>}
                  </div>
                  {canDelete(a) && (
                    <button
                      onClick={() => setToDelete(a)}
                      className="shrink-0 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"
                      aria-label={t('phase6.announcements.delete')}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <h3 className="mt-3 font-display text-base font-bold tracking-tight text-gray-900 dark:text-white">{a.title}</h3>
                <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-gray-600 dark:text-slate-300">{a.content}</p>
                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-slate-400">
                  <span className="inline-flex items-center gap-1.5">
                    <UserIcon className="h-3.5 w-3.5" /> {a.author?.name}
                    {a.author?.role && <span className="capitalize text-gray-400">· {a.author.role}</span>}
                  </span>
                  <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {formatTimeAgo(a.createdAt)}</span>
                  {a.expiresAt && (
                    <span className="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                      <Clock className="h-3.5 w-3.5" /> {t('phase6.announcements.expires')} {formatDate(a.expiresAt)}
                    </span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {(query.data?.totalPages ?? 1) > 1 && (
        <Pagination currentPage={page} totalPages={query.data?.totalPages ?? 1} onPageChange={setPage} />
      )}

      <ConfirmDialog
        isOpen={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        onConfirm={handleDelete}
        title={t('phase6.announcements.confirmDeleteTitle')}
        message={t('phase6.announcements.confirmDeleteMsg')}
        confirmText={t('phase6.announcements.delete')}
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
