import React from 'react';

export interface SectionProps {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const Section: React.FC<SectionProps> = ({
  title,
  subtitle,
  action,
  children,
  className = '',
}) => {
  return (
    <section className={`mb-8 ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#E2E8F0]">
          <div>
            {title && <h2 className="text-xl font-bold text-[#0F172A] tracking-tight">{title}</h2>}
            {subtitle && <p className="text-xs text-[#64748B] mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </section>
  );
};
