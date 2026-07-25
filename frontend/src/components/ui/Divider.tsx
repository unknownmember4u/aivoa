import React from 'react';

export interface DividerProps {
  label?: string;
  className?: string;
}

export const Divider: React.FC<DividerProps> = ({ label, className = '' }) => {
  if (label) {
    return (
      <div className={`relative flex items-center my-6 ${className}`}>
        <div className="flex-grow border-t border-[#E2E8F0]" />
        <span className="flex-shrink mx-4 text-xs font-semibold uppercase tracking-wider text-[#64748B]">
          {label}
        </span>
        <div className="flex-grow border-t border-[#E2E8F0]" />
      </div>
    );
  }

  return <hr className={`my-6 border-t border-[#E2E8F0] ${className}`} />;
};
