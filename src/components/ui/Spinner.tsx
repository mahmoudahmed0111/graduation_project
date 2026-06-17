import { cn } from '@/lib/utils';

interface SpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  /** Optional label rendered below the spinner (centered). */
  label?: string;
}

const SIZES: Record<NonNullable<SpinnerProps['size']>, string> = {
  xs: 'h-4 w-4 border-2',
  sm: 'h-5 w-5 border-2',
  md: 'h-8 w-8 border-[3px]',
  lg: 'h-10 w-10 border-[3px]',
  xl: 'h-14 w-14 border-4',
};

/** Brand-coloured ring spinner. Uses the primary blue with a transparent
 *  top segment so it reads as a smooth rotating arc. */
export function Spinner({ size = 'md', className, label }: SpinnerProps) {
  const ring = (
    <span
      className={cn(
        'inline-block animate-spin rounded-full border-primary-500/25 border-t-primary-500 dark:border-accent-500/25 dark:border-t-accent-400',
        SIZES[size],
        className
      )}
      role="status"
      aria-label={label ?? 'Loading'}
    />
  );

  if (!label) return ring;

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      {ring}
      <p className="text-sm font-medium text-gray-500 dark:text-slate-400">{label}</p>
    </div>
  );
}

/** Full-area centered loading state — drop-in replacement for the ad-hoc
 *  `min-h-[400px] flex items-center justify-center` spinners across pages. */
export function PageSpinner({ label }: { label?: string }) {
  return (
    <div className="flex min-h-[360px] w-full items-center justify-center">
      <Spinner size="lg" label={label} />
    </div>
  );
}
