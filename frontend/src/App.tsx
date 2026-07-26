import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from '@/routes/AppRoutes';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { useGetCurrentUserQuery } from '@/services/authApi';
import { setUser } from '@/store/slices/authSlice';

const AuthInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.token);
  const currentUser = useAppSelector((state) => state.auth.user);

  const shouldSkip = !token || !!currentUser;
  console.log(`[DEBUG AuthInitializer RENDER] [${new Date().toISOString()}] token:`, token, 'currentUser:', currentUser, 'shouldSkip /auth/me:', shouldSkip);

  const { data: userProfile, isLoading, isFetching } = useGetCurrentUserQuery(undefined, {
    skip: shouldSkip,
  });

  console.log(`[DEBUG /auth/me QUERY STATE] [${new Date().toISOString()}] isLoading:`, isLoading, 'isFetching:', isFetching, 'data:', userProfile);

  useEffect(() => {
    console.log(`[DEBUG AuthInitializer MOUNT] [${new Date().toISOString()}] AuthInitializer mounted`);
    if (userProfile) {
      console.log(`[DEBUG AuthInitializer /auth/me SUCCESS] [${new Date().toISOString()}] dispatching setUser:`, userProfile);
      dispatch(setUser(userProfile));
    }
    return () => {
      console.log(`[DEBUG AuthInitializer UNMOUNT] [${new Date().toISOString()}] AuthInitializer unmounted`);
    };
  }, [userProfile, dispatch]);

  return <>{children}</>;
};

export const App: React.FC = () => {
  console.log(`[DEBUG App RENDER] [${new Date().toISOString()}] Rendering App component`);
  return (
    <BrowserRouter>
      <AuthInitializer>
        <AppRoutes />
      </AuthInitializer>
    </BrowserRouter>
  );
};

export default App;
