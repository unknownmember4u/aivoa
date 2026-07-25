import React from 'react';
import { Inbox } from 'lucide-react';

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  action,
  className = '',
}) => {
  return (
    <div
      className={`bg-white rounded-[16px] border border-dashed border-[#E2E8F0] p-12 text-center flex flex-col items-center justify-center ${className}`}
    >
      <div className="w-12 h-12 rounded-full bg-slate-100 text-[#64748B] flex items-center justify-center mb-4">
        {icon || <Inbox className="w-6 h-6" />}
      </div>
      <h3 className="text-lg font-bold text-[#0F172A] tracking-tight mb-1">{title}</h3>
      <p className="text-sm text-[#64748B] max-w-sm mb-6">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
};
