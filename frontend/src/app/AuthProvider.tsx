import React, { useEffect } from 'react';
import { useAppDispatch } from '@/hooks/redux';
import { setUser } from '@/store/slices/authSlice';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Restore access token and initialize state on application bootstrap
    const token = localStorage.getItem('access_token');
    if (token) {
      // Mock initial user restoration; will be populated via /auth/me RTK Query endpoint
      dispatch(
        setUser({
          id: 'dev-user-id',
          email: 'qa.analyst@pharma.com',
          role: 'QA_ANALYST',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
      );
    }
  }, [dispatch]);

  return <>{children}</>;
};
