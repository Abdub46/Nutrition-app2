import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin, ArrowUp, Leaf, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { subscribeNewsletter } from '../services/newsletterApi';

const FOOTER_COLUMNS = [
  {
    heading: 'Company',
    links: [
      { label: 'About Us', to: '/about' },
      { label: 'Services', to: '/dashboard' },
      { label: 'Careers', to: '/careers' },
    ],
  },
  {
    heading: 'Nutrition',
    links: [
      { label: 'Nutrition Articles', to: '/articles' },
      { label: 'Appointments', to: '/appointments' },
      { label: 'BMI Calculator', to: '/bmi-calculator' },
      { label: 'Energy Calculator', to: '/tools' },
    ],
  },
  {
    heading: 'Support',
    links: [
      { label: 'FAQs', to: '/faqs' },
      { label: 'Contact', to: '/contact' },
      { label: 'Privacy Policy', to: '/privacy-policy' },
      { label: 'Terms of Service', to: '/terms-of-service' },
      { label: 'Cookie Policy', to: '/cookie-policy' },
    ],
  },
];

const Footer = () => {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    setSubscribing(true);
    try {
      await subscribeNewsletter(email);
      setSubscribed(true);
      setEmail('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Subscription failed');
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <footer className="relative bg-white border-t border-gray-100 mt-16 pt-14 pb-8">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 mb-10">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-8 w-8 rounded-lg bg-primary-600 flex items-center justify-center">
                <Leaf size={18} className="text-white" />
              </div>
              <span className="font-bold text-gray-800">NutriCounsel</span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed mb-4 max-w-xs">
              Personalized nutrition counselling, BMI tracking, and premium wellness supplements —
              helping you build healthier habits, one step at a time.
            </p>
            <div className="space-y-1.5 text-sm text-gray-500">
              <p className="flex items-center gap-2"><Phone size={14} /> +254 700 000 000</p>
              <p className="flex items-center gap-2"><Mail size={14} /> hello@nutricounsel.co.ke</p>
              <p className="flex items-center gap-2"><MapPin size={14} /> Nairobi, Kenya</p>
            </div>
            <div className="flex gap-3 mt-4">
              {[Facebook, Instagram, Twitter].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="h-9 w-9 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-primary-600 hover:text-white transition-colors"
                  aria-label="Social media link"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.heading}>
              <h4 className="text-sm font-semibold text-gray-800 mb-3">{col.heading}</h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="text-sm text-gray-500 hover:text-primary-600 transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Compact newsletter row - blended into footer, small statement + inline form */}
        <div className="border-t border-gray-100 pt-6 pb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-600">
            <span className="font-medium text-gray-700">Stay in the loop</span> — subscribe for nutrition tips & updates.
          </p>
          {subscribed ? (
            <p className="text-sm text-primary-700 font-medium">You're subscribed — thank you!</p>
          ) : (
            <form onSubmit={handleSubscribe} className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="email"
                required
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 sm:w-56 rounded-full border border-gray-200 bg-white/70 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <button
                type="submit"
                disabled={subscribing}
                aria-label="Subscribe"
                className="flex items-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-full px-4 py-2 whitespace-nowrap transition-colors disabled:opacity-60"
              >
                {subscribing ? '...' : <>Subscribe <Send size={13} /></>}
              </button>
            </form>
          )}
        </div>

        <div className="border-t border-gray-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-400">© {new Date().getFullYear()} NutriCounsel. All rights reserved.</p>
          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-primary-600 transition-colors"
          >
            Back to top <ArrowUp size={14} />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
