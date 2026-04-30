import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface TableProps {
  children: ReactNode;
  className?: string;
}

export function Table({ children, className }: TableProps) {
  return (
    <div className="w-full min-w-0 overflow-x-auto">
      <table className={cn('w-full min-w-max table-auto border-collapse', className)}>
        {children}
      </table>
    </div>
  );
}

interface TableHeaderProps {
  children: ReactNode;
  className?: string;
}

export function TableHeader({ children, className }: TableHeaderProps) {
  return (
    <thead
      className={cn(
        'bg-gray-50',
        'dark:bg-dark-surface-2',
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
        'border-b transition-colors',
        'border-gray-200 hover:bg-gray-50',
        'dark:border-dark-border dark:hover:bg-dark-surface-2',
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
      className={cn(
        'px-4 py-3 text-left align-top text-xs font-medium uppercase tracking-wider',
        'text-gray-700 dark:text-gray-300',
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
    <tbody
      className={cn(
        'divide-y bg-white',
        'divide-gray-200',
        'dark:bg-dark-surface dark:divide-dark-border',
        className
      )}
    >
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
        'px-4 py-3 align-top text-sm break-words whitespace-normal',
        'text-gray-900 dark:text-gray-100',
        className
      )}
    >
      {children}
    </td>
  );
}
