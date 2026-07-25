import React from 'react';

export const UploadPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Document Upload & Intake</h2>
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <p className="text-gray-600">Drag & Drop complaint files (PDF, DOCX, TXT, EML).</p>
      </div>
    </div>
  );
};
