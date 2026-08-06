import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { getComments, addComment, deleteComment } from '../../services/commentApi';

const MAX_LENGTH = 1000;

const timeAgo = (dateStr) => {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  const units = [
    ['year', 31536000],
    ['month', 2592000],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ];
  for (const [label, secs] of units) {
    const value = Math.floor(seconds / secs);
    if (value >= 1) return `${value} ${label}${value > 1 ? 's' : ''} ago`;
  }
  return 'just now';
};

const Comments = ({ articleId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    getComments(articleId)
      .then(({ data }) => setComments(data.comments || []))
      .catch(() => toast.error('Failed to load comments'))
      .finally(() => setLoading(false));
  }, [articleId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;

    setSubmitting(true);
    try {
      const { data } = await addComment(articleId, trimmed);
      setComments((prev) => [data.comment, ...prev]);
      setText('');
      toast.success('Comment posted');
    } catch (err) {
      // Backend sends a specific reason (profanity, disallowed content, links, etc.)
      toast.error(err.response?.data?.message || 'Could not post your comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    try {
      await deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      toast.success('Comment deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete comment');
    }
  };

  return (
    <div className="pt-6 border-t border-gray-100 space-y-5">
      <h2 className="text-lg font-semibold text-gray-800">Comments {comments.length > 0 && `(${comments.length})`}</h2>

      {user ? (
        <form onSubmit={handleSubmit} className="space-y-2">
          <textarea
            className="input-field"
            rows={3}
            maxLength={MAX_LENGTH}
            placeholder="Share your thoughts on this article..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">{text.length}/{MAX_LENGTH}</span>
            <button type="submit" className="btn-primary" disabled={submitting || !text.trim()}>
              {submitting ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </form>
      ) : (
        <p className="text-sm text-gray-500">
          <Link to="/login" className="text-primary-600 hover:underline font-medium">
            Log in
          </Link>{' '}
          to leave a comment.
        </p>
      )}

      {loading ? (
        <p className="text-sm text-gray-400">Loading comments...</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-gray-400">No comments yet. Be the first to share your thoughts.</p>
      ) : (
        <ul className="space-y-4">
          {comments.map((c) => (
            <li key={c._id} className="flex items-start gap-2.5">
              {c.user?.avatar ? (
                <img src={c.user.avatar} alt={c.user.fullName} className="h-8 w-8 rounded-full object-cover flex-shrink-0" />
              ) : (
                <div className="h-8 w-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                  {c.user?.fullName?.charAt(0) || '?'}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-gray-700">{c.user?.fullName || 'Deleted user'}</span>
                  <span className="text-xs text-gray-400">{timeAgo(c.createdAt)}</span>
                </div>
                {/* Rendered as plain text (never dangerouslySetInnerHTML) - React
                    escapes this automatically, so even if anything unexpected
                    slipped past server-side moderation it cannot execute as HTML/JS. */}
                <p className="text-sm text-gray-600 whitespace-pre-wrap break-words mt-0.5">{c.content}</p>
              </div>
              {user && (user._id === c.user?._id || user.role === 'admin') && (
                <button
                  onClick={() => handleDelete(c._id)}
                  className="text-gray-300 hover:text-red-500 flex-shrink-0"
                  title="Delete comment"
                >
                  <Trash2 size={15} />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Comments;