import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type BadgeTone =
  | 'neutral'
  | 'brand'
  | 'gold'
  | 'success'
  | 'danger'
  | 'warning'
  | 'info';

interface BadgeProps {
  children: ReactNode;
  tone?: BadgeTone;
  /** Subtle = soft tinted background (default). Solid = filled. */
  variant?: 'subtle' | 'solid' | 'outline';
  size?: 'sm' | 'md';
  className?: string;
  /** Optional leading dot indicator. */
  dot?: boolean;
}

// Tones are built on the Beni-Suef brand palette (navy `primary`, gold
// `accent`) plus a small set of semantic colours that stay readable in both
// light and dark mode.
const SUBTLE: Record<BadgeTone, string> = {
  neutral: 'bg-gray-100 text-gray-700 dark:bg-dark-surface-2 dark:text-slate-300',
  brand: 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300',
  gold: 'bg-accent-100 text-accent-700 dark:bg-accent-500/15 dark:text-accent-300',
  success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  danger: 'bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300',
  warning: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  info: 'bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300',
};

const SOLID: Record<BadgeTone, string> = {
  neutral: 'bg-gray-700 text-white',
  brand: 'bg-primary-500 text-white',
  gold: 'bg-accent-500 text-primary-900',
  success: 'bg-emerald-600 text-white',
  danger: 'bg-red-600 text-white',
  warning: 'bg-amber-500 text-amber-950',
  info: 'bg-sky-600 text-white',
};

const OUTLINE: Record<BadgeTone, string> = {
  neutral: 'border border-gray-300 text-gray-600 dark:border-dark-border dark:text-slate-300',
  brand: 'border border-primary-300 text-primary-700 dark:border-primary-500/40 dark:text-primary-300',
  gold: 'border border-accent-400 text-accent-700 dark:border-accent-500/40 dark:text-accent-300',
  success: 'border border-emerald-300 text-emerald-700 dark:border-emerald-500/40 dark:text-emerald-300',
  danger: 'border border-red-300 text-red-700 dark:border-red-500/40 dark:text-red-300',
  warning: 'border border-amber-300 text-amber-700 dark:border-amber-500/40 dark:text-amber-300',
  info: 'border border-sky-300 text-sky-700 dark:border-sky-500/40 dark:text-sky-300',
};

const DOT: Record<BadgeTone, string> = {
  neutral: 'bg-gray-400',
  brand: 'bg-primary-500',
  gold: 'bg-accent-500',
  success: 'bg-emerald-500',
  danger: 'bg-red-500',
  warning: 'bg-amber-500',
  info: 'bg-sky-500',
};

export function Badge({
  children,
  tone = 'neutral',
  variant = 'subtle',
  size = 'md',
  className,
  dot = false,
}: BadgeProps) {
  const toneClass =
    variant === 'solid' ? SOLID[tone] : variant === 'outline' ? OUTLINE[tone] : SUBTLE[tone];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-semibold whitespace-nowrap',
        size === 'sm' ? 'px-2 py-0.5 text-[10.5px]' : 'px-2.5 py-1 text-xs',
        toneClass,
        className
      )}
    >
      {dot && <span className={cn('h-1.5 w-1.5 rounded-full', DOT[tone])} />}
      {children}
    </span>
  );
}
