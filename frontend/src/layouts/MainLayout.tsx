import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export const MainLayout: React.FC = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const renderCountRef = useRef(0);
  renderCountRef.current += 1;

  console.log(
    `[DEBUG MainLayout RENDER #${renderCountRef.current}] [${new Date().toISOString()}] Current Route Path: ${location.pathname}`
  );

  useEffect(() => {
    console.log(`[DEBUG MainLayout MOUNT] [${new Date().toISOString()}] MainLayout component mounted`);
    return () => {
      console.log(`[DEBUG MainLayout UNMOUNT] [${new Date().toISOString()}] MainLayout component UNMOUNTED`);
    };
  }, []);

  useEffect(() => {
    console.log(`[DEBUG ROUTE NAVIGATION TRANSITION] [${new Date().toISOString()}] Navigated to: ${location.pathname}`);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* SIDEBAR NAVIGATION */}
      <Sidebar
        isMobileOpen={isMobileOpen}
        onMobileClose={() => setIsMobileOpen(false)}
      />

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onMobileOpen={() => setIsMobileOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
