import React from 'react';
import { useBanner } from '../context/BannerContext';
import HomeFooter from './home/HomeFooter';
import BackButton from './BackButton';

const Layout = ({ children }) => {
  const { visible: bannerVisible } = useBanner();
  const bannerOffsetClass = bannerVisible ? 'top-10' : 'top-0';

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Mobile top bar - back arrow only. The hamburger menu lives on the public
          homepage (components/home/HomeNavbar.jsx); every other page just lets
          the user step back to where they came from. */}
      <div className={`md:hidden fixed left-0 right-0 z-30 bg-white/70 backdrop-blur-xl border-b border-white/60 px-4 py-3 flex items-center ${bannerOffsetClass}`}>
        <BackButton />
      </div>

      {/* Main content */}
      <main className={`flex-1 flex flex-col ${bannerVisible ? 'pt-[104px] md:pt-16' : 'pt-16 md:pt-6'} pb-6`}>
        <div className="flex-1 px-4 md:px-8">
          <div className="max-w-7xl mx-auto w-full h-full">{children}</div>
        </div>
        <HomeFooter />
      </main>


      {/* Mobile bottom nav - glassmorphism */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/70 backdrop-blur-xl border-t border-white/60 flex justify-around py-2">
              {bottomNavLinks.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/admin'}
                  className={({ isActive }) =>
                    `flex flex-col items-center gap-0.5 text-[10px] px-2 ${
                      isActive ? 'text-primary-700' : 'text-gray-500'
                    }`
                  }
                >
                  <Icon size={20} />
                  {label.split(' ')[0]}
                </NavLink>
              ))}
            </nav>




    </div>
  );
};

export default Layout;
