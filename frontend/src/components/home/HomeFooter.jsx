import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Linkedin, Youtube, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { subscribeNewsletter } from '../../services/newsletterApi';

const QUICK_LINKS = [
  { label: 'About', href: '#why-choose-us' },
  { label: 'Contact', href: '#footer' },
  { label: 'How to Use', to: '/how-to-use' },

  {/*{ label: 'Articles', to: '/articles' },
  { label: 'BMI Calculator', to: '/bmi-calculator' },
  { label: 'Counselling', to: '/appointments' },*/}, 

  { label: 'Suggest Improvement', to: '/suggest-improvement' },
  { label: 'Request to be a Writer', to: '/request-to-be-writer' },
   
];

const POPULAR_TOPICS = [
  'Healthy Eating',
  'Disease Prevention',
  'Weight Management',
  'Family Nutrition',
  "Women's Health",
];

const SOCIALS = [Facebook, Instagram, Twitter, Linkedin, Youtube];

const HomeFooter = () => {
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
    <footer id="footer" className="relative bg-primary-900 text-white/80 pt-20 pb-8 overflow-hidden">
      {/* subtle green glow accent */}
      <div className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full bg-accent-500/10 blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-14">
          {/* Column 1 - brand */}
          <div>
            <span
              className="text-2xl font-black uppercase italic text-white inline-block mb-3"
              style={{ transform: 'skewX(-6deg)' }}
            >
              HORIZON<span className="text-accent-400 not-italic">+</span>
            </span>
            <p className="text-sm leading-relaxed mb-5 max-w-xs text-white/60">
              A premium nutrition and wellness platform helping you make informed food choices and build lasting,
              healthy habits.
            </p>
            <div className="flex gap-2.5">
              {SOCIALS.map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="Social media link"
                  className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:bg-accent-500 hover:text-white transition-colors duration-300"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2 - quick links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2.5">
              {QUICK_LINKS.map((link) => (
                <li key={link.label}>
                  {link.to ? (
                    <Link to={link.to} className="text-sm text-white/60 hover:text-accent-400 transition-colors duration-300">
                      {link.label}
                    </Link>
                  ) : (
                    <a href={link.href} className="text-sm text-white/60 hover:text-accent-400 transition-colors duration-300">
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 - popular topics */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Popular Topics</h4>
            <ul className="space-y-2.5">
              {POPULAR_TOPICS.map((topic) => (
                <li key={topic}>
                  <Link to="/articles" className="text-sm text-white/60 hover:text-accent-400 transition-colors duration-300">
                    {topic}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4 - newsletter */}
          <div id="newsletter">
            <h4 className="text-sm font-semibold text-white mb-4">Subscribe to our newsletter</h4>
            <p className="text-sm text-white/60 mb-4">Get evidence-based nutrition tips delivered to your inbox.</p>
            {subscribed ? (
              <p className="text-sm text-accent-400 font-medium">You're subscribed — thank you!</p>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col gap-2.5">
                <input
                  type="email"
                  required
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  disabled={subscribing}
                  className="flex items-center justify-center gap-1.5 bg-accent-500 hover:bg-accent-600 text-white text-sm font-semibold rounded-full px-4 py-2.5 transition-colors duration-300 disabled:opacity-60"
                >
                  {subscribing ? 'Subscribing...' : <>Subscribe <Send size={13} /></>}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/50">&copy; {new Date().getFullYear()} HorizonStudio</p>
          <div className="flex items-center gap-6 text-xs text-white/50">
            <Link to="/privacy-policy" className="hover:text-accent-400 transition-colors duration-300">
              Privacy Policy
            </Link>
            <Link to="/terms-of-service" className="hover:text-accent-400 transition-colors duration-300">
              Terms of Use
            </Link>
            <Link to="/cookie-policy" className="hover:text-accent-400 transition-colors duration-300">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default HomeFooter;