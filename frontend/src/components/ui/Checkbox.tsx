import React, { useId } from 'react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  description?: string;
  error?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, error, disabled, className = '', id: customId, ...props }, ref) => {
    const generatedId = useId();
    const checkboxId = customId || generatedId;

    return (
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            ref={ref}
            id={checkboxId}
            type="checkbox"
            disabled={disabled}
            aria-invalid={!!error}
            className={`w-4 h-4 rounded border-[#E2E8F0] text-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors ${className}`}
            {...props}
          />
        </div>
        {(label || description) && (
          <div className="ml-3 text-xs leading-5">
            {label && (
              <label
                htmlFor={checkboxId}
                className={`font-medium select-none ${
                  disabled ? 'text-[#94A3B8] cursor-not-allowed' : 'text-[#0F172A] cursor-pointer'
                }`}
              >
                {label}
              </label>
            )}
            {description && <p className="text-[#64748B] text-xs">{description}</p>}
            {error && <p className="text-[#DC2626] font-medium text-xs mt-0.5">{error}</p>}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
