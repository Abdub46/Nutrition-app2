import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { submitWriterRequest } from '../services/writerRequestApi';

const RequestToBeWriter = () => {
  const { user, refreshUser } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [qualification, setQualification] = useState(user?.qualification || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error('Please enter your name');
      return;
    }
    if (!qualification) {
      toast.error('Please select whether you are a Nutritionist or a Dietitian');
      return;
    }

    setSending(true);
    try {
      await submitWriterRequest({ fullName: fullName.trim(), qualification, bio: bio.trim() });
      await refreshUser();
      toast.success('Your request has been submitted for review.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit your request');
    } finally {
      setSending(false);
    }
  };

  // Already a writer - nothing to request.
  if (user?.role === 'writer') {
    return (
      <div className="pt-4 max-w-lg mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Request to be a Writer</h1>
        </div>
        <div className="card text-center space-y-3">
          <p className="text-sm text-gray-700">You're already a writer on Horizon+.</p>
          <Link to="/admin/articles" className="btn-primary inline-block">
            Go to Add Article
          </Link>
        </div>
      </div>
    );
  }

  // Already submitted and awaiting review.
  if (user?.writerRequestStatus === 'Pending') {
    return (
      <div className="pt-4 max-w-lg mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Request to be a Writer</h1>
        </div>
        <div className="card text-center space-y-2">
          <p className="text-sm font-medium text-gray-800">Your request is under review</p>
          <p className="text-sm text-gray-500">
            Thanks for applying! An admin will review your request soon. You'll gain article-writing access as soon
            as it's accepted.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-4 max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Request to be a Writer</h1>
        <p className="text-sm text-gray-500">
          Write nutrition and wellness articles for Horizon+. This is open to practicing nutritionists, dietitians,
          or professionals in a related field.
        </p>
      </div>

      {user?.writerRequestStatus === 'Rejected' && (
        <div className="card bg-amber-50/60 border-amber-100">
          <p className="text-sm text-gray-700">
            Your previous request wasn't accepted. You're welcome to submit a new one below.
          </p>
        </div>
      )}

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-text">Name</label>
            <input required className="input-field" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div>
            <label className="label-text">Email</label>
            <input type="email" disabled value={user?.email || ''} className="input-field bg-gray-100 text-gray-500 cursor-not-allowed" />
          </div>
          <div>
            <label className="label-text">Qualification</label>
            <select required className="input-field" value={qualification} onChange={(e) => setQualification(e.target.value)}>
              <option value="" disabled>
                Select qualification...
              </option>
              <option value="Nutritionist">Nutritionist</option>
              <option value="Dietitian">Dietitian</option>
            </select>
          </div>
          <div>
            <label className="label-text">Bio (optional, shown on your articles)</label>
            <textarea
              rows={4}
              maxLength={500}
              placeholder="A short professional bio - your background, focus area, credentials..."
              className="input-field resize-none"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>
          <button type="submit" disabled={sending} className="btn-primary w-full">
            {sending ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RequestToBeWriter;