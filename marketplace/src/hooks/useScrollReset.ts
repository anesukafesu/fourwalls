import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useScrollReset = () => {
  const location = useLocation();

  useEffect(() => {
    // Only scroll to top on location change (not on initial mount)
    window.scrollTo(0, 0);
  }, [location.pathname]);
};