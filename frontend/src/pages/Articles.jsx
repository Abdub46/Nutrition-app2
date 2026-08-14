import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import Pagination from '../components/Pagination';
import { stripHtml } from '../utils/stripHtml';

const Articles = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    api
      .get('/articles', { params: { page } })
      .then(({ data }) => {
        setArticles(data.articles);
        setTotalPages(data.totalPages || 1);
      })
      .catch(() => toast.error('Failed to load articles'))
      .finally(() => setLoading(false));
  }, [page]);

  const handlePageChange = (nextPage) => {
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="pt-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Nutrition Articles</h1>
        <p className="text-sm text-gray-500">Learn more about healthy eating and lifestyle</p>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Loading articles...</p>
      ) : articles.length === 0 ? (
        <p className="text-sm text-gray-500">No articles published yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {articles.map((a) => (
            <Link key={a._id} to={`/articles/${a._id}`} className="card hover:shadow-md transition-shadow overflow-hidden !p-0">
              {a.featuredImage ? (
                <img src={a.featuredImage} alt={a.title} loading="lazy" decoding="async" className="w-full h-40 object-cover" />
              ) : (
                <div className="w-full h-40 bg-primary-50 flex items-center justify-center text-primary-300 text-sm">No image</div>
              )}
              <div className="p-4">
                {a.category && (
                  <span className="inline-block text-[11px] font-medium text-primary-700 bg-primary-50 rounded-full px-2 py-0.5 mb-1.5">
                    {a.category.name}
                  </span>
                )}
                <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2">{a.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-2 mb-2">{stripHtml(a.summary)}</p>
                <p className="text-xs text-gray-400">
                  Updated: {new Date(a.updatedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {!loading && articles.length > 0 && (
        <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
      )}
    </div>
  );
};

export default Articles;
