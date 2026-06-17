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
        'w-full min-w-0 overflow-x-auto thin-scrollbar',
        className
      )}
    >
      {children}
    </div>
  );
}
