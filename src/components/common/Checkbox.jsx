import { forwardRef } from 'react';
import ErrorMessage from './ErrorMessage';

const Checkbox = forwardRef(
  (
    {
      id,
      name,
      label,
      children,
      error,
      helpText,
      required = false,
      className = '',
      ...props
    },
    ref
  ) => {
    const boxId = id || name;
    const errorId = error ? `${boxId}-error` : undefined;
    const helpId = helpText ? `${boxId}-help` : undefined;

    return (
      <div className={`flex flex-col mb-4 ${className}`}>
        <div className="flex items-start gap-3 min-h-touch py-1">
          <div className="flex items-center h-6">
            <input
              type="checkbox"
              ref={ref}
              id={boxId}
              name={name}
              required={required}
              aria-invalid={!!error}
              aria-describedby={[errorId, helpId].filter(Boolean).join(' ') || undefined}
              className={`w-4 h-4 rounded border-slate-300 text-brand-blue focus:ring-brand-blue cursor-pointer transition-colors ${
                error ? 'border-brand-red' : ''
              }`}
              {...props}
            />
          </div>
          <label htmlFor={boxId} className="text-sm font-medium text-slate-700 select-none cursor-pointer leading-relaxed">
            {children || label}
            {required && <span className="text-brand-red ml-1" aria-hidden="true">*</span>}
            {required && <span className="sr-only"> (required)</span>}
          </label>
        </div>

        {helpText && !error && (
          <p id={helpId} className="text-xs text-slate-500 pl-7">
            {helpText}
          </p>
        )}
        {error && <ErrorMessage id={errorId} message={error} className="pl-7" />}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;
