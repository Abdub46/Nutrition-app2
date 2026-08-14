import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Facebook, Instagram, Linkedin, Twitter, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { subscribeNewsletter } from '../../services/newsletterApi';
import { stripHtml } from '../../utils/stripHtml';

const ArticleSidebar = ({
  articles = [],
  currentArticleId,
  newsletterHeading,
  newsletterDescription,
  socialLinks = {},
}) => {
  const [query, setQuery] = useState('');
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const filtered = query.trim()
    ? articles.filter((a) => {
        const q = query.toLowerCase();
        return (
          a.title.toLowerCase().includes(q) ||
          (stripHtml(a.summary).toLowerCase()).includes(q) ||
          (a.category?.name || '').toLowerCase().includes(q)
        );
      })
    : [];

  const recent = articles.filter((a) => a._id !== currentArticleId).slice(0, 4);

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
    <div className="space-y-6">
      {/* Search */}
      <div className="card">
        <h3 className="font-semibold text-gray-800 mb-3 text-sm">Search Articles</h3>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="input-field pl-9"
            placeholder="Search by title, keyword, category..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        {query.trim() && (
          <div className="mt-3 space-y-2 max-h-56 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="text-xs text-gray-400">No matching articles.</p>
            ) : (
              filtered.map((a) => (
                <Link key={a._id} to={`/articles/${a._id}`} className="block text-sm text-gray-700 hover:text-primary-700 line-clamp-1">
                  {a.title}
                </Link>
              ))
            )}
          </div>
        )}
      </div>

      {/* About Horizon */}
      <div className="card">
        <h3 className="font-semibold text-gray-800 mb-2 text-sm">About Horizon</h3>
        <p className="text-sm text-gray-600 leading-relaxed mb-3">
          Horizon is dedicated to promoting evidence-based nutrition, healthier lifestyles, and practical wellness
          education through professionally written articles.
        </p>
        <div className="flex items-center gap-3">
          {socialLinks.facebook && (
            <a href={socialLinks.facebook} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-primary-600" aria-label="Facebook">
              <Facebook size={17} />
            </a>
          )}
          {socialLinks.instagram && (
            <a href={socialLinks.instagram} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-primary-600" aria-label="Instagram">
              <Instagram size={17} />
            </a>
          )}
          {socialLinks.linkedin && (
            <a href={socialLinks.linkedin} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-primary-600" aria-label="LinkedIn">
              <Linkedin size={17} />
            </a>
          )}
          {socialLinks.twitter && (
            <a href={socialLinks.twitter} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-primary-600" aria-label="Twitter/X">
              <Twitter size={17} />
            </a>
          )}
          {socialLinks.whatsapp && (
            <a href={socialLinks.whatsapp} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-primary-600" aria-label="WhatsApp">
              <MessageCircle size={17} />
            </a>
          )}
        </div>
      </div>

      {/* Newsletter */}
      <div className="card">
        <h3 className="font-semibold text-gray-800 mb-1 text-sm">{newsletterHeading || 'Stay Updated'}</h3>
        <p className="text-xs text-gray-500 mb-3">
          {newsletterDescription ||
            'Subscribe to receive the latest nutrition tips, wellness articles, and healthy living insights directly in your inbox.'}
        </p>
        {subscribed ? (
          <p className="text-sm text-primary-700 font-medium">You're subscribed — thank you!</p>
        ) : (
          <form onSubmit={handleSubscribe} className="space-y-2">
            <input
              type="email"
              required
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field text-sm"
            />
            <button type="submit" disabled={subscribing} className="btn-primary w-full text-sm">
              {subscribing ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>
        )}
      </div>

      {/* Recent Posts */}
      {recent.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-3 text-sm">Recent Posts</h3>
          <div className="space-y-3">
            {recent.map((a) => (
              <Link key={a._id} to={`/articles/${a._id}`} className="flex items-center gap-3 group">
                {a.featuredImage ? (
                  <img src={a.featuredImage} alt="" loading="lazy" decoding="async" className="h-12 w-12 rounded-lg object-cover flex-shrink-0" />
                ) : (
                  <div className="h-12 w-12 rounded-lg bg-primary-50 flex-shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="text-sm text-gray-700 group-hover:text-primary-700 line-clamp-1">{a.title}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(a.updatedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ArticleSidebar;