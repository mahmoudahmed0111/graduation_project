import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className, id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            'input transition-all duration-300',
            error && 'border-red-500 focus:ring-red-500',
            // Light mode hover / focus — primary blue.
            'hover:border-primary-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20',
            // Dark mode hover / focus — gold accent (the .input base already
            // sets dark:bg + border + focus, here we add hover & a brighter
            // focus ring for visibility on the navy surface).
            'dark:hover:border-accent-400/60 dark:focus:border-accent-400 dark:focus:ring-accent-400/40',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

