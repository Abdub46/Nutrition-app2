import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import PasswordInput from '../components/PasswordInput';

const ChangePassword = () => {
  const { user, changePassword } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.newPassword !== form.confirmPassword) {
      toast.error('New password and confirmation do not match');
      return;
    }
    const strongEnough =
      form.newPassword.length >= 8 && /[A-Z]/.test(form.newPassword) && /[a-z]/.test(form.newPassword) && /[0-9]/.test(form.newPassword);
    if (!strongEnough) {
      toast.error('Password must be at least 8 characters and include an uppercase letter, a lowercase letter, and a number');
      return;
    }

    setLoading(true);
    try {
      const updatedUser = await changePassword(form.currentPassword, form.newPassword, form.confirmPassword);
      toast.success('Password changed successfully');
      navigate(updatedUser.role === 'admin' ? '/admin' : updatedUser.role === 'writer' ? '/writer/articles' : '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-blue-50 px-4">
      <div className="card w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Change Your Password</h1>
        <p className="text-sm text-gray-500 mb-6">
          {user?.mustChangePassword
            ? 'For security, please set a new password before continuing.'
            : 'Update your account password.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <PasswordInput
            label="Current Password"
            required
            value={form.currentPassword}
            onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
          />
          <PasswordInput
            label="New Password"
            required
            value={form.newPassword}
            onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
          />
          <PasswordInput
            label="Confirm New Password"
            required
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
          />
          <p className="text-xs text-gray-400">
            Must be at least 8 characters, with an uppercase letter, a lowercase letter, and a number.
          </p>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;