import React, { useId } from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helperText,
      fullWidth = true,
      disabled,
      rows = 4,
      className = '',
      id: customId,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const textareaId = customId || generatedId;

    const baseStyles =
      'w-full bg-white border text-sm text-[#0F172A] placeholder-[#94A3B8] rounded-lg transition-colors duration-150 p-3.5 focus:outline-none focus:ring-2 disabled:bg-slate-50 disabled:text-[#94A3B8] disabled:cursor-not-allowed resize-y';

    const borderStyles = error
      ? 'border-[#DC2626] focus:border-[#DC2626] focus:ring-[#DC2626]/20'
      : 'border-[#E2E8F0] focus:border-[#2563EB] focus:ring-[#2563EB]/20';

    return (
      <div className={`${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-xs font-semibold text-[#0F172A] uppercase tracking-wider mb-1.5"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? `${textareaId}-error` : helperText ? `${textareaId}-helper` : undefined}
          className={`${baseStyles} ${borderStyles} ${className}`}
          {...props}
        />
        {error && (
          <p id={`${textareaId}-error`} className="mt-1 text-xs text-[#DC2626] font-medium">
            {error}
          </p>
        )}
        {!error && helperText && (
          <p id={`${textareaId}-helper`} className="mt-1 text-xs text-[#64748B]">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
