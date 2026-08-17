import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
      toast.success('Reset instructions sent if the account exists');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-blue-50 px-4">
      <div className="card w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Forgot Password</h1>
        <p className="text-sm text-gray-500 mb-6">Enter your email to receive a reset link</p>

        {sent ? (
          <div className="text-center space-y-3">
            <div className="mx-auto h-12 w-12 rounded-full bg-primary-50 flex items-center justify-center">
              <Mail size={22} className="text-primary-600" />
            </div>
            <p className="text-sm font-medium text-gray-800">Check your email</p>
            <p className="text-sm text-gray-600">
              If an account exists for <span className="font-medium">{email}</span>, we've sent a password reset
              link. Open your email inbox (e.g. Gmail) and click the link in that message to continue - it expires
              in 30 minutes.
            </p>
            <p className="text-xs text-gray-400">
              Don't see it? Check your spam/junk folder, or make sure you entered the right email.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label-text">Email Address</label>
              <input
                type="email"
                required
                className="input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
            {loading && (
              <p className="text-xs text-gray-400 text-center">
                This can take up to a minute if our server has been idle - hang tight.
              </p>
            )}
          </form>
        )}

        <p className="text-sm text-gray-500 mt-6 text-center">
          <Link to="/login" className="text-primary-600 font-medium hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
