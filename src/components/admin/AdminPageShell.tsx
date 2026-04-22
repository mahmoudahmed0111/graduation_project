import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface AdminPageShellProps {
  /** Plain page title (use `titleStack` instead for section / page layout). */
  title?: string;
  /** One-row heading: section / page with shared typography (e.g. University Structure / Colleges). */
  titleStack?: { section: string; page: string };
  subtitle?: string;
  breadcrumbs?: { label: string }[];
  badge?: { label: string; variant?: 'success' | 'neutral' };
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export function AdminPageShell({
  title,
  titleStack,
  subtitle,
  breadcrumbs,
  badge,
  actions,
  children,
  className,
}: AdminPageShellProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
          {breadcrumbs.map((b, i) => (
            <span key={`${b.label}-${i}`} className="flex items-center gap-2">
              {i > 0 && <span className="text-gray-300 dark:text-gray-600">/</span>}
              <span
                className={
                  i === breadcrumbs.length - 1
                    ? 'font-medium text-gray-900 dark:text-gray-100'
                    : undefined
                }
              >
                {b.label}
              </span>
            </span>
          ))}
        </nav>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-3">
            {titleStack ? (
              <h1 className="flex min-w-0 max-w-full flex-nowrap items-center gap-x-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                <span className="min-w-0 truncate">{titleStack.section}</span>
                <span className="shrink-0 text-gray-400 dark:text-gray-500" aria-hidden>
                  /
                </span>
                <span className="min-w-0 truncate">{titleStack.page}</span>
              </h1>
            ) : title ? (
              <h1 className="font-display text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                {title}
              </h1>
            ) : null}
            {badge && (
              <span
                className={cn(
                  'inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs font-medium',
                  badge.variant === 'success'
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                    : 'border-gray-200 bg-gray-50 text-gray-600 dark:border-dark-border dark:bg-dark-bg dark:text-gray-400'
                )}
              >
                {badge.label}
              </span>
            )}
          </div>
          {subtitle ? (
            <p className="max-w-2xl text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>
          ) : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
      </div>

      {children != null && children !== false ? <div className="mt-8 space-y-4">{children}</div> : null}
    </div>
  );
}
