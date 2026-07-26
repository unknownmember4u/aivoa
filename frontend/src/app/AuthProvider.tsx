import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { setUser } from '@/store/slices/authSlice';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.token);
  const currentUser = useAppSelector((state) => state.auth.user);

  console.log(`[DEBUG AuthProvider MOUNT/RENDER] [${new Date().toISOString()}] token:`, token, 'currentUser:', currentUser);

  useEffect(() => {
    console.log(`[DEBUG AuthProvider useEffect MOUNT] [${new Date().toISOString()}] Executing useEffect bootstrap`);
    const storedToken = localStorage.getItem('access_token');
    const storedUser = localStorage.getItem('user_profile');

    console.log('[DEBUG AuthProvider localStorage]', { storedToken, storedUser });

    if (storedToken && !currentUser) {
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

    return () => {
      console.log(`[DEBUG AuthProvider UNMOUNT] [${new Date().toISOString()}] AuthProvider unmounted`);
    };
  }, [dispatch]);

  return <>{children}</>;
};
