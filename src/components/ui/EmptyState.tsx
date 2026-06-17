import { ReactNode } from 'react';
import { LucideIcon, Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  /** Lucide icon component. Defaults to an inbox. */
  icon?: LucideIcon;
  title: string;
  description?: string;
  /** Primary call-to-action (e.g. a Button). */
  action?: ReactNode;
  className?: string;
  /** `card` wraps the state in a soft panel; `bare` renders inline. */
  variant?: 'card' | 'bare';
}

/** Professional empty/zero-data state with a haloed brand icon, title,
 *  supporting copy and an optional CTA. Replaces the blank areas that
 *  previously appeared when a list/table had no rows. */
export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
  variant = 'card',
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center px-6 py-14 text-center',
        variant === 'card' && 'card-soft',
        className
      )}
    >
      <div className="relative mb-4">
        <span className="absolute inset-0 -m-3 rounded-full bg-primary-500/10 blur-xl dark:bg-accent-500/10" />
        <span className="relative grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-primary-50 to-accent-50 text-primary-600 ring-1 ring-primary-100 dark:from-primary-900/40 dark:to-accent-500/10 dark:text-accent-300 dark:ring-dark-border">
          <Icon className="h-7 w-7" />
        </span>
      </div>
      <h3 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm text-gray-500 dark:text-slate-400">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
