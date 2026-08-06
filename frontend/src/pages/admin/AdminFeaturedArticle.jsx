import React, { useEffect, useState } from 'react';
import { Star, StarOff } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

// Admin-only - deliberately kept out of the regular Add Article flow (AdminArticles.jsx)
// so a writer can author articles but can never make one the homepage featured pick.
// Picks from already-published articles rather than authoring new content here.
const AdminFeaturedArticle = () => {
  const [articles, setArticles] = useState([]);
  const [featuredId, setFeaturedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [{ data: all }, { data: current }] = await Promise.all([
        api.get('/articles/admin/all'),
        api.get('/articles/featured/current'),
      ]);
      setArticles(all.articles.filter((a) => a.status === 'Published'));
      setFeaturedId(current.article?._id || null);
    } catch (err) {
      toast.error('Failed to load articles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleFeature = async (id) => {
    setSavingId(id);
    try {
      await api.put(`/articles/${id}/feature`);
      setFeaturedId(id);
      toast.success('Featured article updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to feature this article');
    } finally {
      setSavingId(null);
    }
  };

  const handleClear = async () => {
    setSavingId('clear');
    try {
      await api.put('/articles/featured/clear');
      setFeaturedId(null);
      toast.success('Homepage featured article cleared');
    } catch (err) {
      toast.error('Failed to clear the featured article');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="pt-4 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Add Featured Article</h1>
          <p className="text-sm text-gray-500">
            Pick one published article to spotlight in the "Featured Article" section on the homepage.
          </p>
        </div>
        {featuredId && (
          <button onClick={handleClear} disabled={savingId === 'clear'} className="btn-secondary flex items-center gap-2 text-sm">
            <StarOff size={15} /> {savingId === 'clear' ? 'Clearing...' : 'Clear featured'}
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : articles.length === 0 ? (
        <p className="text-sm text-gray-500">No published articles yet - publish one first, then come back to feature it.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {articles.map((a) => {
            const isFeatured = a._id === featuredId;
            return (
              <div key={a._id} className={`card !p-0 overflow-hidden ${isFeatured ? 'ring-2 ring-accent-500' : ''}`}>
                {a.featuredImage ? (
                  <img src={a.featuredImage} alt={a.title} className="w-full h-32 object-cover" />
                ) : (
                  <div className="w-full h-32 bg-primary-50 flex items-center justify-center text-primary-300 text-sm">No image</div>
                )}
                <div className="p-4">
                  <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
                    {a.category && (
                      <span className="inline-block text-[11px] font-medium text-primary-700 bg-primary-50 rounded-full px-2 py-0.5">
                        {a.category.name}
                      </span>
                    )}
                    {isFeatured && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-white bg-accent-500 rounded-full px-2 py-0.5">
                        <Star size={11} /> Featured
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-1 line-clamp-1">{a.title}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-3">{a.summary}</p>
                  {isFeatured ? (
                    <p className="text-xs text-accent-600 font-medium">Currently featured on the homepage</p>
                  ) : (
                    <button
                      onClick={() => handleFeature(a._id)}
                      disabled={savingId === a._id}
                      className="btn-primary w-full flex items-center justify-center gap-2 text-xs py-1.5"
                    >
                      <Star size={14} /> {savingId === a._id ? 'Featuring...' : 'Feature this'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminFeaturedArticle;