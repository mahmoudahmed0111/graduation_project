import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  /** Shape preset. `text` adds rounded-md, `circle` rounded-full. */
  variant?: 'block' | 'text' | 'circle';
}

/** Single shimmering placeholder block. Compose these to mirror real layout
 *  so the page doesn't jump when data arrives. */
export function Skeleton({ className, variant = 'block' }: SkeletonProps) {
  return (
    <span
      aria-hidden
      className={cn(
        'skeleton block',
        variant === 'text' && 'h-3.5 rounded-md',
        variant === 'circle' && 'rounded-full',
        variant === 'block' && 'rounded-xl',
        className
      )}
    />
  );
}

/** Multi-line text placeholder. The last line is shorter for realism. */
export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-2.5', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          className={i === lines - 1 ? 'w-2/3' : 'w-full'}
        />
      ))}
    </div>
  );
}

/** Card-shaped placeholder for stat tiles / summary cards. */
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('card-soft p-5', className)}>
      <div className="flex items-center justify-between">
        <Skeleton variant="text" className="h-3 w-24" />
        <Skeleton variant="circle" className="h-9 w-9" />
      </div>
      <Skeleton variant="text" className="mt-5 h-7 w-28" />
      <Skeleton variant="text" className="mt-3 h-3 w-20" />
    </div>
  );
}

/** Table placeholder matching the standard Table density. */
export function SkeletonTable({ rows = 6, cols = 4, className }: { rows?: number; cols?: number; className?: string }) {
  return (
    <div className={cn('card-soft overflow-hidden', className)}>
      <div className="flex items-center gap-4 border-b border-gray-200/80 px-4 py-3.5 dark:border-dark-border">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} variant="text" className="h-3 flex-1" />
        ))}
      </div>
      <div className="divide-y divide-gray-100 dark:divide-dark-border">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex items-center gap-4 px-4 py-4">
            {Array.from({ length: cols }).map((_, c) => (
              <Skeleton
                key={c}
                variant="text"
                className={cn('h-3.5 flex-1', c === 0 && 'max-w-[40%]')}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
