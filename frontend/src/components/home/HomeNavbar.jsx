import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search, Menu, X, MessageCircle, LogOut, LayoutDashboard, Users, PenSquare,
  CalendarCheck, FolderTree, Settings, UserPlus, BarChart3, ChevronDown, Newspaper,
} from 'lucide-react';
import { useBanner } from '../../context/BannerContext';
import { useAuth } from '../../context/AuthContext';
import BackButton from '../BackButton';

// Base links - visible to everyone, logged in or not, on every page.
const BASE_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'General Calculator', to: '/tools' },
];

// "My Portal" - same for a client and a writer; the writer additionally gets a
// standalone "Add Article" link, and an admin gets a slightly different set
// (no Book Appointment) plus their own Admin Dashboard / Settings dropdowns.
// Articles now requires login for everyone, so it lives in here rather than
// in the always-visible BASE_LINKS above.
const CLIENT_PORTAL_ITEMS = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Articles', to: '/articles', icon: Newspaper },
  { label: 'Horizon+ AI', to: '/chatbot', icon: MessageCircle },
  { label: 'Book Appointment', to: '/appointments', icon: CalendarCheck },
];

const ADMIN_PORTAL_ITEMS = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Articles', to: '/articles', icon: Newspaper },
  { label: 'Horizon+ AI', to: '/chatbot', icon: MessageCircle },
];

const ADMIN_DASHBOARD_ITEMS = [
  { label: 'Analytics', to: '/admin', icon: BarChart3 },
  { label: 'Users', to: '/admin/users', icon: Users },
  { label: 'Appointments', to: '/admin/appointments', icon: CalendarCheck },
];

const SETTINGS_ITEMS = [
  { label: 'Site Settings', to: '/admin/settings', icon: Settings },
  { label: 'Categories', to: '/admin/categories', icon: FolderTree },
  { label: 'Add Writer', to: '/admin/writers', icon: UserPlus },
  { label: 'Add Article', to: '/admin/articles', icon: PenSquare },
];

