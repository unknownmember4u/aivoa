import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'info' | 'success' | 'warning' | 'danger' | 'neutral';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  dot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  icon,
  dot = false,
  className = '',
}) => {
  const variantStyles = {
    info: 'bg-blue-50 text-[#2563EB] border-blue-200/60',
    success: 'bg-emerald-50 text-[#16A34A] border-emerald-200/60',
    warning: 'bg-amber-50 text-[#D97706] border-amber-200/60',
    danger: 'bg-rose-50 text-[#EF4444] border-rose-200/60',
    neutral: 'bg-slate-100 text-[#475569] border-slate-200/80',
  };

  const dotColors = {
    info: 'bg-[#2563EB]',
    success: 'bg-[#22C55E]',
    warning: 'bg-[#F59E0B]',
    danger: 'bg-[#EF4444]',
    neutral: 'bg-[#64748B]',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[11px] gap-1 rounded-md font-semibold',
    md: 'px-2.5 py-1 text-xs gap-1.5 rounded-lg font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center border border-solid tracking-wide uppercase transition-colors ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColors[variant]}`} />}
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
