import { ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, SlidersHorizontal, ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilterBarProps {
  /** Search box value + handler (search is always visible). */
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  /** The filter controls (e.g. Select2s). Rendered in a collapsible row that is
   *  hidden by default and toggled by the "Filters" button. Omit to hide the
   *  button entirely (search-only pages). */
  filters?: ReactNode;
  /** Number of filters currently applied — shown as a badge on the button. */
  activeFilterCount?: number;
  /** Optional callback to clear all filters (renders a "Clear" link when > 0). */
  onClearFilters?: () => void;
  /** Right-aligned actions on the search row (e.g. a "New" button). */
  actions?: ReactNode;
  /** Open the filters row initially. */
  defaultOpen?: boolean;
  /** Tailwind grid columns for the filters row. */
  filtersClassName?: string;
  className?: string;
}

/**
 * Standard list-page toolbar: a search box that is always visible, a "Filters"
 * toggle button beside it, and a collapsible filters row that drops below the
 * search row when opened. Used across all dashboard list pages for a single,
 * consistent search/filter experience.
 */
export function FilterBar({
  search,
  onSearchChange,
  searchPlaceholder,
  filters,
  activeFilterCount = 0,
  onClearFilters,
  actions,
  defaultOpen = false,
  filtersClassName,
  className,
}: FilterBarProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(defaultOpen || activeFilterCount > 0);

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search (always visible) — capped to ~half width — borderless icon + input via flex (RTL-safe) */}
        <div className="relative w-full sm:max-w-md sm:flex-1">
          <div className="flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-3.5 transition-colors focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20 dark:border-dark-border dark:bg-dark-surface dark:focus-within:border-accent-400 dark:focus-within:ring-accent-400/30">
            <Search className="h-4 w-4 shrink-0 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder ?? t('common.search')}
              className="w-full min-w-0 border-0 bg-transparent py-2.5 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:ring-0 dark:text-white dark:placeholder:text-slate-500"
              style={{ boxShadow: 'none', backgroundColor: 'transparent' }}
            />
            {search && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                aria-label="Clear search"
                className="shrink-0 rounded-md p-0.5 text-gray-400 transition-colors hover:text-gray-700 dark:hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Controls cluster (filters toggle + actions) on the opposite side */}
        {(filters || actions) && (
          <div className="flex flex-wrap items-center gap-2.5">
            {filters && (
              <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className={cn(
                  'inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold transition-colors',
                  open || activeFilterCount > 0
                    ? 'border-primary-300 bg-primary-50 text-primary-700 dark:border-accent-400/40 dark:bg-accent-500/10 dark:text-accent-300'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-dark-border dark:bg-dark-surface dark:text-slate-300 dark:hover:bg-dark-surface-2'
                )}
                aria-expanded={open}
              >
                <SlidersHorizontal className="h-4 w-4" />
                {t('common.filters')}
                {activeFilterCount > 0 && (
                  <span className="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-primary-600 px-1.5 text-[11px] font-bold text-white dark:bg-accent-500 dark:text-primary-900">
                    {activeFilterCount}
                  </span>
                )}
                <ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} />
              </button>
            )}
            {actions}
          </div>
        )}
      </div>

      {/* Collapsible filters row */}
      {filters && open && (
        <div className="surface-navbar animate-fade-in rounded-xl border border-gray-200 p-4 dark:border-dark-border">
          {(activeFilterCount > 0 && onClearFilters) && (
            <div className="mb-3 flex justify-end">
              <button
                type="button"
                onClick={onClearFilters}
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 hover:underline dark:text-accent-300"
              >
                <X className="h-3.5 w-3.5" /> {t('common.clearFilters')}
              </button>
            </div>
          )}
          <div className={cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4', filtersClassName)}>
            {filters}
          </div>
        </div>
      )}
    </div>
  );
}
