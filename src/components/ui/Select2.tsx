import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { ChevronDown, Search } from 'lucide-react';

interface Select2Option {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface Select2Props {
  label?: string;
  options: Select2Option[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  className?: string;
  searchable?: boolean;
}

type MenuRect = { top: number; left: number; width: number };

export function Select2({
  label,
  options,
  value,
  onChange,
  error,
  placeholder = 'Select an option...',
  className,
  searchable = true,
}: Select2Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [menuRect, setMenuRect] = useState<MenuRect | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions =
    searchable && searchTerm
      ? options.filter((opt) => opt.label.toLowerCase().includes(searchTerm.toLowerCase()))
      : options;

  useLayoutEffect(() => {
    if (!isOpen) {
      setMenuRect(null);
      return;
    }
    const sync = () => {
      if (!buttonRef.current) return;
      const r = buttonRef.current.getBoundingClientRect();
      setMenuRect({ top: r.bottom + 8, left: r.left, width: r.width });
    };
    sync();
    window.addEventListener('resize', sync);
    window.addEventListener('scroll', sync, true);
    return () => {
      window.removeEventListener('resize', sync);
      window.removeEventListener('scroll', sync, true);
    };
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const t = event.target as Node;
      if (containerRef.current?.contains(t)) return;
      if (menuRef.current?.contains(t)) return;
      setIsOpen(false);
      setSearchTerm('');
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 0);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  const menuContent =
    isOpen &&
    menuRect &&
    createPortal(
      <div
        ref={menuRef}
        className="fixed z-[200] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl animate-fade-in dark:border-slate-600 dark:bg-slate-900"
        style={{ top: menuRect.top, left: menuRect.left, width: menuRect.width }}
        role="listbox"
      >
        {searchable && (
          <div className="border-b border-gray-100 bg-gray-50 p-3 dark:border-slate-700 dark:bg-slate-800/80">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-4 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-slate-600 dark:bg-slate-900"
              />
            </div>
          </div>
        )}
        <div className="max-h-60 overflow-auto">
          {filteredOptions.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">No options found</div>
          ) : (
            filteredOptions.map((option) => {
              const isSelected = value === option.value;
              return (
                <div
                  key={option.value}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(option.value)}
                  className={cn(
                    'flex cursor-pointer items-center gap-3 px-4 py-3 transition-all duration-150',
                    'hover:bg-primary-50 hover:text-primary-700 dark:hover:bg-primary-950/40 dark:hover:text-primary-300',
                    isSelected && 'bg-primary-50 font-medium text-primary-700 dark:bg-primary-950/50 dark:text-primary-300'
                  )}
                >
                  {option.icon && (
                    <span className={cn('flex-shrink-0', isSelected ? 'text-primary-600' : 'text-gray-400')}>
                      {option.icon}
                    </span>
                  )}
                  <span className="flex-1">{option.label}</span>
                  {isSelected && <span className="font-bold text-primary-600">✓</span>}
                </div>
              );
            })
          )}
        </div>
      </div>,
      document.body
    );

  return (
    <div className={cn('w-full', className)} ref={containerRef}>
      {label && (
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      )}
      <div className="relative">
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'input flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left',
            'transition-all duration-200 hover:border-primary-400',
            error && 'border-red-500 focus:ring-red-500',
            isOpen && 'border-primary-500 ring-2 ring-primary-500'
          )}
        >
          <div className="flex min-w-0 flex-1 items-center gap-3">
            {selectedOption ? (
              <>
                {selectedOption.icon && (
                  <span className="flex-shrink-0 text-primary-500">{selectedOption.icon}</span>
                )}
                <span className="truncate font-medium text-gray-900 dark:text-gray-100">{selectedOption.label}</span>
              </>
            ) : (
              <span className="truncate text-gray-400">{placeholder}</span>
            )}
          </div>
          <ChevronDown
            className={cn(
              'h-5 w-5 flex-shrink-0 text-gray-400 transition-transform duration-200',
              isOpen && 'rotate-180 text-primary-500'
            )}
          />
        </button>
      </div>
      {menuContent}
      {error && <p className="mt-1 animate-fade-in text-sm text-red-600">{error}</p>}
    </div>
  );
}
