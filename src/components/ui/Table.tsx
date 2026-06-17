import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface TableProps {
  children: ReactNode;
  className?: string;
  /** Wrap the table in a soft, rounded, bordered panel. */
  contained?: boolean;
}

export function Table({ children, className, contained }: TableProps) {
  return (
    <div
      className={cn(
        'w-full min-w-0 overflow-x-auto thin-scrollbar',
        contained && 'card-soft'
      )}
    >
      <table className={cn('w-full min-w-max border-collapse text-sm', className)}>
        {children}
      </table>
    </div>
  );
}

interface TableHeaderProps {
  children: ReactNode;
  className?: string;
  /** Keep the header visible while the body scrolls. */
  sticky?: boolean;
}

/** SpareZone-style header: no fill, just a bottom border via the header row. */
export function TableHeader({ children, className, sticky }: TableHeaderProps) {
  return (
    <thead
      className={cn(
        sticky && 'sticky top-0 z-10 bg-white/90 backdrop-blur-sm dark:bg-dark-surface/90',
        className
      )}
    >
      {children}
    </thead>
  );
}

interface TableRowProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function TableRow({ children, className, onClick }: TableRowProps) {
  return (
    <tr
      className={cn(
        'border-b transition-colors duration-150',
        'border-gray-100 last:border-0 hover:bg-gray-50/70',
        'dark:border-dark-border dark:hover:bg-dark-surface-2/50',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

interface TableHeadProps {
  children: ReactNode;
  className?: string;
}

export function TableHead({ children, className }: TableHeadProps) {
  return (
    <th
      scope="col"
      className={cn(
        'whitespace-nowrap px-4 py-3 text-start align-middle text-xs font-semibold uppercase tracking-wide',
        'text-gray-400 dark:text-slate-500',
        className
      )}
    >
      {children}
    </th>
  );
}

interface TableBodyProps {
  children: ReactNode;
  className?: string;
}

export function TableBody({ children, className }: TableBodyProps) {
  return (
    <tbody className={cn('bg-white dark:bg-dark-surface', className)}>
      {children}
    </tbody>
  );
}

interface TableCellProps {
  children: ReactNode;
  className?: string;
  colSpan?: number;
}

export function TableCell({ children, className, colSpan }: TableCellProps) {
  return (
    <td
      colSpan={colSpan}
      className={cn(
        'px-4 py-3 align-middle text-sm break-words',
        'text-gray-700 dark:text-gray-100',
        className
      )}
    >
      {children}
    </td>
  );
}

interface TableEmptyProps {
  colSpan: number;
  children: ReactNode;
  className?: string;
}

/** Full-width empty row for tables with no data. */
export function TableEmpty({ colSpan, children, className }: TableEmptyProps) {
  return (
    <tr>
      <td colSpan={colSpan} className={cn('px-4 py-12 text-center text-gray-400 dark:text-slate-500', className)}>
        {children}
      </td>
    </tr>
  );
}
