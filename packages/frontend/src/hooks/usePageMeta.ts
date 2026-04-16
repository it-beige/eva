import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { getPageMeta } from '../app/navigation';

export const usePageMeta = () => {
  const location = useLocation();

  return useMemo(() => getPageMeta(location.pathname), [location.pathname]);
};
