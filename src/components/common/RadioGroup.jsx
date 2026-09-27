import { forwardRef } from 'react';
import ErrorMessage from './ErrorMessage';

const RadioGroup = forwardRef(
  (
    {
      id,
      name,
      label,
      options = [],
      value,
      onChange,
      error,
      helpText,
      required = false,
      layout = 'vertical', // 'vertical' | 'horizontal' | 'cards'
      className = '',
      ...props
    },
    ref
  ) => {
    const groupId = id || name;
    const errorId = error ? `${groupId}-error` : undefined;
    const helpId = helpText ? `${groupId}-help` : undefined;

    return (
      <fieldset className={`mb-4 ${className}`} aria-invalid={!!error}>
        {label && (
          <legend className="block text-sm font-semibold text-slate-700 mb-2">
            {label}
            {required && <span className="text-brand-red ml-1" aria-hidden="true">*</span>}
            {required && <span className="sr-only"> (required)</span>}
          </legend>
        )}

        <div
          role="radiogroup"
          aria-describedby={[errorId, helpId].filter(Boolean).join(' ') || undefined}
          className={
            layout === 'cards'
              ? 'grid grid-cols-1 sm:grid-cols-3 gap-3'
              : layout === 'horizontal'
              ? 'flex flex-wrap gap-4'
              : 'flex flex-col gap-2.5'
          }
        >
          {options.map((opt) => {
            const optVal = typeof opt === 'object' ? opt.value : opt;
            const optLabel = typeof opt === 'object' ? opt.label : opt;
            const optDesc = typeof opt === 'object' ? opt.description : null;
            const optBadge = typeof opt === 'object' ? opt.badge : null;
            const optDisabled = typeof opt === 'object' ? opt.disabled : false;
            const isChecked = String(value) === String(optVal);

            if (layout === 'cards') {
              return (
                <label
                  key={optVal}
                  className={`relative flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all duration-150 ${
                    optDisabled
                      ? 'opacity-50 cursor-not-allowed bg-slate-50 border-slate-200'
                      : isChecked
                      ? 'border-brand-blue bg-blue-50/50 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    ref={ref}
                    name={name}
                    value={optVal}
                    checked={isChecked}
                    disabled={optDisabled}
                    onChange={onChange}
                    className="sr-only"
                    {...props}
                  />
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm text-slate-900">{optLabel}</span>
                    {optBadge && (
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-brand-blue/10 text-brand-blue px-2 py-0.5 rounded-full">
                        {optBadge}
                      </span>
                    )}
                  </div>
                  {optDesc && <p className="text-xs text-slate-500 mt-1">{optDesc}</p>}
                </label>
              );
            }

            return (
              <label
                key={optVal}
                className={`flex items-center gap-2.5 min-h-touch py-1 cursor-pointer select-none text-sm text-slate-800 ${
                  optDisabled ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <input
                  type="radio"
                  ref={ref}
                  name={name}
                  value={optVal}
                  checked={isChecked}
                  disabled={optDisabled}
                  onChange={onChange}
                  className="w-4 h-4 text-brand-blue border-slate-300 focus:ring-brand-blue"
                  {...props}
                />
                <span className="font-medium">{optLabel}</span>
                {optBadge && (
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                    {optBadge}
                  </span>
                )}
              </label>
            );
          })}
        </div>

        {helpText && !error && (
          <p id={helpId} className="text-xs text-slate-500 mt-1.5">
            {helpText}
          </p>
        )}
        {error && <ErrorMessage id={errorId} message={error} />}
      </fieldset>
    );
  }
);

RadioGroup.displayName = 'RadioGroup';

export default RadioGroup;
