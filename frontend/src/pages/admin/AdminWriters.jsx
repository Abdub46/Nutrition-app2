import React, { useEffect, useState } from 'react';
import { Plus, Eye, EyeOff, Trash2, X, Edit2, ArrowLeft, Check, Ban } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getWriters,
  checkWriterEmail,
  createWriter,
  updateWriter,
  toggleWriterStatus,
  reviewWriterRequest,
  deleteWriter,
} from '../../services/writerApi';

const STATUS_BADGE = {
  Pending: 'bg-yellow-100 text-yellow-700',
  Accepted: 'bg-green-100 text-green-700',
  Rejected: 'bg-red-100 text-red-700',
};

const AdminWriters = () => {
  const [writers, setWriters] = useState([]);
  const [loading, setLoading] = useState(true);

  const [createOpen, setCreateOpen] = useState(false);
  // Two-step flow: 'email' (enter + check an email) -> 'upgrade' (existing client
  // account found, confirm + qualification, one click to upgrade).
  const [step, setStep] = useState('email');
  const [emailInput, setEmailInput] = useState('');
  const [checking, setChecking] = useState(false);
  const [checkError, setCheckError] = useState('');
  const [foundUser, setFoundUser] = useState(null);
  const [qualification, setQualification] = useState('');
  const [creating, setCreating] = useState(false);

  const [editingWriter, setEditingWriter] = useState(null);
  const [editForm, setEditForm] = useState({ fullName: '', email: '', bio: '' });
  const [saving, setSaving] = useState(false);

  // Accept-request flow - self-service "Request to be a Writer" applications
  // (pending/rejected) live in this same list; accepting one needs a
  // qualification pick, same requirement as the direct-add flow above.
  const [acceptTarget, setAcceptTarget] = useState(null);
  const [acceptQualification, setAcceptQualification] = useState('');
  const [reviewing, setReviewing] = useState(false);

  const load = () => {
    setLoading(true);
    getWriters().then(setWriters).catch(() => toast.error('Failed to load writers')).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const resetCreateState = () => {
    setStep('email');
    setEmailInput('');
    setCheckError('');
    setFoundUser(null);
    setQualification('');
  };

  const closeCreate = () => {
    setCreateOpen(false);
    resetCreateState();
  };

  const handleCheckEmail = async (e) => {
    e.preventDefault();
    setCheckError('');
    setChecking(true);
    try {
      const result = await checkWriterEmail(emailInput.trim());
      if (!result.exists) {
        setFoundUser(null);
        setCheckError('No account found with this email. The person must sign up as a client first before being made a writer.');
      } else if (result.eligible) {
        setFoundUser(result.user);
        setStep('upgrade');
      } else {
        setCheckError(result.reason || 'This email cannot be used for a writer account');
      }
    } catch (err) {
      setCheckError(err.response?.data?.message || 'Failed to check email');
    } finally {
      setChecking(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!qualification) {
      toast.error('Please select whether this person is a Nutritionist or a Dietitian');
      return;
    }
    setCreating(true);
    try {
      const payload = { email: emailInput.trim(), qualification };
      await createWriter(payload);
      toast.success('Existing account upgraded to writer');
      closeCreate();
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save writer');
    } finally {
      setCreating(false);
    }
  };

  const openEdit = (writer) => {
    setEditingWriter(writer);
    setEditForm({ fullName: writer.fullName, email: writer.email, bio: writer.bio || '' });
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      await updateWriter(editingWriter._id, editForm);
      toast.success('Writer updated');
      setEditingWriter(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const { isActive } = await toggleWriterStatus(id);
      toast.success(isActive ? 'Writer reactivated' : 'Writer deactivated');
      setWriters((prev) => prev.map((w) => (w._id === id ? { ...w, isActive } : w)));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this writer? Their existing articles will be kept, but they will no longer be able to log in.')) return;
    try {
      await deleteWriter(id);
      toast.success('Writer removed');
      setWriters((prev) => prev.filter((w) => w._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const openAccept = (writer) => {
    setAcceptTarget(writer);
    setAcceptQualification(writer.qualification || '');
  };

  const handleConfirmAccept = async (e) => {
    e.preventDefault();
    if (!acceptQualification) {
      toast.error('Please select whether this person is a Nutritionist or a Dietitian');
      return;
    }
    setReviewing(true);
    try {
      await reviewWriterRequest(acceptTarget._id, { status: 'Accepted', qualification: acceptQualification });
      toast.success(`${acceptTarget.fullName} is now a writer`);
      setAcceptTarget(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to accept request');
    } finally {
      setReviewing(false);
    }
  };

  // Same underlying action (status -> Rejected) whether this is denying a
  // pending application or revoking an existing writer's access.
  const handleReject = async (writer) => {
    const isRevoke = writer.status === 'Accepted';
    const confirmMessage = isRevoke
      ? `Revoke ${writer.fullName}'s writer access? They'll go back to a regular client account.`
      : `Reject ${writer.fullName}'s request to be a writer?`;
    if (!window.confirm(confirmMessage)) return;

    try {
      await reviewWriterRequest(writer._id, { status: 'Rejected' });
      toast.success(isRevoke ? 'Writer access revoked' : 'Request rejected');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const pendingCount = writers.filter((w) => w.status === 'Pending').length;

  return (
    <div className="pt-4 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Writers</h1>
          <p className="text-sm text-gray-500">
            {writers.length} account(s){pendingCount > 0 && ` · ${pendingCount} pending request(s)`}
          </p>
        </div>
        <button onClick={() => setCreateOpen(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Writer
        </button>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block card overflow-x-auto !p-0">
        {loading ? (
          <p className="p-5 text-sm text-gray-500">Loading writers...</p>
        ) : writers.length === 0 ? (
          <p className="p-5 text-sm text-gray-500">No writers yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-3">Writer</th>
                <th className="text-left px-4 py-3">Email</th>
                <th className="text-left px-4 py-3">Qualification</th>
                <th className="text-left px-4 py-3">Request Status</th>
                <th className="text-left px-4 py-3">Active</th>
                <th className="text-left px-4 py-3">Published</th>
                <th className="text-left px-4 py-3">Created</th>
                <th className="text-left px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {writers.map((w) => (
                <tr key={w._id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      {w.avatar ? (
                        <img src={w.avatar} alt="" className="h-8 w-8 rounded-full object-cover" />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-semibold">
                          {w.fullName?.charAt(0) || '?'}
                        </div>
                      )}
                      <span className="font-medium text-gray-800">{w.fullName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{w.email}</td>
                  <td className="px-4 py-3 text-gray-600">{w.qualification || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_BADGE[w.status]}`}>{w.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    {w.status === 'Accepted' ? (
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${w.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {w.isActive ? 'Active' : 'Inactive'}
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{w.publishedArticleCount}</td>
                  <td className="px-4 py-3 text-gray-600">{new Date(w.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      {w.status === 'Accepted' ? (
                        <>
                          <button onClick={() => openEdit(w)} className="p-1.5 rounded hover:bg-gray-100 text-gray-600" title="Edit"><Edit2 size={15} /></button>
                          <button onClick={() => handleToggleStatus(w._id)} className="p-1.5 rounded hover:bg-gray-100 text-gray-600" title={w.isActive ? 'Deactivate' : 'Reactivate'}>
                            {w.isActive ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                          <button onClick={() => handleReject(w)} className="p-1.5 rounded hover:bg-red-50 text-red-600" title="Revoke writer access"><Ban size={15} /></button>
                          <button onClick={() => handleDelete(w._id)} className="p-1.5 rounded hover:bg-red-50 text-red-600" title="Remove"><Trash2 size={15} /></button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => openAccept(w)} className="p-1.5 rounded hover:bg-green-50 text-green-600" title="Accept"><Check size={15} /></button>
                          {w.status === 'Pending' && (
                            <button onClick={() => handleReject(w)} className="p-1.5 rounded hover:bg-red-50 text-red-600" title="Reject"><Ban size={15} /></button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-2">
        {loading ? (
          <p className="text-sm text-gray-500">Loading writers...</p>
        ) : writers.length === 0 ? (
          <p className="text-sm text-gray-500">No writers yet.</p>
        ) : (
          writers.map((w) => (
            <div key={w._id} className="card !p-4">
              <div className="flex items-center gap-3 mb-2">
                {w.avatar ? (
                  <img src={w.avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-semibold">
                    {w.fullName?.charAt(0) || '?'}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-800 truncate">{w.fullName}</p>
                  <p className="text-xs text-gray-500 truncate">{w.email}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full flex-shrink-0 ${STATUS_BADGE[w.status]}`}>{w.status}</span>
              </div>
              <p className="text-xs text-gray-400 mb-2">
                {w.qualification || '—'} &bull; {w.publishedArticleCount} published article(s)
                {w.status === 'Accepted' && <> &bull; {w.isActive ? 'Active' : 'Inactive'}</>}
              </p>
              <div className="flex gap-2">
                {w.status === 'Accepted' ? (
                  <>
                    <button onClick={() => openEdit(w)} className="btn-secondary flex-1 text-xs py-1.5">Edit</button>
                    <button onClick={() => handleToggleStatus(w._id)} className="btn-secondary flex-1 text-xs py-1.5">
                      {w.isActive ? 'Deactivate' : 'Reactivate'}
                    </button>
                    <button onClick={() => handleReject(w)} className="flex-1 text-xs py-1.5 rounded-lg border border-red-200 text-red-600">Revoke</button>
                    <button onClick={() => handleDelete(w._id)} className="flex-1 text-xs py-1.5 rounded-lg border border-red-200 text-red-600">Remove</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => openAccept(w)} className="btn-primary flex-1 text-xs py-1.5">Accept</button>
                    {w.status === 'Pending' && (
                      <button onClick={() => handleReject(w)} className="flex-1 text-xs py-1.5 rounded-lg border border-red-200 text-red-600">Reject</button>
                    )}
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add writer modal - two-step flow: step 1 checks the email for an existing client
          account, step 2 confirms the upgrade (qualification + one click) */}
      {createOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={closeCreate}>
          <div className="bg-white rounded-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                {step !== 'email' && (
                  <button type="button" onClick={resetCreateState} aria-label="Back" className="p-1 -ml-1 rounded hover:bg-gray-100 text-gray-500">
                    <ArrowLeft size={18} />
                  </button>
                )}
                <h2 className="text-lg font-bold text-gray-800">Add Writer</h2>
              </div>
              <button onClick={closeCreate}><X size={20} /></button>
            </div>

            {step === 'email' && (
              <form onSubmit={handleCheckEmail} className="space-y-4">
                <div>
                  <label className="label-text">Email Address</label>
                  <input
                    required
                    type="email"
                    className="input-field"
                    value={emailInput}
                    onChange={(e) => { setEmailInput(e.target.value); setCheckError(''); }}
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    We'll check if this belongs to an existing account first. Writers must be a registered Nutritionist or Dietitian.
                  </p>
                </div>
                {checkError && <p className="text-sm text-red-600">{checkError}</p>}
                <button type="submit" disabled={checking} className="btn-primary w-full">
                  {checking ? 'Checking...' : 'Continue'}
                </button>
              </form>
            )}

            {step === 'upgrade' && (
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="bg-primary-50 rounded-lg p-3">
                  <p className="text-sm text-gray-700">
                    An existing client account was found for <span className="font-semibold">{foundUser?.fullName}</span> ({foundUser?.email}).
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    They'll be upgraded to a writer, keeping their client login, history, and access to the client menu - with article management added.
                  </p>
                </div>
                <div>
                  <label className="label-text">Qualification</label>
                  <select required className="input-field" value={qualification} onChange={(e) => setQualification(e.target.value)}>
                    <option value="" disabled>Select qualification...</option>
                    <option value="Nutritionist">Nutritionist</option>
                    <option value="Dietitian">Dietitian</option>
                  </select>
                </div>
                <button type="submit" disabled={creating} className="btn-primary w-full">
                  {creating ? 'Upgrading...' : 'Upgrade to Writer'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Accept request modal - used both for a self-service "Request to be a Writer"
          application and for reconsidering a previously rejected one */}
      {acceptTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setAcceptTarget(null)}>
          <div className="bg-white rounded-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800">Accept Writer Request</h2>
              <button onClick={() => setAcceptTarget(null)}><X size={20} /></button>
            </div>
            <form onSubmit={handleConfirmAccept} className="space-y-4">
              <div className="bg-primary-50 rounded-lg p-3">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">{acceptTarget.fullName}</span> ({acceptTarget.email})
                </p>
                {acceptTarget.bio && <p className="text-xs text-gray-500 mt-1">{acceptTarget.bio}</p>}
              </div>
              <div>
                <label className="label-text">Qualification (as provided by applicant - confirm or change)</label>
                <select required className="input-field" value={acceptQualification} onChange={(e) => setAcceptQualification(e.target.value)}>
                  <option value="" disabled>Select qualification...</option>
                  <option value="Nutritionist">Nutritionist</option>
                  <option value="Dietitian">Dietitian</option>
                </select>
              </div>
              <button type="submit" disabled={reviewing} className="btn-primary w-full">
                {reviewing ? 'Accepting...' : 'Accept & Grant Writer Access'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit writer modal */}
      {editingWriter && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setEditingWriter(null)}>
          <div className="bg-white rounded-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800">Edit Writer</h2>
              <button onClick={() => setEditingWriter(null)}><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="label-text">Full Name</label>
                <input className="input-field" value={editForm.fullName} onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })} />
              </div>
              <div>
                <label className="label-text">Email</label>
                <input type="email" className="input-field" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
              </div>
              <div>
                <label className="label-text">Bio (optional, shown on their articles)</label>
                <textarea className="input-field" rows={2} maxLength={500} value={editForm.bio} onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })} />
              </div>
              <button onClick={handleSaveEdit} disabled={saving} className="btn-primary w-full">{saving ? 'Saving...' : 'Save Changes'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminWriters;