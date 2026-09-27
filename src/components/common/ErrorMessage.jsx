import { AlertCircle } from 'lucide-react';

export const ErrorMessage = ({ message, id, className = '' }) => {
  if (!message) return null;

  return (
    <div
      id={id}
      role="alert"
      aria-live="polite"
      className={`flex items-center gap-1.5 text-xs text-brand-red font-medium mt-1.5 animate-fade-in ${className}`}
    >
      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
};

export default ErrorMessage;
