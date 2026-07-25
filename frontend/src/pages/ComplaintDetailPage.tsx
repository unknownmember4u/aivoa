import React from 'react';
import { useParams } from 'react-router-dom';

export const ComplaintDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Complaint Details</h2>
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <p className="text-gray-600">Viewing Complaint ID: {id}</p>
      </div>
    </div>
  );
};
