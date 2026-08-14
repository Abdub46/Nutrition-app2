import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import api from '../../services/api';
import { stripHtml } from '../../utils/stripHtml';

// First two lines of the summary, trailed with "..." to invite a click through to
// the full article - matches the "two lines + ellipsis" spec exactly rather than
// relying on a CSS line-clamp (so the "..." is real text, not a clipped overflow).
// Summary is rich text (same editor as content), so tags are stripped first -
// this excerpt is always plain text.
const excerptOf = (html = '') => {
  const words = stripHtml(html).split(/\s+/);
  const short = words.slice(0, 28).join(' ');
  return `${short}...`;
};

// Admin-curated "Featured Article" homepage spot. Deliberately reads from its own
// endpoint (GET /articles/featured/current) rather than just grabbing the newest
// article, since only an admin can choose/change what's featured (see
// AdminFeaturedArticle.jsx under Settings -> Add Featured Article).
const FeaturedArticle = () => {
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/articles/featured/current')
      .then(({ data }) => setArticle(data.article))
      .catch(() => setArticle(null))
      .finally(() => setLoading(false));
  }, []);

  // No featured article set yet - section simply doesn't render, rather than
  // showing an empty/placeholder block on the public homepage.
  if (loading || !article) return null;

  return (
    <section className="relative py-24 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left image */}
          <div className="relative">
            <div className="rounded-3xl overflow-hidden shadow-xl">
              {article.featuredImage ? (
                <img
                  src={article.featuredImage}
                  alt={article.title}
                  className="w-full h-[360px] md:h-[440px] object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-[360px] md:h-[440px] bg-primary-50 flex items-center justify-center text-primary-300">
                  No image
                </div>
              )}
            </div>
          </div>

          {/* Right content */}
          <div>
            <span className="inline-block bg-accent-500 text-white text-xs font-semibold uppercase tracking-wide rounded-full px-4 py-1.5 mb-4">
              Featured Article
            </span>

            {article.category && (
              <p className="text-sm font-semibold text-primary-700 uppercase tracking-wide mb-2">
                {article.category.name}
              </p>
            )}

            <h2 className="text-3xl md:text-4xl font-bold text-primary-900 mb-4 leading-tight">
              {article.title}
            </h2>

            <p className="text-gray-600 text-base md:text-lg leading-relaxed mb-8">
              {excerptOf(article.summary)}
            </p>

            <Link
              to={`/articles/${article._id}`}
              className="inline-flex items-center gap-2 bg-accent-500 hover:bg-accent-600 text-white text-sm font-semibold rounded-full px-6 py-3 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
            >
              Read More <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedArticle;