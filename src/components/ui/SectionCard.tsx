import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SectionCardProps {
  title?: ReactNode;
  subtitle?: ReactNode;
  /** Right-aligned header content (links, filters, "See all"). */
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  /** Remove inner padding (useful when wrapping a full-bleed Table). */
  bodyClassName?: string;
  noPadding?: boolean;
}

/** A soft panel with an optional header row (title/subtitle + action).
 *  This is the workhorse container for dashboard widgets and list sections,
 *  giving consistent radius, border, shadow and header rhythm everywhere. */
export function SectionCard({
  title,
  subtitle,
  action,
  children,
  className,
  bodyClassName,
  noPadding = false,
}: SectionCardProps) {
  return (
    <section className={cn('card-soft', className)}>
      {(title || action) && (
        <header className="flex items-start justify-between gap-3 px-5 pt-5">
          <div className="min-w-0">
            {title && (
              <h3 className="text-base font-bold tracking-tight text-gray-900 dark:text-white">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="mt-0.5 text-xs text-gray-500 dark:text-slate-400">{subtitle}</p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </header>
      )}
      <div className={cn(!noPadding && 'p-5', (title || action) && !noPadding && 'pt-4', bodyClassName)}>
        {children}
      </div>
    </section>
  );
}
