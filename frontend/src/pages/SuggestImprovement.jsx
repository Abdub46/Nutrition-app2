import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { submitSuggestion } from '../services/suggestionApi';

const SuggestImprovement = () => {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error('Please write a message before sending');
      return;
    }

    setSending(true);
    try {
      await submitSuggestion(message.trim());
      toast.success('Thank you! Your suggestion has been sent.');
      setMessage('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send suggestion');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="pt-4 max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Suggest an Improvement</h1>
        <p className="text-sm text-gray-500">Have an idea for how we can make the app better? Let us know below.</p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-text">Your Email</label>
            <input type="email" disabled value={user?.email || ''} className="input-field bg-gray-100 text-gray-500 cursor-not-allowed" />
          </div>
          <div>
            <label className="label-text">Your Message</label>
            <textarea
              required
              rows={6}
              placeholder="Tell us what you'd like to see improved..."
              className="input-field resize-none"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
          <button type="submit" disabled={sending} className="btn-primary w-full">
            {sending ? 'Sending...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SuggestImprovement;