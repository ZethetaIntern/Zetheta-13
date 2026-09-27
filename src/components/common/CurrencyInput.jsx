import { forwardRef, useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import ErrorMessage from './ErrorMessage';
import { formatINR } from '../../utils/emiCalculator';

const CurrencyInput = forwardRef(
  (
    {
      id,
      name,
      label,
      value,
      onChange,
      onFocus,
      onBlur,
      error,
      helpText,
      required = false,
      placeholder = '0',
      min,
      max,
      step = 10000,
      showSlider = false,
      quickAmounts = [],
      maskable = false, // Section B4.4 income masking
      className = '',
      ...props
    },
    ref
  ) => {
    const inputId = id || name;
    const errorId = error ? `${inputId}-error` : undefined;
    const helpId = helpText ? `${inputId}-help` : undefined;

    const [displayVal, setDisplayVal] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [showPlain, setShowPlain] = useState(!maskable);

    useEffect(() => {
      if (value !== undefined && value !== null && value !== '') {
        setDisplayVal(formatINR(value));
      } else {
        setDisplayVal('');
      }
    }, [value]);

    const handleTextChange = (e) => {
      const raw = e.target.value.replace(/[^0-9]/g, '');
      if (raw === '') {
        setDisplayVal('');
        if (onChange) onChange({ target: { name, value: '' } });
      } else {
        const num = parseInt(raw, 10);
        setDisplayVal(formatINR(num));
        if (onChange) onChange({ target: { name, value: num } });
      }
    };

    const handleSliderChange = (e) => {
      const num = parseInt(e.target.value, 10);
      setDisplayVal(formatINR(num));
      if (onChange) onChange({ target: { name, value: num } });
    };

    const handleChipClick = (amt) => {
      setDisplayVal(formatINR(amt));
      if (onChange) onChange({ target: { name, value: amt } });
    };

    const handleFocus = (e) => {
      setIsFocused(true);
      if (onFocus) onFocus(e);
    };

    const handleBlur = (e) => {
      setIsFocused(false);
      if (onBlur) onBlur(e);
    };

    const getRenderedValue = () => {
      if (!maskable || isFocused || showPlain) {
        return displayVal;
      }
      if (!displayVal) return '';
      if (displayVal.length <= 4) return displayVal;
      return '•'.repeat(Math.max(1, displayVal.length - 4)) + displayVal.slice(-4);
    };

    return (
      <div className={`flex flex-col mb-4 ${className}`}>
        {label && (
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor={inputId}
              className="block text-sm font-semibold text-slate-700"
            >
              {label}
              {required && <span className="text-brand-red ml-1" aria-hidden="true">*</span>}
              {required && <span className="sr-only"> (required)</span>}
            </label>
            {maskable && displayVal && (
              <span className="text-[10px] text-slate-400 font-medium">PII Protected</span>
            )}
          </div>
        )}

        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500 font-medium text-sm">
            ₹
          </div>
          <input
            ref={ref}
            id={inputId}
            name={name}
            type="text"
            inputMode="numeric"
            value={getRenderedValue()}
            onChange={handleTextChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            required={required}
            aria-invalid={!!error}
            aria-describedby={[errorId, helpId].filter(Boolean).join(' ') || undefined}
            className={`w-full min-h-touch pl-8 ${
              maskable ? 'pr-11' : 'pr-3.5'
            } py-2.5 text-sm font-medium rounded-lg border bg-white text-slate-900 shadow-sm transition-all duration-150 focus:outline-none focus:ring-2 ${
              error
                ? 'border-brand-red focus:border-brand-red focus:ring-red-100'
                : 'border-slate-300 hover:border-slate-400 focus:border-brand-blue focus:ring-blue-100'
            }`}
            {...props}
          />
          {maskable && (
            <button
              type="button"
              onClick={() => setShowPlain(!showPlain)}
              aria-label={showPlain ? 'Hide income' : 'Show income'}
              className="absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-400 hover:text-slate-600 focus:outline-none min-h-touch"
            >
              {showPlain ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}
        </div>

        {showSlider && min !== undefined && max !== undefined && (
          <div className="mt-3 px-1">
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={Number(value) || min}
              onChange={handleSliderChange}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-blue"
              aria-label={`${label || 'Amount'} slider`}
            />
            <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-medium">
              <span>₹ {formatINR(min)}</span>
              <span>₹ {formatINR(max)}</span>
            </div>
          </div>
        )}

        {quickAmounts.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {quickAmounts.map((amt) => (
              <button
                type="button"
                key={amt}
                onClick={() => handleChipClick(amt)}
                className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${
                  Number(value) === amt
                    ? 'bg-brand-blue text-white border-brand-blue font-semibold'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                ₹ {formatINR(amt)}
              </button>
            ))}
          </div>
        )}

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

CurrencyInput.displayName = 'CurrencyInput';

export default CurrencyInput;
