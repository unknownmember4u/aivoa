import React from 'react';
import { motion } from 'framer-motion';
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
      onClick,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

    const variantStyles = {
      primary:
        'bg-[#2563EB] hover:bg-[#1D4ED8] text-white focus:ring-[#2563EB]/40 shadow-sm shadow-blue-500/20 border border-transparent',
      secondary:
        'bg-slate-100 hover:bg-slate-200 text-[#0F172A] focus:ring-slate-400/30 border border-slate-200/80',
      outline:
        'bg-white hover:bg-slate-50 text-[#0F172A] border border-[#E2E8F0] hover:border-[#CBD5E1] focus:ring-[#2563EB]/20 shadow-xs',
      ghost:
        'bg-transparent hover:bg-slate-100 text-[#475569] hover:text-[#0F172A] focus:ring-slate-400/20',
      danger:
        'bg-[#EF4444] hover:bg-[#DC2626] text-white focus:ring-[#EF4444]/40 shadow-sm border border-transparent',
    };

    const sizeStyles = {
      sm: 'px-3 py-1.5 text-xs gap-1.5 min-h-[36px]',
      md: 'px-4 py-2 text-sm gap-2 min-h-[42px]',
      lg: 'px-6 py-3 text-base gap-2.5 min-h-[50px]',
    };

    const widthStyle = fullWidth ? 'w-full' : '';

    return (
      <motion.button
        ref={ref as any}
        type={type}
        disabled={disabled || isLoading}
        onClick={onClick as any}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${className}`}
        {...(props as any)}
      >
        {isLoading ? (
          <Spinner size={size === 'lg' ? 'md' : 'sm'} className="text-current" />
        ) : leftIcon ? (
          <span className="inline-flex shrink-0 text-current">{leftIcon}</span>
        ) : null}

        <span>{children}</span>

        {!isLoading && rightIcon && (
          <span className="inline-flex shrink-0 text-current">{rightIcon}</span>
        )}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
