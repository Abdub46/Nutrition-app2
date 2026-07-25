import React, { useEffect, useState } from 'react';
import { ExternalLink, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { getBanner, updateBanner } from '../../services/bannerApi';
import { useBanner } from '../../context/BannerContext';

const AdminBanner = () => {
  const { refreshBanner } = useBanner();
  const [form, setForm] = useState({
    enabled: false,
    text: '',
    linkUrl: '',
    linkText: '',
    showLinkIcon: false,
    backgroundColor: '#16a34e',
    textColor: '#ffffff',
    showCloseButton: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getBanner()
      .then((data) => setForm({
        enabled: data.enabled,
        text: data.text,
        linkUrl: data.linkUrl,
        linkText: data.linkText,
        showLinkIcon: data.showLinkIcon,
        backgroundColor: data.backgroundColor,
        textColor: data.textColor,
        showCloseButton: data.showCloseButton,
      }))
      .catch(() => toast.error('Failed to load banner settings'))
      .finally(() => setLoading(false));
  }, []);

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateBanner(form);
      await refreshBanner();
      toast.success('Banner settings saved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save banner');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="pt-8 text-sm text-gray-500">Loading banner settings...</p>;

  return (
    <div className="pt-4 max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Site Banner</h1>
        <p className="text-sm text-gray-500">Controls the promotional bar shown at the very top of the site</p>
      </div>

      <div>
        <p className="label-text">Preview</p>
        <div className="rounded-lg overflow-hidden border border-gray-100">
          <div
            className="h-10 flex items-center justify-center px-4 text-sm gap-2 relative"
            style={{ backgroundColor: form.backgroundColor, color: form.textColor }}
          >
            <span className="truncate">{form.text || 'Your banner text will appear here'}</span>
            {form.linkUrl && form.linkText && (
              <span className="inline-flex items-center gap-1 font-semibold underline underline-offset-2 whitespace-nowrap">
                {form.linkText}
                {form.showLinkIcon && <ExternalLink size={13} />}
              </span>
            )}
            {form.showCloseButton && (
              <span className="absolute right-2 top-1/2 -translate-y-1/2">
                <X size={15} />
              </span>
            )}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-4">
        <label className="flex items-center gap-3">
          <input type="checkbox" checked={form.enabled} onChange={(e) => update('enabled', e.target.checked)} />
          <span className="text-sm font-medium text-gray-700">Show Banner on Site</span>
        </label>

        <div>
          <label className="label-text">Banner Text</label>
          <input
            className="input-field"
            placeholder='e.g. "Courtesy of Softlife Wireless"'
            value={form.text}
            onChange={(e) => update('text', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label-text">Link URL (optional)</label>
            <input
              className="input-field"
              placeholder="https://example.com"
              value={form.linkUrl}
              onChange={(e) => update('linkUrl', e.target.value)}
            />
          </div>
          <div>
            <label className="label-text">Link Text (optional)</label>
            <input
              className="input-field"
              placeholder="Visit Website"
              value={form.linkText}
              onChange={(e) => update('linkText', e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label-text">Banner Background Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                className="h-10 w-14 rounded border border-gray-300 cursor-pointer"
                value={form.backgroundColor}
                onChange={(e) => update('backgroundColor', e.target.value)}
              />
              <input
                className="input-field"
                value={form.backgroundColor}
                onChange={(e) => update('backgroundColor', e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="label-text">Text Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                className="h-10 w-14 rounded border border-gray-300 cursor-pointer"
                value={form.textColor}
                onChange={(e) => update('textColor', e.target.value)}
              />
              <input
                className="input-field"
                value={form.textColor}
                onChange={(e) => update('textColor', e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-6 pt-1">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.showLinkIcon} onChange={(e) => update('showLinkIcon', e.target.checked)} />
            Show Link Icon
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.showCloseButton} onChange={(e) => update('showCloseButton', e.target.checked)} />
            Show Close Button
          </label>
        </div>

        <button type="submit" disabled={saving} className="btn-primary w-full sm:w-auto px-8">
          {saving ? 'Saving...' : 'Save Banner Settings'}
        </button>
      </form>
    </div>
  );
};

export default AdminBanner;