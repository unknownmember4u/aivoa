import React from 'react';

export interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rounded',
  width,
  height,
}) => {
  const variantStyles = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-xl',
  };

  const style: React.CSSProperties = {
    width: width !== undefined ? width : undefined,
    height: height !== undefined ? height : undefined,
  };

  return (
    <div
      style={style}
      className={`animate-shimmer bg-slate-200/80 ${variantStyles[variant]} ${className}`}
    />
  );
};

export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`p-6 bg-white border border-[#E2E8F0] rounded-[20px] shadow-sm space-y-4 ${className}`}>
    <div className="flex items-center justify-between">
      <Skeleton width="40%" height={16} />
      <Skeleton width={60} height={24} variant="rounded" />
    </div>
    <Skeleton width="60%" height={32} />
    <Skeleton width="80%" height={14} />
  </div>
);

export const SkeletonTable: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="bg-white border border-[#E2E8F0] rounded-[20px] overflow-hidden shadow-sm">
    <div className="p-4 bg-slate-50 border-b border-[#E2E8F0] flex items-center justify-between">
      <Skeleton width={180} height={20} />
      <Skeleton width={120} height={32} />
    </div>
    <div className="divide-y divide-[#E2E8F0]">
      {Array.from({ length: rows }).map((_, idx) => (
        <div key={idx} className="p-4 flex items-center justify-between gap-4">
          <Skeleton width="20%" height={16} />
          <Skeleton width="30%" height={16} />
          <Skeleton width="15%" height={24} variant="rounded" />
          <Skeleton width="15%" height={24} variant="rounded" />
          <Skeleton width="10%" height={16} />
        </div>
      ))}
    </div>
  </div>
);
