import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, X, MessageCircle, Wrench, LogOut } from 'lucide-react';
import { useBanner } from '../../context/BannerContext';
import { useAuth } from '../../context/AuthContext';

const NAV_LINKS = [
  { label: 'Home', href: '#top', type: 'anchor' },
  { label: 'Articles', to: '/articles', type: 'route' },
  { label: 'BMI Calculator', to: '/bmi-calculator', type: 'route' },
  { label: 'Counselling', to: '/appointments', type: 'route' },
  { label: 'About Us', href: '#why-choose-us', type: 'anchor' },
  { label: 'Contact', href: '#footer', type: 'anchor' },
];

const HomeNavbar = () => {
  const { visible: bannerVisible } = useBanner();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');

  const handleLogout = () => {
    setMobileOpen(false);
    logout();
    navigate('/login');
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      window.location.href = `/articles?q=${encodeURIComponent(query.trim())}`;
    }
  };

  const offsetClass = bannerVisible ? 'top-10' : 'top-0';

  return (
    <header
      id="top"
      className={`fixed left-0 right-0 ${offsetClass} z-40 transition-all duration-500 ${
        scrolled ? 'bg-white/70 backdrop-blur-xl shadow-sm border-b border-white/60' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between h-20">
        {/* Logo */}
        <Link to="/" className="flex flex-col leading-none group">
          <span
            className={`text-2xl md:text-3xl font-black uppercase tracking-tight italic transition-colors duration-500 ${
              scrolled ? 'text-primary-900' : 'text-white'
            }`}
            style={{ transform: 'skewX(-6deg)', display: 'inline-block' }}
          >
            HORIZON<span className="text-accent-500 not-italic">+</span>
          </span>
          <span
            className={`text-[9px] md:text-[10px] font-medium uppercase tracking-[0.25em] mt-1 transition-colors duration-500 ${
              scrolled ? 'text-gray-500' : 'text-white/80'
            }`}
          >
            Nutrition &bull; Wellness &bull; Lifestyle
          </span>
        </Link>

        {/* Center nav - desktop */}
        <nav className="hidden lg:flex items-center gap-8">
          {NAV_LINKS.map((link) =>
            link.type === 'anchor' ? (
              <a
                key={link.label}
                href={link.href}
                className={`relative text-sm font-medium transition-colors duration-300 pb-1 group ${
                  scrolled ? 'text-gray-700 hover:text-primary-900' : 'text-white/90 hover:text-white'
                } ${link.label === 'Home' ? 'after:content-[""] after:absolute after:left-0 after:-bottom-0.5 after:h-0.5 after:w-full after:bg-accent-500 after:rounded-full' : ''}`}
              >
                {link.label}
                {link.label !== 'Home' && (
                  <span className="absolute left-0 -bottom-0.5 h-0.5 w-0 bg-accent-500 rounded-full transition-all duration-300 group-hover:w-full" />
                )}
              </a>
            ) : (
              <Link
                key={link.label}
                to={link.to}
                className={`relative text-sm font-medium transition-colors duration-300 pb-1 group ${
                  scrolled ? 'text-gray-700 hover:text-primary-900' : 'text-white/90 hover:text-white'
                }`}
              >
                {link.label}
                <span className="absolute left-0 -bottom-0.5 h-0.5 w-0 bg-accent-500 rounded-full transition-all duration-300 group-hover:w-full" />
              </Link>
            )
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
                    scrolled ? 'border-gray-200 bg-white text-gray-700' : 'border-white/30 bg-white/10 text-white placeholder-white/70 backdrop-blur-sm'
                  }`}
                />
              </form>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                aria-label="Search"
                className={`p-2 rounded-full transition-colors duration-300 ${
                  scrolled ? 'text-gray-600 hover:bg-gray-100' : 'text-white hover:bg-white/10'
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

          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className={`lg:hidden p-2 rounded-full transition-colors duration-300 ${
              scrolled ? 'text-primary-900 hover:bg-gray-100' : 'text-white hover:bg-white/10'
            }`}
          >
            <Menu size={22} />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/40" onClick={() => setMobileOpen(false)}>
          <div
            className="bg-white w-72 h-full ml-auto p-6 flex flex-col shadow-xl animate-[fadeIn_0.2s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-8">
              <span className="text-xl font-black uppercase italic text-primary-900" style={{ transform: 'skewX(-6deg)', display: 'inline-block' }}>
                HORIZON<span className="text-accent-500 not-italic">+</span>
              </span>
              <button onClick={() => setMobileOpen(false)} aria-label="Close menu">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <nav className="flex flex-col gap-5">
              {NAV_LINKS.map((link) =>
                link.type === 'anchor' ? (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="text-base font-medium text-gray-700 hover:text-primary-900"
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={link.label}
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className="text-base font-medium text-gray-700 hover:text-primary-900"
                  >
                    {link.label}
                  </Link>
                )
              )}

              {user && (
                <>
                  <div className="border-t border-gray-100 my-1" />
                  <Link
                    to="/chatbot"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 text-base font-medium text-gray-700 hover:text-primary-900"
                  >
                    <MessageCircle size={18} /> AI Chatbot
                  </Link>
                  <Link
                    to="/tools"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 text-base font-medium text-gray-700 hover:text-primary-900"
                  >
                    <Wrench size={18} /> Tools
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-base font-medium text-red-600 hover:text-red-700"
                  >
                    <LogOut size={18} /> Logout
                  </button>
                </>
              )}
            </nav>
            <a
              href="#newsletter"
              onClick={() => setMobileOpen(false)}
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