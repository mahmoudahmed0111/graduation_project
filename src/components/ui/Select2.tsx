import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, Search, GraduationCap } from 'lucide-react';

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
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  const filteredOptions = searchable && searchTerm
    ? options.filter(opt =>
        opt.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Focus search input when opened
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
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

  return (
    <div className={cn('w-full', className)} ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'input w-full text-left flex items-center justify-between gap-3 py-2.5 px-4',
            'hover:border-primary-400 transition-all duration-200',
            error && 'border-red-500 focus:ring-red-500',
            isOpen && 'ring-2 ring-primary-500 border-primary-500'
          )}
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {selectedOption ? (
              <>
                {selectedOption.icon && (
                  <span className="text-primary-500 flex-shrink-0">
                    {selectedOption.icon}
                  </span>
                )}
                <span className="truncate font-medium text-gray-900">
                  {selectedOption.label}
                </span>
              </>
            ) : (
              <span className="text-gray-400 truncate">{placeholder}</span>
            )}
          </div>
          <ChevronDown
            className={cn(
              'h-5 w-5 text-gray-400 flex-shrink-0 transition-transform duration-200',
              isOpen && 'rotate-180 text-primary-500'
            )}
          />
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden animate-fade-in">
            {searchable && (
              <div className="p-3 border-b border-gray-100 bg-gray-50">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>
            )}
            <div className="max-h-60 overflow-auto">
              {filteredOptions.length === 0 ? (
                <div className="px-4 py-8 text-center text-gray-500 text-sm">
                  No options found
                </div>
              ) : (
                filteredOptions.map((option) => {
                  const isSelected = value === option.value;
                  return (
                    <div
                      key={option.value}
                      onClick={() => handleSelect(option.value)}
                      className={cn(
                        'px-4 py-3 cursor-pointer transition-all duration-150 flex items-center gap-3',
                        'hover:bg-primary-50 hover:text-primary-700',
                        isSelected && 'bg-primary-50 text-primary-700 font-medium'
                      )}
                    >
                      {option.icon && (
                        <span className={cn(
                          'flex-shrink-0',
                          isSelected ? 'text-primary-600' : 'text-gray-400'
                        )}>
                          {option.icon}
                        </span>
                      )}
                      <span className="flex-1">{option.label}</span>
                      {isSelected && (
                        <span className="text-primary-600 font-bold">✓</span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600 animate-fade-in">{error}</p>
      )}
    </div>
  );
}

