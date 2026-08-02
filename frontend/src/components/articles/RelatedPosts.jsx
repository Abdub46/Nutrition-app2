import React from 'react';
import { Link } from 'react-router-dom';

// Rough estimate based on average adult reading speed (~200 wpm), stripping any HTML tags first
const estimateReadingTime = (content) => {
  const words = (content || '').replace(/<[^>]+>/g, ' ').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
};

const RelatedPosts = ({ articles = [] }) => {
  if (!articles.length) return null;

  return (
    <div className="pt-6 mt-6 border-t border-gray-100">
      <h2 className="text-lg font-bold text-gray-800 mb-4">Related Posts</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {articles.map((a) => (
          <Link key={a._id} to={`/articles/${a._id}`} className="card hover:shadow-md transition-shadow">
            <h3 className="font-semibold text-gray-800 text-sm mb-1.5 line-clamp-2">{a.title}</h3>
            <p className="text-xs text-gray-400">
              {new Date(a.updatedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} • {estimateReadingTime(a.content)} min read
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RelatedPosts;