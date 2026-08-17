import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Renders nothing - React Router doesn't reset scroll position on navigation
// the way a normal multi-page site does, so without this, clicking a link
// while scrolled down (e.g. a footer link) leaves the new page rendered but
// still scrolled to wherever you were. This resets to the top on every route
// change, for every page. Mounted once near the app root, inside the Router.
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default ScrollToTop;