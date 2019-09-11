import React, { useEffect, useState } from 'react';

function getSize() {
  const { innerHeight, innerWidth, outerHeight, outerWidth } = window;
  return {
    innerHeight,
    innerWidth,
    outerHeight,
    outerWidth,
  };
}

function useWindowSize() {
  const [windowSize, setWindowSize] = useState(getSize());

  function handleResize() {
    setWindowSize(getSize());
  }

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return windowSize;
}

export default useWindowSize;
