import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Calculator,
  MessageCircle,
  CalendarDays,
  Newspaper,
  Wrench,
  ShieldCheck,
  Menu,
  X,
  LogOut,
  Settings,
  UserCog,
  Tags,
  KeyRound,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useBanner } from '../context/BannerContext';
import Footer from './Footer';
import BackButton from './BackButton';

const clientLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/bmi-calculator', label: 'BMI Calculator', icon: Calculator },
  { to: '/chatbot', label: 'AI Chatbot', icon: MessageCircle },
  { to: '/appointments', label: 'Appointments', icon: CalendarDays },
  { to: '/articles', label: 'Articles', icon: Newspaper },
  { to: '/tools', label: 'Tools', icon: Wrench },
];

const adminLinks = [
  { to: '/admin', label: 'Admin Home', icon: ShieldCheck },
  { to: '/admin/users', label: 'Users', icon: LayoutDashboard },
  { to: '/admin/writers', label: 'Writers', icon: UserCog },
  { to: '/admin/appointments', label: 'Appointments', icon: CalendarDays },
  { to: '/admin/articles', label: 'Articles', icon: Newspaper },
  { to: '/admin/categories', label: 'Categories', icon: Tags },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];

// Writers only have access to their own articles, profile-adjacent settings, and password change -
// no users, analytics, banner, newsletter, or admin management per the role's restricted permissions.
const writerLinks = [
  { to: '/admin/articles', label: 'My Articles', icon: Newspaper },
  { to: '/change-password', label: 'Change Password', icon: KeyRound },
];

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const { visible: bannerVisible } = useBanner();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = user?.role === 'admin' ? adminLinks : user?.role === 'writer' ? writerLinks : clientLinks;
  const bottomNavLinks = links.slice(0, 5);
  const isAdmin = user?.role === 'admin';
  const isWriter = user?.role === 'writer';
  const portalLabel = isAdmin ? 'Admin Panel' : isWriter ? 'Writer Portal' : 'Client Portal';
  const bannerOffsetClass = bannerVisible ? 'top-10' : 'top-0';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Desktop Sidebar - glassmorphism: translucent + backdrop blur, sticky via fixed positioning */}
      <aside className={`hidden md:flex md:flex-col w-64 bg-white/70 backdrop-blur-xl border-r border-white/60 fixed h-full ${bannerOffsetClass}`}>
        <div className="px-6 py-5 border-b border-white/60 flex items-center gap-2">
          <BackButton />
          <div>
            <h1 className="text-lg font-bold text-primary-700">NutriCounsel</h1>
            <p className="text-xs text-gray-500 mt-0.5">{portalLabel}</p>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/admin'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-white/60">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 w-full"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Mobile top bar - glassmorphism, transparent + sticky (fixed) */}
      <div className={`md:hidden fixed left-0 right-0 z-30 bg-white/70 backdrop-blur-xl border-b border-white/60 px-4 py-3 flex items-center justify-between ${bannerOffsetClass}`}>
        <div className="flex items-center gap-2">
          <BackButton />
          <h1 className="text-base font-bold text-primary-700">NutriCounsel</h1>
        </div>
        <button onClick={() => setMobileOpen(true)} className="p-2">
          <Menu size={22} />
        </button>
      </div>

      {/* Mobile hamburger drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/40" onClick={() => setMobileOpen(false)}>
          <div
            className="bg-white/90 backdrop-blur-xl w-64 h-full p-4 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-base font-bold text-primary-700">NutriCounsel</h1>
              <button onClick={() => setMobileOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 space-y-1 overflow-y-auto">
              {links.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/admin'}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                      isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-600'
                    }`
                  }
                >
                  <Icon size={18} />
                  {label}
                </NavLink>
              ))}
            </nav>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600"
            >
              <LogOut size={18} /> Logout
            </button>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className={`flex-1 md:ml-64 ${bannerVisible ? 'pt-[104px] md:pt-16' : 'pt-16 md:pt-6'} pb-20 md:pb-6 px-4 md:px-8 flex flex-col`}>
        <div className="max-w-7xl mx-auto w-full flex-1">{children}</div>
        <Footer />
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
