import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({ currentPage, totalPages, onPageChange, className }: PaginationProps) {
  const visiblePages = getVisiblePages(currentPage, totalPages);

  const navBtn =
    'grid h-8 w-8 place-items-center rounded-md border border-gray-200 text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-40 dark:border-dark-border dark:text-slate-300 dark:hover:bg-dark-surface-2';

  return (
    <div className={cn('flex items-center justify-center gap-1', className)}>
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={navBtn}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4 rtl:-scale-x-100" />
      </button>

      {visiblePages.map((page, index) => {
        if (page === '...') {
          return (
            <span key={`ellipsis-${index}`} className="px-1 text-gray-400 dark:text-slate-500">
              …
            </span>
          );
        }

        const isActive = currentPage === page;
        return (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page as number)}
            className={cn(
              'h-8 min-w-8 rounded-md px-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary-600 text-white dark:bg-accent-500 dark:text-primary-900'
                : 'border border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-dark-border dark:text-slate-300 dark:hover:bg-dark-surface-2'
            )}
          >
            {page}
          </button>
        );
      })}

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={navBtn}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4 rtl:-scale-x-100" />
      </button>
    </div>
  );
}

function getVisiblePages(currentPage: number, totalPages: number): (number | string)[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 4, '...', totalPages];
  }

  if (currentPage >= totalPages - 2) {
    return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
}

