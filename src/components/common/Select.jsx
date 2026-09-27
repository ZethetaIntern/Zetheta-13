import { forwardRef } from 'react';
import ErrorMessage from './ErrorMessage';
import { ChevronDown } from 'lucide-react';

const Select = forwardRef(
  (
    {
      id,
      name,
      label,
      options = [],
      placeholder = 'Select an option',
      error,
      helpText,
      required = false,
      className = '',
      ...props
    },
    ref
  ) => {
    const selectId = id || name;
    const errorId = error ? `${selectId}-error` : undefined;
    const helpId = helpText ? `${selectId}-help` : undefined;

    return (
      <div className={`flex flex-col mb-4 ${className}`}>
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-semibold text-slate-700 mb-1.5"
          >
            {label}
            {required && <span className="text-brand-red ml-1" aria-hidden="true">*</span>}
            {required && <span className="sr-only"> (required)</span>}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            name={name}
            required={required}
            aria-invalid={!!error}
            aria-describedby={[errorId, helpId].filter(Boolean).join(' ') || undefined}
            className={`w-full min-h-touch px-3.5 py-2.5 pr-10 text-sm rounded-lg border bg-white text-slate-900 shadow-sm transition-all duration-150 appearance-none focus:outline-none focus:ring-2 cursor-pointer ${
              error
                ? 'border-brand-red focus:border-brand-red focus:ring-red-100'
                : 'border-slate-300 hover:border-slate-400 focus:border-brand-blue focus:ring-blue-100'
            }`}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => {
              const val = typeof opt === 'object' ? opt.value : opt;
              const lbl = typeof opt === 'object' ? opt.label : opt;
              return (
                <option key={val} value={val}>
                  {lbl}
                </option>
              );
            })}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
        {helpText && !error && (
          <p id={helpId} className="text-xs text-slate-500 mt-1">
            {helpText}
          </p>
        )}
        {error && <ErrorMessage id={errorId} message={error} />}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