// Desktop dropdown - trigger is a plain button (not a link), items live underneath.
// Uses a CSS group-hover so no open/close state or outside-click handling is needed;
// the invisible padding above the panel keeps the hover chain unbroken.
const NavDropdown = ({ label, items, isSolid, onNavigate }) => (
  <div className="relative group">
    <button
      type="button"
      className={`flex items-center gap-1 text-sm font-medium transition-colors duration-300 ${
        isSolid ? 'text-gray-700 hover:text-primary-900' : 'text-white/90 hover:text-white'
      }`}
    >
      {label}
      <ChevronDown size={14} className="transition-transform duration-200 group-hover:rotate-180" />
    </button>
    <div className="absolute left-1/2 -translate-x-1/2 top-full pt-3 hidden group-hover:block z-50">
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 py-2 w-56">
        {items.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-900 transition-colors"
          >
            <item.icon size={16} className="text-gray-400" />
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  </div>
);

// Mobile drawer section - a small uppercase label followed by its indented links.
const MobileSection = ({ label, items, onNavigate }) => (
  <div className="flex flex-col gap-3 mt-1">
    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</p>
    {items.map((item) => (
      <Link
        key={item.to}
        to={item.to}
        onClick={onNavigate}
        className="flex items-center gap-2 pl-1 text-base font-medium text-gray-700 hover:text-primary-900"
      >
        <item.icon size={18} /> {item.label}
      </Link>
    ))}
  </div>
);

// transparentOnTop: true only on the public homepage, where the navbar starts
// transparent over the hero image and turns solid on scroll. Every other page
// renders this component through Layout.jsx with the default (always solid).
const HomeNavbar = ({ transparentOnTop = false }) => {
  const { visible: bannerVisible } = useBanner();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuButtonRef = useRef(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');

  const isSolid = transparentOnTop ? scrolled : true;

  const handleLogout = () => {
    setMobileOpen(false);
    logout();
    navigate('/login');
  };

  useEffect(() => {
    if (!transparentOnTop) return undefined;
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [transparentOnTop]);




  useEffect(() => {
  if (!mobileOpen) return;

  const handleDocumentClick = (event) => {
    // Don't close immediately when clicking the hamburger to open it.
    if (menuButtonRef.current?.contains(event.target)) {
      return;
    }

    setMobileOpen(false);
  };

  document.addEventListener('click', handleDocumentClick);

  return () => {
    document.removeEventListener('click', handleDocumentClick);
  };
}, [mobileOpen]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      window.location.href = `/articles?q=${encodeURIComponent(query.trim())}`;
    }
  };

  const closeMobile = () => setMobileOpen(false);
  const offsetClass = bannerVisible ? 'top-10' : 'top-0';

  const portalItems = user?.role === 'admin' ? ADMIN_PORTAL_ITEMS : CLIENT_PORTAL_ITEMS;

  return (
    <header
      id="top"
      className={`fixed left-0 right-0 ${offsetClass} z-40 transition-all duration-500 ${
        isSolid ? 'bg-white/70 backdrop-blur-xl shadow-sm border-b border-white/60' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between h-20">
        {/* Left: back arrow (mobile, non-home pages only) + logo */}
        <div className="flex items-center gap-1">
          <div className="lg:hidden -ml-1">
            <BackButton />
          </div>
          <Link to="/" className="flex flex-col leading-none group">
            <span
              className={`text-2xl md:text-3xl font-black uppercase tracking-tight italic transition-colors duration-500 ${
                isSolid ? 'text-primary-900' : 'text-white'
              }`}
              style={{ transform: 'skewX(-6deg)', display: 'inline-block' }}
            >
              HORIZON<span className="text-accent-500 not-italic">+</span>
            </span>
            <span
              className={`text-[9px] md:text-[10px] font-medium uppercase tracking-[0.25em] mt-1 transition-colors duration-500 ${
                isSolid ? 'text-gray-500' : 'text-white/80'
              }`}
            >
              Nutrition &bull; Wellness &bull; Lifestyle
            </span>
          </Link>
        </div>

        {/* Center nav - desktop */}
        <nav className="hidden lg:flex items-center gap-8">
          {BASE_LINKS.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className={`relative text-sm font-medium transition-colors duration-300 pb-1 group ${
                isSolid ? 'text-gray-700 hover:text-primary-900' : 'text-white/90 hover:text-white'
              }`}
            >
              {link.label}
              <span className="absolute left-0 -bottom-0.5 h-0.5 w-0 bg-accent-500 rounded-full transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}

          {user && <NavDropdown label="My Portal" items={portalItems} isSolid={isSolid} />}

          {user?.role === 'writer' && (
            <Link
              to="/admin/articles"
              className={`relative text-sm font-medium transition-colors duration-300 pb-1 group ${
                isSolid ? 'text-gray-700 hover:text-primary-900' : 'text-white/90 hover:text-white'
              }`}
            >
              Add Article
              <span className="absolute left-0 -bottom-0.5 h-0.5 w-0 bg-accent-500 rounded-full transition-all duration-300 group-hover:w-full" />
            </Link>
          )}

          {user?.role === 'admin' && (
            <>
              <NavDropdown label="Admin Dashboard" items={ADMIN_DASHBOARD_ITEMS} isSolid={isSolid} />
              <NavDropdown label="Settings" items={SETTINGS_ITEMS} isSolid={isSolid} />
            </>
          )}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center">
            {searchOpen ? (
              <form onSubmit={handleSearchSubmit} className="flex items-center">
                <input
                  autoFocus
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onBlur={() => !query && setSearchOpen(false)}
                  placeholder="Search articles..."
                  className={`w-40 lg:w-52 text-sm rounded-full px-4 py-2 border focus:outline-none focus:ring-2 focus:ring-accent-500 transition-all duration-300 ${
                    isSolid ? 'border-gray-200 bg-white text-gray-700' : 'border-white/30 bg-white/10 text-white placeholder-white/70 backdrop-blur-sm'
                  }`}
                />
              </form>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                aria-label="Search"
                className={`p-2 rounded-full transition-colors duration-300 ${
                  isSolid ? 'text-gray-600 hover:bg-gray-100' : 'text-white hover:bg-white/10'
                }`}
              >
                <Search size={18} />
              </button>
            )}
          </div>

          <a
            href="#newsletter"
            className="hidden sm:inline-flex items-center bg-accent-500 hover:bg-accent-600 text-white text-sm font-semibold rounded-full px-5 py-2.5 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
          >
            Subscribe
          </a>

          {/* Logout (desktop) - previously only reachable from the mobile drawer */}
          {user ? (
            <button
              onClick={handleLogout}
              className={`hidden lg:inline-flex items-center gap-1.5 text-sm font-medium transition-colors duration-300 ${
                isSolid ? 'text-gray-600 hover:text-red-600' : 'text-white/90 hover:text-white'
              }`}
            >
              <LogOut size={16} /> Logout
            </button>
          ) : (
            <Link
              to="/login"
              className={`hidden lg:inline-flex items-center text-sm font-medium transition-colors duration-300 ${
                isSolid ? 'text-gray-700 hover:text-primary-900' : 'text-white/90 hover:text-white'
              }`}
            >
              Login
            </Link>
          )}

          <button
  ref={menuButtonRef}
  onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className={`lg:hidden p-2 rounded-full transition-colors duration-300 ${
              isSolid ? 'text-primary-900 hover:bg-gray-100' : 'text-white hover:bg-white/10'
            }`}
          >
            <Menu size={22} />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
{mobileOpen && (
 <div
  className="lg:hidden fixed inset-0 z-50 bg-black/40 flex justify-end"
  
>
 <div
  className="bg-white w-72 h-screen shadow-xl flex flex-col animate-[fadeIn_0.2s_ease-out]"
  
>
            <div className="px-6 pt-6 pb-5 flex items-center justify-between border-b border-gray-100">
              <span className="text-xl font-black uppercase italic text-primary-900" style={{ transform: 'skewX(-6deg)', display: 'inline-block' }}>
                HORIZON<span className="text-accent-500 not-italic">+</span>
              </span>
              <button onClick={closeMobile} aria-label="Close menu">
                <X size={20} className="text-gray-500" />
              </button>
            </div>









  <nav
  className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-5"
  onClick={closeMobile}
>










              {BASE_LINKS.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  onClick={closeMobile}
                  className="text-base font-medium text-gray-700 hover:text-primary-900"
                >
                  {link.label}
                </Link>
              ))}

              {user && (
                <>
                  <div className="border-t border-gray-100 my-1" />
                  <MobileSection label="My Portal" items={portalItems} onNavigate={closeMobile} />

                  {user.role === 'writer' && (
                    <Link
                      to="/admin/articles"
                      onClick={closeMobile}
                      className="flex items-center gap-2 text-base font-medium text-gray-700 hover:text-primary-900 mt-1"
                    >
                      <PenSquare size={18} /> Add Article
                    </Link>
                  )}

                  {user.role === 'admin' && (
                    <>
                      <MobileSection label="Admin Dashboard" items={ADMIN_DASHBOARD_ITEMS} onNavigate={closeMobile} />
                      <MobileSection label="Settings" items={SETTINGS_ITEMS} onNavigate={closeMobile} />
                    </>
                  )}

                  <div className="border-t border-gray-100 my-1" />
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-base font-medium text-red-600 hover:text-red-700"
                  >
                    <LogOut size={18} /> Logout
                  </button>
                </>
              )}

              {!user && (
                <>
                  <div className="border-t border-gray-100 my-1" />
                  <Link to="/login" onClick={closeMobile} className="text-base font-medium text-gray-700 hover:text-primary-900">
                    Login
                  </Link>
                  <Link to="/signup" onClick={closeMobile} className="text-base font-medium text-gray-700 hover:text-primary-900">
                    Sign Up
                  </Link>
                </>
              )}
            </nav>
            <a
              href="#newsletter"
              onClick={closeMobile}
              className="mt-8 text-center bg-accent-500 hover:bg-accent-600 text-white text-sm font-semibold rounded-full px-5 py-3 transition-colors duration-300"
            >
              Subscribe
            </a>
          </div>
        </div>
      )}



    </header>
  );
};

export default HomeNavbar;