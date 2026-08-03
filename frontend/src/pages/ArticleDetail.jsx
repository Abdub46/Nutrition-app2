import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useSettings } from '../context/SettingsContext';
import RelatedPosts from '../components/articles/RelatedPosts';
import ArticleSidebar from '../components/articles/ArticleSidebar';

const ArticleDetail = () => {
  const { id } = useParams();
  const { settings } = useSettings();
  const [article, setArticle] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [allArticles, setAllArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([api.get(`/articles/${id}`), api.get('/articles')])
      .then(([detailRes, listRes]) => {
        setArticle(detailRes.data.article);
        setRelatedArticles(detailRes.data.relatedArticles || []);
        setAllArticles(listRes.data.articles || []);
      })
      .catch(() => toast.error('Failed to load article'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="pt-8 text-sm text-gray-500">Loading...</p>;
  if (!article) return <p className="pt-8 text-sm text-gray-500">Article not found.</p>;

  return (
    <div className="pt-4 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10 items-start">
      {/* Main article column */}
      <div className="space-y-5 min-w-0">
        <Link to="/articles" className="inline-flex items-center gap-1 text-sm text-primary-600 hover:underline">
          <ArrowLeft size={16} /> Back to Articles
        </Link>

        {/* 1. Featured Image */}
        {article.featuredImage && (
          <img
            src={article.featuredImage}
            alt={article.title}
            fetchpriority="high"
            decoding="async"
            className="w-full h-64 sm:h-80 object-cover rounded-xl"
          />
        )}

        {/* 2. Author info */}
        {article.author && (
          <div className="flex items-center gap-2.5">
            {article.author.avatar ? (
              <img src={article.author.avatar} alt={article.author.fullName} className="h-9 w-9 rounded-full object-cover" />
            ) : (
              <div className="h-9 w-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-semibold">
                {article.author.fullName?.charAt(0) || '?'}
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-700">{article.author.fullName}</p>
              {article.author.bio && <p className="text-xs text-gray-400 line-clamp-1">{article.author.bio}</p>}
            </div>
          </div>
        )}

        {/* 3. Category + 4. Modified Date */}
        <div className="flex items-center gap-3 flex-wrap">
          {article.category && (
            <span className="text-xs font-medium text-primary-700 bg-primary-50 rounded-full px-2.5 py-1">
              {article.category.name}
            </span>
          )}
          <span className="text-xs text-gray-400">
            Updated: {new Date(article.updatedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{article.title}</h1>

        {/* Rich content - supports paragraphs, links, and inserted buttons from the admin editor */}
        <div
          className="article-content text-gray-700 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        <RelatedPosts articles={relatedArticles} />
      </div>

      {/* Sidebar - true sidebar on desktop (lg+), stacks below the article on tablet/mobile via the grid above */}
      <aside>
        <ArticleSidebar
          articles={allArticles}
          currentArticleId={article._id}
          newsletterHeading={settings?.newsletterHeading}
          newsletterDescription={settings?.newsletterDescription}
          socialLinks={settings?.socialLinks}
        />
      </aside>
    </div>
  );
};

export default ArticleDetail;
