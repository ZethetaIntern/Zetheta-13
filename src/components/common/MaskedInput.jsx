import { forwardRef, useState } from 'react';
import ErrorMessage from './ErrorMessage';
import { Eye, EyeOff, CheckCircle2, Loader2 } from 'lucide-react';

const MaskedInput = forwardRef(
  (
    {
      id,
      name,
      label,
      value = '',
      onChange,
      onBlur,
      maskType = 'pan', // 'pan' | 'aadhaar' | 'general'
      error,
      helpText,
      required = false,
      isVerifying = false,
      isVerified = false,
      className = '',
      ...props
    },
    ref
  ) => {
    const inputId = id || name;
    const errorId = error ? `${inputId}-error` : undefined;
    const helpId = helpText ? `${inputId}-help` : undefined;

    const [isFocused, setIsFocused] = useState(false);
    const [showPlain, setShowPlain] = useState(false);

    // Format value according to mask rule
    const getMaskedDisplay = (val) => {
      if (!val) return '';
      const str = String(val);

      if (maskType === 'pan') {
        // Show last 4 characters, mask previous (e.g. ••••••999A)
        if (str.length <= 4) return str;
        return '•'.repeat(str.length - 4) + str.slice(-4);
      }

      if (maskType === 'aadhaar') {
        // Aadhaar: •••• •••• 1234
        const clean = str.replace(/\s+/g, '');
        if (clean.length <= 4) return clean;
        const last4 = clean.slice(-4);
        return `•••• •••• ${last4}`;
      }

      // General fallback: show last 4 chars
      if (str.length <= 4) return str;
      return '•'.repeat(str.length - 4) + str.slice(-4);
    };

    const handleFocus = (e) => {
      setIsFocused(true);
      if (props.onFocus) props.onFocus(e);
    };

    const handleBlurEvent = (e) => {
      if (onBlur) onBlur(e);
      setIsFocused(false);
    };

    const displayValue = isFocused || showPlain ? value : getMaskedDisplay(value);

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
            {isVerified && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-green bg-brand-green/10 px-2 py-0.5 rounded-full animate-fade-in">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Verified
              </span>
            )}
            {isVerifying && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-brand-blue bg-blue-50 px-2 py-0.5 rounded-full animate-fade-in">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Verifying...
              </span>
            )}
          </div>
        )}

        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            name={name}
            value={displayValue}
            onChange={onChange}
            onFocus={handleFocus}
            onBlur={handleBlurEvent}
            required={required}
            aria-invalid={!!error}
            aria-describedby={[errorId, helpId].filter(Boolean).join(' ') || undefined}
            className={`w-full min-h-touch px-3.5 py-2.5 pr-11 text-sm rounded-lg border font-mono tracking-wider bg-white text-slate-900 shadow-sm transition-all duration-150 focus:outline-none focus:ring-2 ${
              error
                ? 'border-brand-red focus:border-brand-red focus:ring-red-100'
                : isVerified
                ? 'border-brand-green focus:border-brand-green focus:ring-green-100'
                : 'border-slate-300 hover:border-slate-400 focus:border-brand-blue focus:ring-blue-100'
            }`}
            {...props}
          />
          <button
            type="button"
            onClick={() => setShowPlain(!showPlain)}
            aria-label={showPlain ? 'Hide masked characters' : 'Show masked characters'}
            className="absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-400 hover:text-slate-600 focus:outline-none min-h-touch"
          >
            {showPlain ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
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

MaskedInput.displayName = 'MaskedInput';

export default MaskedInput;
