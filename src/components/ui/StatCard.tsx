import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export type StatTone = 'brand' | 'gold' | 'success' | 'danger' | 'info' | 'neutral';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  /** Signed delta string e.g. "+0.12" / "-3%". Direction infers arrow + colour. */
  delta?: string;
  /** Override the auto up/down direction of the delta. */
  deltaDirection?: 'up' | 'down' | 'neutral';
  /** Small caption under the value (e.g. "of 120 credits"). */
  hint?: string;
  tone?: StatTone;
  className?: string;
  onClick?: () => void;
  /** Position in a grid — drives the staggered entrance delay. */
  index?: number;
}

// Each tone maps to a soft icon chip drawn from the brand palette.
const ICON_TONE: Record<StatTone, string> = {
  brand: 'bg-primary-50 text-primary-600 dark:bg-primary-900/40 dark:text-primary-300',
  gold: 'bg-accent-100 text-accent-700 dark:bg-accent-500/15 dark:text-accent-300',
  success: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300',
  danger: 'bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-300',
  info: 'bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300',
  neutral: 'bg-gray-100 text-gray-600 dark:bg-dark-surface-2 dark:text-slate-300',
};

const ACCENT_BAR: Record<StatTone, string> = {
  brand: 'from-primary-400 to-primary-600',
  gold: 'from-accent-400 to-accent-600',
  success: 'from-emerald-400 to-emerald-600',
  danger: 'from-red-400 to-red-600',
  info: 'from-sky-400 to-sky-600',
  neutral: 'from-gray-300 to-gray-400',
};

/** Premium KPI tile: label + large value + optional trend chip and an icon
 *  chip. A thin gradient accent bar at the top ties it to its tone while
 *  staying on-brand. */
export function StatCard({
  label,
  value,
  icon: Icon,
  delta,
  deltaDirection,
  hint,
  tone = 'brand',
  className,
  onClick,
  index = 0,
}: StatCardProps) {
  const dir =
    deltaDirection ??
    (delta ? (delta.trim().startsWith('-') ? 'down' : 'up') : 'neutral');

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: index * 0.06 }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={cn(
        'card-soft relative overflow-hidden p-5',
        onClick && 'card is-hoverable cursor-pointer',
        className
      )}
    >
      {/* tone accent bar */}
      <span
        className={cn(
          'absolute inset-x-0 top-0 h-1 bg-gradient-to-r',
          ACCENT_BAR[tone]
        )}
      />
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
          {label}
        </p>
        {Icon && (
          <span className={cn('grid h-9 w-9 shrink-0 place-items-center rounded-xl', ICON_TONE[tone])}>
            <Icon className="h-[18px] w-[18px]" />
          </span>
        )}
      </div>

      <p className="mt-3 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
        {value}
      </p>

      <div className="mt-2 flex items-center gap-2">
        {delta && (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-bold',
              dir === 'up' && 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
              dir === 'down' && 'bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300',
              dir === 'neutral' && 'bg-gray-100 text-gray-600 dark:bg-dark-surface-2 dark:text-slate-300'
            )}
          >
            {dir === 'up' && <ArrowUpRight className="h-3 w-3" />}
            {dir === 'down' && <ArrowDownRight className="h-3 w-3" />}
            {delta}
          </span>
        )}
        {hint && <span className="text-[11px] text-gray-400 dark:text-slate-500">{hint}</span>}
      </div>
    </motion.div>
  );
}
