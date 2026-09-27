import { createContext, useContext, forwardRef } from 'react';
import ErrorMessage from './ErrorMessage';

const InputContext = createContext({});

const InputRoot = forwardRef(
  (
    {
      id,
      name,
      label,
      error,
      helpText,
      required = false,
      children,
      className = '',
      ...props
    },
    ref
  ) => {
    const inputId = id || name;
    const errorId = error ? `${inputId}-error` : undefined;
    const helpId = helpText ? `${inputId}-help` : undefined;

    // If children are passed, use Compound Component pattern
    if (children) {
      return (
        <InputContext.Provider value={{ inputId, errorId, helpId, required, error }}>
          <div className={`flex flex-col mb-4 ${className}`}>{children}</div>
        </InputContext.Provider>
      );
    }

    // Otherwise, render standard single-call component
    return (
      <div className={`flex flex-col mb-4 ${className}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-semibold text-slate-700 mb-1.5"
          >
            {label}
            {required && <span className="text-brand-red ml-1" aria-hidden="true">*</span>}
            {required && <span className="sr-only"> (required)</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          name={name}
          required={required}
          aria-invalid={!!error}
          aria-describedby={[errorId, helpId].filter(Boolean).join(' ') || undefined}
          className={`w-full min-h-touch px-3.5 py-2.5 text-sm rounded-lg border bg-white text-slate-900 shadow-sm transition-all duration-150 focus:outline-none focus:ring-2 ${
            error
              ? 'border-brand-red focus:border-brand-red focus:ring-red-100'
              : 'border-slate-300 hover:border-slate-400 focus:border-brand-blue focus:ring-blue-100'
          }`}
          {...props}
        />
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

InputRoot.displayName = 'Input';

// Compound sub-components
const Label = ({ children, className = '', ...props }) => {
  const { inputId, required } = useContext(InputContext);
  return (
    <label
      htmlFor={inputId}
      className={`block text-sm font-semibold text-slate-700 mb-1.5 ${className}`}
      {...props}
    >
      {children}
      {required && <span className="text-brand-red ml-1" aria-hidden="true">*</span>}
      {required && <span className="sr-only"> (required)</span>}
    </label>
  );
};

const Field = forwardRef(({ className = '', ...props }, ref) => {
  const { inputId, errorId, helpId, required, error } = useContext(InputContext);
  return (
    <input
      ref={ref}
      id={inputId}
      required={required}
      aria-invalid={!!error}
      aria-describedby={[errorId, helpId].filter(Boolean).join(' ') || undefined}
      className={`w-full min-h-touch px-3.5 py-2.5 text-sm rounded-lg border bg-white text-slate-900 shadow-sm transition-all duration-150 focus:outline-none focus:ring-2 ${
        error
          ? 'border-brand-red focus:border-brand-red focus:ring-red-100'
          : 'border-slate-300 hover:border-slate-400 focus:border-brand-blue focus:ring-blue-100'
      } ${className}`}
      {...props}
    />
  );
});

Field.displayName = 'InputField';

const Error = ({ children, className = '', ...props }) => {
  const { errorId, error } = useContext(InputContext);
  const msg = children || error;
  if (!msg) return null;
  return <ErrorMessage id={errorId} message={msg} className={className} {...props} />;
};

const HelpText = ({ children, className = '', ...props }) => {
  const { helpId } = useContext(InputContext);
  if (!children) return null;
  return (
    <p id={helpId} className={`text-xs text-slate-500 mt-1 ${className}`} {...props}>
      {children}
    </p>
  );
};

InputRoot.Label = Label;
InputRoot.Field = Field;
InputRoot.Error = Error;
InputRoot.HelpText = HelpText;

export default InputRoot;
