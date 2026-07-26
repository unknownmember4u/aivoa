import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { logout } from '@/store/slices/authSlice';
import {
  Search,
  Bell,
  LogOut,
  Menu,
  ChevronRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { Avatar, Badge, Button } from '@/components/ui';

interface TopbarProps {
  onMobileOpen?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onMobileOpen }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAppSelector((state) => state.auth.user);

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Generate dynamic breadcrumbs based on route location
  const getBreadcrumbs = () => {
    const path = location.pathname;
    if (path.startsWith('/complaints/review')) {
      return [
        { label: 'Complaints', href: '/complaints' },
        { label: 'AI Review & Ingestion' },
      ];
    }
    if (path.startsWith('/complaints/') && path.endsWith('/chat')) {
      const id = path.split('/')[2];
      return [
        { label: 'Complaints', href: '/complaints' },
        { label: id, href: `/complaints/${id}` },
        { label: 'AI Assistant' },
      ];
    }
    if (path.startsWith('/complaints/')) {
      const id = path.split('/')[2];
      return [
        { label: 'Complaints', href: '/complaints' },
        { label: id },
      ];
    }
    if (path === '/upload') {
      return [{ label: 'Upload Document' }];
    }
    if (path === '/complaints') {
      return [{ label: 'Complaints Queue' }];
    }
    return [{ label: 'Dashboard' }];
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="h-[72px] bg-white/80 backdrop-blur-md border-b border-[#E2E8F0] px-4 sm:px-8 flex items-center justify-between sticky top-0 z-20 transition-all">
      {/* Left: Mobile Menu Trigger & Breadcrumbs */}
      <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
        <button
          onClick={onMobileOpen}
          className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Dynamic Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="min-w-0">
          <ol className="flex items-center space-x-1.5 text-xs text-[#64748B] truncate">
            <li className="font-semibold text-[#0F172A] hidden sm:inline">AIVOA</li>
            <span className="hidden sm:inline text-[#CBD5E1]">/</span>
            {breadcrumbs.map((crumb, idx) => (
              <li key={idx} className="flex items-center truncate">
                {idx > 0 && <ChevronRight className="w-3.5 h-3.5 mx-1 text-[#94A3B8] shrink-0" />}
                {crumb.href ? (
                  <button
                    onClick={() => navigate(crumb.href!)}
                    className="hover:text-[#2563EB] font-medium transition-colors truncate"
                  >
                    {crumb.label}
                  </button>
                ) : (
                  <span className="font-semibold text-[#0F172A] truncate">{crumb.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      </div>

      {/* Right Actions: Global Search, Notifications, Profile Dropdown */}
      <div className="flex items-center space-x-3 sm:space-x-4 shrink-0">
        {/* Global Search Bar Trigger */}
        <div
          onClick={() => navigate('/complaints')}
          className="hidden lg:flex items-center space-x-2 bg-slate-100/80 hover:bg-slate-100 border border-[#E2E8F0] px-3 py-1.5 rounded-xl text-xs text-[#64748B] cursor-pointer transition-colors w-56 justify-between"
        >
          <div className="flex items-center space-x-2">
            <Search className="w-3.5 h-3.5 text-[#94A3B8]" />
            <span>Search complaints...</span>
          </div>
          <span className="font-mono text-[10px] bg-white border border-[#E2E8F0] px-1.5 py-0.5 rounded text-[#64748B]">
            ⌘K
          </span>
        </div>

        {/* Role Badge */}
        <Badge variant="info" icon={<ShieldCheck className="w-3.5 h-3.5" />} className="hidden sm:inline-flex">
          {user?.role || 'QA_ANALYST'}
        </Badge>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#2563EB] rounded-full ring-2 ring-white" />
          </button>

          {/* Notifications Popover */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-[#E2E8F0] rounded-2xl shadow-dropdown p-4 z-50 animate-fadeIn">
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
                <span className="font-bold text-sm text-[#0F172A]">Notifications</span>
                <span className="text-[11px] font-semibold text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded-full">
                  2 New
                </span>
              </div>
              <div className="py-3 space-y-3">
                <div className="flex items-start space-x-3 text-xs">
                  <div className="p-2 bg-blue-50 text-[#2563EB] rounded-lg shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-[#0F172A] block">AI Extraction Complete</span>
                    <span className="text-[#64748B] block mt-0.5">
                      CMP-2026-0891 extracted with 97.4% confidence.
                    </span>
                    <span className="text-[10px] text-[#94A3B8] mt-1 block">5m ago</span>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                fullWidth
                onClick={() => {
                  setShowNotifications(false);
                  navigate('/complaints');
                }}
              >
                View Complaints
              </Button>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center space-x-2 p-1 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <Avatar name={user?.email || 'QA Analyst'} size="sm" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-[#E2E8F0] rounded-2xl shadow-dropdown p-2 z-50 animate-fadeIn space-y-1">
              <div className="px-3 py-2 border-b border-[#E2E8F0]">
                <span className="font-bold text-xs text-[#0F172A] block truncate">
                  {user?.email || 'qa.analyst@pharma.com'}
                </span>
                <span className="text-[10px] text-[#64748B] block mt-0.5">Enterprise QA Analyst</span>
              </div>

              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  dispatch(logout());
                }}
                className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
