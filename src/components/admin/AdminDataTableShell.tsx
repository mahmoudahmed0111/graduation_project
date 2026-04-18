import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function AdminDataTableShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'w-full min-w-0 overflow-x-auto rounded-2xl border border-gray-200 bg-white dark:border-dark-border dark:bg-dark-surface',
        className
      )}
    >
      {children}
    </div>
  );
}
