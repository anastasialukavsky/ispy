import React, { useEffect, useRef, useState } from 'react';

const useOpenCvReady = () => {
  const [cvReady, setCvReady] = useState(false);

  useEffect(() => {
    const checkOpenCv = () => {
      if (window.cv && window.cv['onRuntimeInitialized']) {
        window.cv['onRuntimeInitialized'] = () => {
          setCvReady(true);
        };
      } else if (window.cv) {
        setCvReady(true);
      }
    };

    // Check if OpenCV.js is already loaded
    if (window.cv) {
      setCvReady(true);
    } else {
      const interval = setInterval(() => {
        checkOpenCv();
      }, 100);

      return () => clearInterval(interval); 
    }
  }, []);

  return cvReady;
};

export default useOpenCvReady;
