import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '@/hooks/redux';

export const ProtectedRoute: React.FC = () => {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  console.log(`[DEBUG ProtectedRoute RENDER] [${new Date().toISOString()}] isAuthenticated:`, isAuthenticated);

  useEffect(() => {
    console.log(`[DEBUG ProtectedRoute MOUNT] [${new Date().toISOString()}] ProtectedRoute mounted`);
    return () => {
      console.log(`[DEBUG ProtectedRoute UNMOUNT] [${new Date().toISOString()}] ProtectedRoute unmounted`);
    };
  }, []);

  if (!isAuthenticated) {
    console.log(`[DEBUG ProtectedRoute REDIRECT] [${new Date().toISOString()}] Not authenticated, redirecting to /login`);
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
