import React from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { logout } from '@/store/slices/authSlice';
import { LogOut, User as UserIcon } from 'lucide-react';

export const Topbar: React.FC = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-8 flex items-center justify-between sticky top-0 z-10">
      <h1 className="text-lg font-semibold text-gray-800">Pharmaceutical Customer Complaint System</h1>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 text-sm text-gray-700 bg-gray-100 px-3 py-1.5 rounded-full">
          <UserIcon className="w-4 h-4 text-gray-500" />
          <span className="font-medium">{user?.email || 'qa.analyst@pharma.com'}</span>
          <span className="bg-sky-100 text-sky-800 text-xs font-semibold px-2 py-0.5 rounded">
            {user?.role || 'QA_ANALYST'}
          </span>
        </div>

        <button
          onClick={() => dispatch(logout())}
          className="flex items-center text-sm font-medium text-gray-600 hover:text-red-600 transition-colors px-3 py-1.5 rounded-md hover:bg-gray-100"
        >
          <LogOut className="w-4 h-4 mr-1.5" />
          Logout
        </button>
      </div>
    </header>
  );
};
