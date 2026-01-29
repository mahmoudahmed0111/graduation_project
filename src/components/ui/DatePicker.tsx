import { forwardRef } from 'react';
import ReactDatePicker from 'react-datepicker';
import { cn } from '@/lib/utils';

interface DatePickerProps {
  label?: string;
  error?: string;
  helperText?: string;
  selected?: Date | null;
  onChange: (date: Date | null) => void;
  className?: string;
  placeholderText?: string;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
}

export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  ({ label, error, helperText, selected, onChange, className, placeholderText, minDate, maxDate, disabled }, _ref) => {
    const inputId = `datepicker-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <ReactDatePicker
          id={inputId}
          selected={selected}
          onChange={onChange}
          className={cn('input', error && 'border-red-500 focus:ring-red-500', className)}
          placeholderText={placeholderText}
          minDate={minDate}
          maxDate={maxDate}
          disabled={disabled}
          dateFormat="dd/MM/yyyy"
        />
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

DatePicker.displayName = 'DatePicker';

