import React, { useId } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      fullWidth = true,
      disabled,
      className = '',
      id: customId,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = customId || generatedId;

    const baseInputStyles =
      'w-full bg-white border text-sm text-[#0F172A] placeholder-[#94A3B8] rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 disabled:bg-slate-50 disabled:text-[#94A3B8] disabled:cursor-not-allowed';

    const borderStyles = error
      ? 'border-[#DC2626] focus:border-[#DC2626] focus:ring-[#DC2626]/20'
      : 'border-[#E2E8F0] focus:border-[#2563EB] focus:ring-[#2563EB]/20';

    const paddingStyles = `${leftIcon ? 'pl-10' : 'pl-3.5'} ${rightIcon ? 'pr-10' : 'pr-3.5'} py-2.5`;

    return (
      <div className={`${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-[#0F172A] uppercase tracking-wider mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 text-[#64748B] pointer-events-none flex items-center">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
            className={`${baseInputStyles} ${borderStyles} ${paddingStyles} ${className}`}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3.5 text-[#64748B] pointer-events-none flex items-center">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p id={`${inputId}-error`} className="mt-1 text-xs text-[#DC2626] font-medium">
            {error}
          </p>
        )}
        {!error && helperText && (
          <p id={`${inputId}-helper`} className="mt-1 text-xs text-[#64748B]">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
