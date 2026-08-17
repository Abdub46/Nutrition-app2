import React, { useEffect, useState } from 'react';
import { Globe, Phone, Search as SearchIcon, Mail, Megaphone, Wrench, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { getSettings, updateSettings } from '../../services/settingsApi';
import { uploadImage } from '../../services/uploadApi';
import { useSettings } from '../../context/SettingsContext';
import AdminBanner from './AdminBanner';

const TABS = [
  { id: 'website', label: 'Website', icon: Globe },
  { id: 'contact', label: 'Contact & Social', icon: Phone },
  { id: 'seo', label: 'SEO Defaults', icon: SearchIcon },
  { id: 'newsletter', label: 'Newsletter', icon: Mail },
  { id: 'banner', label: 'Site Banner', icon: Megaphone },
  { id: 'maintenance', label: 'Maintenance', icon: Wrench },
];

const emptyForm = {
  websiteName: '', websiteDescription: '', websiteLogo: '', websiteFavicon: '',
  contactEmail: '', contactPhone: '',
  socialLinks: { facebook: '', twitter: '', linkedin: '', whatsapp: '' },
  footerText: '',
  newsletterHeading: '', newsletterDescription: '',
  seoTitle: '', seoDescription: '',
  maintenanceMode: false,
};

const AdminSettings = () => {
  const { refreshSettings } = useSettings();
  const [activeTab, setActiveTab] = useState('website');
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);

  useEffect(() => {
    getSettings()
      .then((data) => setForm({ ...emptyForm, ...data, socialLinks: { ...emptyForm.socialLinks, ...data.socialLinks } }))
      .catch(() => toast.error('Failed to load settings'))
      .finally(() => setLoading(false));
  }, []);

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));
  const updateSocial = (field, value) => setForm((f) => ({ ...f, socialLinks: { ...f.socialLinks, [field]: value } }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSettings(form);
      await refreshSettings();
      toast.success('Settings saved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const url = await uploadImage(file, 'branding');
      update('websiteLogo', url);
      toast.success('Logo uploaded');
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleFaviconUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingFavicon(true);
    try {
      const url = await uploadImage(file, 'branding');
      update('websiteFavicon', url);
      toast.success('Favicon uploaded');
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploadingFavicon(false);
    }
  };

  if (loading) return <p className="pt-8 text-sm text-gray-500">Loading settings...</p>;

  return (
    <div className="pt-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
        <p className="text-sm text-gray-500">Centralized configuration for the whole website</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto border-b border-gray-100">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.id ? 'border-primary-600 text-primary-700' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon size={15} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Site Banner tab reuses the existing AdminBanner component/logic as-is */}
      {activeTab === 'banner' ? (
        <AdminBanner embedded />
      ) : (
        <form onSubmit={handleSave} className="card space-y-5 max-w-2xl">
          {activeTab === 'website' && (
            <>
              <div>
                <label className="label-text">Website Name</label>
                <input className="input-field" value={form.websiteName} onChange={(e) => update('websiteName', e.target.value)} />
              </div>
              <div>
                <label className="label-text">Website Description</label>
                <textarea className="input-field" rows={2} value={form.websiteDescription} onChange={(e) => update('websiteDescription', e.target.value)} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label-text">Website Logo</label>
                  <div className="flex items-center gap-3">
                    {form.websiteLogo ? (
                      <img src={form.websiteLogo} alt="Logo" className="h-12 w-12 rounded-lg object-contain bg-gray-50 border border-gray-100" />
                    ) : (
                      <div className="h-12 w-12 rounded-lg bg-gray-50 border border-gray-100" />
                    )}
                    <label className="btn-secondary cursor-pointer flex items-center gap-2 text-sm">
                      <Upload size={14} /> {uploadingLogo ? 'Uploading...' : 'Upload'}
                      <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} disabled={uploadingLogo} />
                    </label>
                  </div>
                </div>
                <div>
                  <label className="label-text">Website Favicon</label>
                  <div className="flex items-center gap-3">
                    {form.websiteFavicon ? (
                      <img src={form.websiteFavicon} alt="Favicon" className="h-12 w-12 rounded-lg object-contain bg-gray-50 border border-gray-100" />
                    ) : (
                      <div className="h-12 w-12 rounded-lg bg-gray-50 border border-gray-100" />
                    )}
                    <label className="btn-secondary cursor-pointer flex items-center gap-2 text-sm">
                      <Upload size={14} /> {uploadingFavicon ? 'Uploading...' : 'Upload'}
                      <input type="file" accept="image/*" className="hidden" onChange={handleFaviconUpload} disabled={uploadingFavicon} />
                    </label>
                  </div>
                </div>
              </div>
              <div>
                <label className="label-text">Footer Information</label>
                <textarea className="input-field" rows={2} placeholder="Short text shown in the footer" value={form.footerText} onChange={(e) => update('footerText', e.target.value)} />
              </div>
            </>
          )}

          {activeTab === 'contact' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label-text">Contact Email</label>
                  <input type="email" className="input-field" value={form.contactEmail} onChange={(e) => update('contactEmail', e.target.value)} />
                </div>
                <div>
                  <label className="label-text">Contact Phone</label>
                  <input className="input-field" value={form.contactPhone} onChange={(e) => update('contactPhone', e.target.value)} />
                </div>
              </div>
              <p className="label-text pt-2">Social Media Links</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {['facebook', 'twitter', 'linkedin', 'whatsapp'].map((key) => (
                  <div key={key}>
                    <label className="label-text capitalize">{key}</label>
                    <input
                      className="input-field"
                      placeholder="https://..."
                      value={form.socialLinks[key]}
                      onChange={(e) => updateSocial(key, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === 'seo' && (
            <>
              <div>
                <label className="label-text">Default SEO Title</label>
                <input className="input-field" value={form.seoTitle} onChange={(e) => update('seoTitle', e.target.value)} />
              </div>
              <div>
                <label className="label-text">Default Meta Description</label>
                <textarea className="input-field" rows={3} value={form.seoDescription} onChange={(e) => update('seoDescription', e.target.value)} />
              </div>
            </>
          )}

          {activeTab === 'newsletter' && (
            <>
              <div>
                <label className="label-text">Newsletter Heading</label>
                <input className="input-field" value={form.newsletterHeading} onChange={(e) => update('newsletterHeading', e.target.value)} />
              </div>
              <div>
                <label className="label-text">Newsletter Description</label>
                <textarea className="input-field" rows={3} value={form.newsletterDescription} onChange={(e) => update('newsletterDescription', e.target.value)} />
              </div>
            </>
          )}

          {activeTab === 'maintenance' && (
            <label className="flex items-center gap-3">
              <input type="checkbox" checked={form.maintenanceMode} onChange={(e) => update('maintenanceMode', e.target.checked)} />
              <span className="text-sm font-medium text-gray-700">Enable Maintenance Mode</span>
            </label>
          )}
          {activeTab === 'maintenance' && (
            <p className="text-xs text-gray-400">
              This toggle is stored and ready for future use — it does not yet restrict site access.
            </p>
          )}

          <button type="submit" disabled={saving} className="btn-primary w-full sm:w-auto px-8">
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </form>
      )}
    </div>
  );
};

export default AdminSettings;