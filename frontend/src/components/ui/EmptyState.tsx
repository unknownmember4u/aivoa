import React from 'react';

export interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  secondaryAction?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className = '',
}) => {
  return (
    <div className={`p-12 sm:p-16 bg-white border border-[#E2E8F0] rounded-[24px] shadow-sm text-center flex flex-col items-center justify-center space-y-4 max-w-lg mx-auto ${className}`}>
      <div className="w-14 h-14 rounded-2xl bg-blue-50/80 border border-blue-100 text-[#2563EB] flex items-center justify-center shadow-xs">
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-bold text-[#0F172A] tracking-tight">{title}</h3>
        <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed max-w-sm mx-auto">{description}</p>
      </div>
      {(action || secondaryAction) && (
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          {action}
          {secondaryAction}
        </div>
      )}
    </div>
  );
};
