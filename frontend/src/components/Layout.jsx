import React from 'react';
import { useBanner } from '../context/BannerContext';
import HomeNavbar from './home/HomeNavbar';
import HomeFooter from './home/HomeFooter';

const Layout = ({ children }) => {
  const { visible: bannerVisible } = useBanner();

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Site-wide navbar (always solid here - only the public homepage gets the
          transparent-over-hero treatment, via its own direct <HomeNavbar transparentOnTop />).
          Its own mobile row includes the back arrow for every non-home page. */}
      <HomeNavbar />

      {/* Main content */}
      <main className={`flex-1 flex flex-col ${bannerVisible ? 'pt-[120px]' : 'pt-20'} pb-6`}>
        <div className="flex-1 px-4 md:px-8">
          <div className="max-w-7xl mx-auto w-full h-full">{children}</div>
        </div>
        <HomeFooter />
      </main>
    </div>
  );
};

export default Layout;
