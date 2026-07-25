import React from 'react';

export const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8 border border-slate-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Pharma QA Login</h2>
        <p className="text-sm text-gray-500 text-center mb-6">Customer Complaint Management System</p>
        <div className="space-y-4">
          <button
            onClick={() => {
              localStorage.setItem('access_token', 'mock_dev_jwt_token');
              window.location.href = '/dashboard';
            }}
            className="w-full bg-sky-600 hover:bg-sky-700 text-white font-medium py-2.5 px-4 rounded-md transition-colors shadow-sm"
          >
            Log in as QA Analyst (Demo)
          </button>
        </div>
      </div>
    </div>
  );
};
