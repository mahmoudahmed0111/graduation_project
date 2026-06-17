import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Crumb {
  label: string;
  to?: string;
}

interface PageHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  /** Breadcrumb trail rendered above the title. */
  breadcrumbs?: Crumb[];
  /** Right-aligned actions (buttons, filters, search). */
  actions?: ReactNode;
  className?: string;
}

/** Standardized page header: optional breadcrumbs, a display-weight title,
 *  a muted subtitle and a right-aligned action cluster. Gives every page the
 *  same top-of-page rhythm (matches the CRM's PageHeader). */
export function PageHeader({ title, subtitle, breadcrumbs, actions, className }: PageHeaderProps) {
  return (
    <header
      className={cn(
        'mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between',
        className
      )}
    >
      <div className="min-w-0">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="mb-2 flex flex-wrap items-center gap-1.5 text-xs text-gray-400 dark:text-slate-500">
            {breadcrumbs.map((c, idx) => (
              <span key={idx} className="inline-flex items-center gap-1.5">
                {c.to ? (
                  <Link
                    to={c.to}
                    className="transition-colors hover:text-gray-700 dark:hover:text-slate-300"
                  >
                    {c.label}
                  </Link>
                ) : (
                  <span className="font-semibold text-gray-600 dark:text-slate-300">{c.label}</span>
                )}
                {idx < breadcrumbs.length - 1 && (
                  <ChevronRight className="h-3 w-3 rtl:rotate-180" />
                )}
              </span>
            ))}
          </nav>
        )}
        <h1 className="font-display text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{title}</h1>
        {subtitle && (
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">{subtitle}</p>
        )}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2.5">{actions}</div>
      )}
    </header>
  );
}
