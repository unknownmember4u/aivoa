import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  FileText,
  Upload,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { logout } from '@/store/slices/authSlice';
import { Avatar } from '@/components/ui';

interface SidebarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isMobileOpen = false,
  onMobileClose,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  const navSections = [
    {
      title: 'Main Navigation',
      items: [
        { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/complaints', label: 'Complaints Queue', icon: FileText, badge: 'Live' },
        { to: '/upload', label: 'Upload Document', icon: Upload },
      ],
    },
    {
      title: 'AI Intelligence',
      items: [
        { to: '/complaints', label: 'AI Review Hub', icon: Sparkles },
      ],
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between p-4 select-none bg-white">
      {/* Top Header & Logo */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2 pt-1">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="truncate"
              >
                <span className="font-bold text-lg text-[#0F172A] tracking-tight block leading-none">
                  AIVOA
                </span>
                <span className="text-[10px] text-[#2563EB] font-bold uppercase tracking-wider block mt-1">
                  Pharma Quality AI
                </span>
              </motion.div>
            )}
          </div>

          {/* Desktop Collapse Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-[#0F172A] border border-slate-200 transition-colors"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Section Links */}
        <nav className="space-y-6">
          {navSections.map((section, idx) => (
            <div key={idx} className="space-y-2">
              {!isCollapsed && (
                <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  {section.title}
                </span>
              )}
              <div className="space-y-1">
                {section.items.map((item, itemIdx) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={itemIdx}
                      to={item.to}
                      onClick={() => onMobileClose?.()}
                      className={({ isActive }) =>
                        `group flex items-center ${
                          isCollapsed ? 'justify-center px-0' : 'justify-between px-3'
                        } py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                          isActive
                            ? 'bg-[#2563EB] text-white shadow-md shadow-blue-600/20 font-semibold'
                            : 'text-[#64748B] hover:bg-slate-100/80 hover:text-[#0F172A]'
                        }`
                      }
                      title={isCollapsed ? item.label : undefined}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-105" />
                        {!isCollapsed && <span className="truncate">{item.label}</span>}
                      </div>

                      {!isCollapsed && item.badge && (
                        <span className="text-[10px] font-semibold bg-blue-50 text-[#2563EB] border border-blue-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Bottom User Card */}
      <div className="pt-4 border-t border-[#E2E8F0]">
        <div
          className={`flex items-center ${
            isCollapsed ? 'justify-center' : 'justify-between'
          } p-2.5 rounded-xl bg-slate-50 border border-[#E2E8F0] hover:bg-slate-100/60 transition-colors`}
        >
          <div className="flex items-center space-x-3 overflow-hidden">
            <Avatar name={user?.email || 'QA Analyst'} size="sm" />
            {!isCollapsed && (
              <div className="truncate text-left">
                <span className="text-xs font-semibold text-[#0F172A] block truncate">
                  {user?.email ? user.email.split('@')[0] : 'QA Analyst'}
                </span>
                <span className="text-[10px] font-semibold text-[#2563EB] uppercase tracking-wider block">
                  {user?.role || 'QA_ANALYST'}
                </span>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <button
              onClick={() => dispatch(logout())}
              className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* DESKTOP FLOATING LIGHT SIDEBAR */}
      <motion.aside
        animate={{ width: isCollapsed ? 80 : 256 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="hidden md:block sticky top-0 h-screen py-4 pl-4 shrink-0 z-30"
      >
        <div className="h-full bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
          {sidebarContent}
        </div>
      </motion.aside>

      {/* MOBILE DRAWER OVERLAY */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onMobileClose}
              className="md:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="md:hidden fixed top-0 left-0 bottom-0 w-72 bg-white z-50 border-r border-[#E2E8F0]"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
