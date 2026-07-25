import React from 'react';
import { Spinner } from './Spinner';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      fullWidth = false,
      leftIcon,
      rightIcon,
      disabled,
      className = '',
      type = 'button',
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed select-none';

    const variantStyles = {
      primary:
        'bg-[#2563EB] hover:bg-[#1D4ED8] text-white focus:ring-[#2563EB]/40 shadow-sm border border-transparent',
      secondary:
        'bg-slate-100 hover:bg-slate-200 text-[#0F172A] focus:ring-slate-400/30 border border-slate-200',
      outline:
        'bg-white hover:bg-slate-50 text-[#0F172A] border border-[#E2E8F0] focus:ring-[#2563EB]/20 shadow-sm',
      ghost:
        'bg-transparent hover:bg-slate-100 text-[#475569] hover:text-[#0F172A] focus:ring-slate-400/20',
      danger:
        'bg-[#DC2626] hover:bg-[#B91C1C] text-white focus:ring-[#DC2626]/40 shadow-sm border border-transparent',
    };

    const sizeStyles = {
      sm: 'px-3 py-1.5 text-xs gap-1.5 min-h-[32px]',
      md: 'px-4 py-2 text-sm gap-2 min-h-[40px]',
      lg: 'px-6 py-2.5 text-base gap-2.5 min-h-[48px]',
    };

    const widthStyle = fullWidth ? 'w-full' : '';

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${className}`}
        {...props}
      >
        {isLoading ? (
          <Spinner size={size === 'lg' ? 'md' : 'sm'} className="text-current" />
        ) : leftIcon ? (
          <span className="inline-flex shrink-0">{leftIcon}</span>
        ) : null}

        <span>{children}</span>

        {!isLoading && rightIcon && (
          <span className="inline-flex shrink-0">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
