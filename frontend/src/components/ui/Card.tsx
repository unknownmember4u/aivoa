import React from 'react';
import { motion } from 'framer-motion';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> & {
  Header: React.FC<{ children: React.ReactNode; className?: string; action?: React.ReactNode }>;
  Title: React.FC<{ children: React.ReactNode; className?: string }>;
  Description: React.FC<{ children: React.ReactNode; className?: string }>;
  Content: React.FC<{ children: React.ReactNode; className?: string }>;
  Footer: React.FC<{ children: React.ReactNode; className?: string }>;
} = ({ children, className = '', onClick, hoverable = false }) => {
  const isInteractive = onClick || hoverable;

  return (
    <motion.div
      onClick={onClick}
      whileHover={isInteractive ? { y: -2, transition: { duration: 0.2 } } : undefined}
      className={`bg-white rounded-[20px] border border-[#E2E8F0] shadow-[0_4px_20px_-2px_rgba(15,23,42,0.05)] transition-all duration-200 ${
        isInteractive ? 'cursor-pointer hover:shadow-[0_12px_30px_-4px_rgba(15,23,42,0.08)] hover:border-[#CBD5E1]' : ''
      } ${className}`}
    >
      {children}
    </motion.div>
  );
};

const CardHeader: React.FC<{ children: React.ReactNode; className?: string; action?: React.ReactNode }> = ({
  children,
  className = '',
  action,
}) => (
  <div className={`px-6 py-5 border-b border-[#E2E8F0] flex items-center justify-between gap-4 ${className}`}>
    <div>{children}</div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);

const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <h3 className={`text-lg font-bold text-[#0F172A] tracking-tight ${className}`}>{children}</h3>
);

const CardDescription: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <p className={`text-xs text-[#64748B] mt-0.5 leading-relaxed ${className}`}>{children}</p>
);

const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`p-6 ${className}`}>{children}</div>
);

const CardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`px-6 py-4 bg-slate-50/80 border-t border-[#E2E8F0] rounded-b-[20px] flex items-center justify-end gap-3 ${className}`}>
    {children}
  </div>
);

Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Description = CardDescription;
Card.Content = CardContent;
Card.Footer = CardFooter;
