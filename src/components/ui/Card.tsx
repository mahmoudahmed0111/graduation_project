import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  /** Lift + deepen shadow on hover (premium, GPU-friendly). */
  hoverable?: boolean;
  /** Play the enter animation on mount. */
  animate?: boolean;
  /** Remove the default p-6 padding (e.g. when wrapping a full-bleed table). */
  noPadding?: boolean;
  /** Render with NO card chrome (no border / shadow / background / padding) —
   *  a plain container, so the content (toolbar + table) sits flush on the page. */
  bare?: boolean;
}

export function Card({
  children,
  className,
  onClick,
  hoverable,
  animate,
  noPadding,
  bare,
}: CardProps) {
  return (
    <div
      className={cn(
        bare ? 'space-y-4' : 'card',
        !bare && noPadding && '!p-0',
        !bare && (hoverable || onClick) && 'is-hoverable cursor-default',
        onClick && 'cursor-pointer',
        animate && 'animate-fade-in-up',
        className
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return <div className={cn('mb-4', className)}>{children}</div>;
}

interface CardTitleProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function CardTitle({ children, className, style }: CardTitleProps) {
  return (
    <h3
      className={cn('font-display text-base font-bold tracking-tight text-gray-900 dark:text-white', className)}
      style={style}
    >
      {children}
    </h3>
  );
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children, className }: CardContentProps) {
  return (
    <div className={cn('text-gray-600 dark:text-slate-300', className)}>{children}</div>
  );
}
