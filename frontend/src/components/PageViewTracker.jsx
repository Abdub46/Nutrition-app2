import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '../utils/pageViewTracker';

// Renders nothing - records a page view on every route change, feeding the
// admin "Performance" analytics tab (visitors, most-visited pages, etc.).
// Mounted once near the app root, inside the Router.
const PageViewTracker = () => {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);

  return null;
};

export default PageViewTracker;