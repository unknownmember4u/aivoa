import React, { useEffect, useRef } from 'react';
import { ComplaintReviewPage } from './ComplaintReviewPage';

export const UploadPage: React.FC = () => {
  const renderCountRef = useRef(0);
  renderCountRef.current += 1;

  console.log(`[DEBUG PAGE RENDER] [${new Date().toISOString()}] UploadPage Render #${renderCountRef.current}`);

  useEffect(() => {
    console.log(`[DEBUG PAGE MOUNT] [${new Date().toISOString()}] UploadPage MOUNTED`);
    return () => {
      console.log(`[DEBUG PAGE UNMOUNT] [${new Date().toISOString()}] UploadPage UNMOUNTED`);
    };
  }, []);

  return <ComplaintReviewPage />;
};
