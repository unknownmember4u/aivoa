import React from 'react';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumbs,
  actions,
  className = '',
}) => {
  return (
    <div className={`mb-8 ${className}`}>
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="mb-3">
          <ol className="flex items-center space-x-2 text-xs text-[#64748B]">
            {breadcrumbs.map((crumb, idx) => (
              <li key={idx} className="flex items-center">
                {idx > 0 && <ChevronRight className="w-3.5 h-3.5 mx-1.5 text-[#94A3B8]" />}
                {crumb.href ? (
                  <a
                    href={crumb.href}
                    className="hover:text-[#0F172A] font-medium transition-colors"
                  >
                    {crumb.label}
                  </a>
                ) : (
                  <span className="font-semibold text-[#0F172A]">{crumb.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}

      {/* Main Title & Action Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#0F172A] tracking-tight">{title}</h1>
          {subtitle && <p className="text-sm text-[#475569] mt-1">{subtitle}</p>}
        </div>

        {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
      </div>
    </div>
  );
};
