import { useEffect, useRef, type InputHTMLAttributes } from 'react';
import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type BulkBarProps = {
  selectedCount: number;
  onBulkDelete: () => void;
  className?: string;
};

export function AdminIndexBulkBar({ selectedCount, onBulkDelete, className }: BulkBarProps) {
  if (selectedCount === 0) return null;
  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-3 rounded-xl border border-accent/30 bg-accent/5 px-4 py-3 text-sm dark:bg-accent/10',
        className
      )}
    >
      <span className="text-gray-700 dark:text-gray-200">{selectedCount} selected</span>
      <button
        type="button"
        onClick={onBulkDelete}
        className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-red-700 hover:bg-red-100 dark:border-red-500/40 dark:bg-red-500/15 dark:text-red-200 dark:hover:bg-red-500/25"
      >
        <Trash2 className="h-4 w-4 shrink-0" />
        Delete selected
      </button>
    </div>
  );
}

type CbProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'ref'> & {
  indeterminate?: boolean;
};

export function IndeterminateCheckbox({ indeterminate, className, ...rest }: CbProps) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = Boolean(indeterminate);
  }, [indeterminate]);
  return (
    <input
      ref={ref}
      type="checkbox"
      className={cn('h-4 w-4 rounded border-gray-300 text-accent', className)}
      {...rest}
    />
  );
}
