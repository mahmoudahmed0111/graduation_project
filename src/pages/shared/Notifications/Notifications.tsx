import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, CheckCheck, Trash2, Megaphone, X } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import type { BadgeTone } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { useNotificationStore } from '@/store/notificationStore';
import type { ScopeLevel } from '@/types/phase6';
import { formatTimeAgo } from '@/utils/formatters';
import { cn } from '@/lib/utils';

const SCOPE_TONE: Record<ScopeLevel, BadgeTone> = {
  Global: 'brand',
  College: 'info',
  Department: 'gold',
  Course: 'success',
};

type Filter = 'all' | 'unread' | 'read';

export function Notifications() {
  const { t } = useTranslation();
  const { items, unreadCount, markRead, markAllRead, remove, clear } = useNotificationStore();
  const [filter, setFilter] = useState<Filter>('all');

  const filtered = useMemo(
    () => items.filter((n) => (filter === 'unread' ? !n.read : filter === 'read' ? n.read : true)),
    [items, filter]
  );

  const tabs: { key: Filter; label: string }[] = [
    { key: 'all', label: t('phase6.notifications.all') },
    { key: 'unread', label: `${t('phase6.notifications.unread')}${unreadCount ? ` (${unreadCount})` : ''}` },
    { key: 'read', label: t('phase6.notifications.read') },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('phase6.notifications.title')}
        subtitle={t('phase6.notifications.subtitle')}
        actions={
          items.length > 0 ? (
            <div className="flex items-center gap-2.5">
              <Button variant="outline" onClick={markAllRead} disabled={unreadCount === 0}>
                <CheckCheck className="h-4 w-4" /> {t('phase6.notifications.markAllRead')}
              </Button>
              <Button variant="outline" onClick={clear}>
                <Trash2 className="h-4 w-4" /> {t('phase6.notifications.clear')}
              </Button>
            </div>
          ) : undefined
        }
      />

      <div className="inline-flex rounded-xl bg-gray-100 p-1 dark:bg-dark-surface-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={cn(
              'rounded-lg px-4 py-2 text-sm font-semibold transition-colors',
              filter === tab.key
                ? 'bg-white text-primary-700 shadow-sm dark:bg-dark-surface dark:text-accent-300'
                : 'text-gray-500 dark:text-slate-400'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Bell} title={t('phase6.notifications.emptyTitle')} description={t('phase6.notifications.emptyDesc')} />
      ) : (
        <div className="space-y-2.5">
          {filtered.map((n) => (
            <div
              key={n.id}
              onClick={() => markRead(n.id)}
              className={cn(
                'card-soft flex cursor-pointer items-start gap-3 p-4 transition-colors',
                !n.read && 'border-l-4 border-l-primary-500 dark:border-l-accent-400'
              )}
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-900/40 dark:text-accent-300">
                <Megaphone className="h-[18px] w-[18px]" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className={cn('truncate text-sm', n.read ? 'font-medium text-gray-700 dark:text-slate-300' : 'font-bold text-gray-900 dark:text-white')}>{n.title}</p>
                  <Badge tone={SCOPE_TONE[n.scopeLevel] ?? 'neutral'} size="sm">{t(`phase6.scope.${n.scopeLevel}`)}</Badge>
                  {!n.read && <span className="h-2 w-2 shrink-0 rounded-full bg-primary-500 dark:bg-accent-400" />}
                </div>
                <p className="mt-0.5 line-clamp-2 text-sm text-gray-600 dark:text-slate-400">{n.content}</p>
                <p className="mt-1 text-xs text-gray-400 dark:text-slate-500">
                  {n.authorName}{n.authorRole ? ` · ${n.authorRole}` : ''} · {formatTimeAgo(n.createdAt)}
                </p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); remove(n.id); }}
                className="shrink-0 rounded-md p-1 text-gray-400 transition-colors hover:text-gray-700 dark:hover:text-slate-200"
                aria-label={t('phase6.notifications.dismiss')}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
