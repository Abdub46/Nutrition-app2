import React, { useEffect, useRef, useState } from 'react';
import { Plus, Edit2, Trash2, X, Upload, Link2, MousePointerClick, Globe2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { getArticleCategories, createArticleCategory } from '../../services/articleCategoryApi';
import { getSubcategories } from '../../services/subcategoryApi';
import { uploadImage } from '../../services/uploadApi';
import { useAuth } from '../../context/AuthContext';
import RichTextEditor from '../../components/RichTextEditor';
import { stripHtml } from '../../utils/stripHtml';

const emptyForm = { title: '', summary: '', content: '', featuredImage: '', category: '', subcategory: '', status: 'Published' };

const AdminArticles = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategoryOptions, setSubcategoryOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [newCategoryName, setNewCategoryName] = useState('');
  const [addingCategory, setAddingCategory] = useState(false);

  // Rich content insert toolbar (Button / Link Block / External Link snippets)
  const contentEditorRef = useRef(null);
  const [insertMode, setInsertMode] = useState(null); // 'button' | 'link' | 'external'
  const [insertLabel, setInsertLabel] = useState('');
  const [insertUrl, setInsertUrl] = useState('');

  const loadCategories = () => getArticleCategories().then(setCategories).catch(() => {});

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/articles/admin/all');
      setArticles(data.articles);
    } catch (err) {
      toast.error('Failed to load articles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    loadCategories();
  }, []);

  // Load subcategory options whenever the selected category changes
  useEffect(() => {
    if (!form.category) {
      setSubcategoryOptions([]);
      return;
    }
    getSubcategories(form.category).then(setSubcategoryOptions).catch(() => setSubcategoryOptions([]));
  }, [form.category]);

  const canManage = (article) => isAdmin || article.author?._id === user?._id;

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (article) => {
    setEditingId(article._id);
    setForm({
      title: article.title,
      summary: article.summary,
      content: article.content,
      featuredImage: article.featuredImage || '',
      category: article.category?._id || '',
      subcategory: article.subcategory?._id || '',
      status: article.status || 'Published',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripHtml(form.summary)) {
      toast.error('Summary is required');
      return;
    }
    if (!stripHtml(form.content)) {
      toast.error('Content is required');
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/articles/${editingId}`, form);
        toast.success('Article updated');
      } else {
        await api.post('/articles', form);
        toast.success(form.status === 'Draft' ? 'Draft saved' : 'Article published');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this article?')) return;
    try {
      await api.delete(`/articles/${id}`);
      toast.success('Article deleted');
      setArticles((prev) => prev.filter((a) => a._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const url = await uploadImage(file, 'articles');
      setForm((f) => ({ ...f, featuredImage: url }));
      toast.success('Image uploaded');
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    setAddingCategory(true);
    try {
      const category = await createArticleCategory(newCategoryName.trim());
      setCategories((prev) => [...prev, category].sort((a, b) => a.name.localeCompare(b.name)));
      setForm((f) => ({ ...f, category: category._id }));
      setNewCategoryName('');
      toast.success('Category added');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add category');
    } finally {
      setAddingCategory(false);
    }
  };

  // Insert an HTML snippet into the content editor at the current cursor position
  const insertSnippet = (snippet) => {
    if (contentEditorRef.current) {
      contentEditorRef.current.insertHtml(snippet);
      // insertHtml() calls onChange() itself (which updates form.content), so
      // form state stays in sync without us touching it here.
    } else {
      setForm((f) => ({ ...f, content: f.content + snippet }));
    }
  };

  const confirmInsert = () => {
    if (!insertLabel.trim() || !insertUrl.trim()) {
      toast.error('Both fields are required');
      return;
    }
    let snippet = '';
    if (insertMode === 'button') {
      snippet = `\n<a href="${insertUrl}" target="_blank" rel="noreferrer" class="btn-primary inline-block no-underline">${insertLabel}</a>\n`;
    } else if (insertMode === 'link') {
      snippet = `<a href="${insertUrl}" target="_blank" rel="noreferrer" class="text-primary-600 underline font-medium">${insertLabel}</a>`;
    } else if (insertMode === 'external') {
      snippet = `<a href="${insertUrl}" target="_blank" rel="noreferrer" class="text-primary-600 underline">${insertLabel}</a>`;
    }
    insertSnippet(snippet);
    setInsertMode(null);
    setInsertLabel('');
    setInsertUrl('');
  };

  return (
    <div className="pt-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{isAdmin ? 'Manage Articles' : 'My Articles'}</h1>
          <p className="text-sm text-gray-500">{articles.length} article(s)</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> New Article
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {articles.map((a) => (
            <div key={a._id} className="card !p-0 overflow-hidden">
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
                  <span className={`inline-block text-[11px] font-medium rounded-full px-2 py-0.5 ${a.status === 'Draft' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                    {a.status}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-1 line-clamp-1">{a.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-2 mb-2">{stripHtml(a.summary)}</p>
                {isAdmin && a.author && (
                  <p className="text-xs text-gray-400 mb-3">By {a.author.fullName}</p>
                )}
                {canManage(a) ? (
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(a)} className="btn-secondary flex-1 flex items-center justify-center gap-1 text-xs py-1.5">
                      <Edit2 size={14} /> Edit
                    </button>
                    <button onClick={() => handleDelete(a._id)} className="flex-1 flex items-center justify-center gap-1 text-xs py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50">
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic">Not your article</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setModalOpen(false)}>
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800">{editingId ? 'Edit Article' : 'New Article'}</h2>
              <button onClick={() => setModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label-text">Title</label>
                <input required maxLength={200} className="input-field" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label-text">Category</label>
                  <select
                    className="input-field"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value, subcategory: '' })}
                  >
                    <option value="">No category</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                  <div className="flex gap-2 mt-2">
                    <input
                      className="input-field text-sm"
                      placeholder="Add a new category..."
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                    />
                    <button type="button" onClick={handleAddCategory} disabled={addingCategory} className="btn-secondary text-sm whitespace-nowrap px-3">
                      {addingCategory ? '...' : 'Add'}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="label-text">Subcategory</label>
                  <select
                    className="input-field"
                    value={form.subcategory}
                    disabled={!form.category}
                    onChange={(e) => setForm({ ...form, subcategory: e.target.value })}
                  >
                    <option value="">
                      {form.category ? 'No subcategory' : 'Select a category first'}
                    </option>
                    {subcategoryOptions.map((s) => (
                      <option key={s._id} value={s._id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="label-text">Featured Image</label>
                <div className="flex items-center gap-3">
                  {form.featuredImage ? (
                    <img src={form.featuredImage} alt="" className="h-14 w-14 rounded-lg object-cover" />
                  ) : (
                    <div className="h-14 w-14 rounded-lg bg-gray-50 border border-gray-100" />
                  )}
                  <label className="btn-secondary cursor-pointer flex items-center gap-2 text-sm">
                    <Upload size={14} /> {uploadingImage ? 'Uploading...' : 'Upload'}
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
                  </label>
                </div>
                <input
                  className="input-field mt-2 text-sm"
                  placeholder="...or paste an image URL"
                  value={form.featuredImage}
                  onChange={(e) => setForm({ ...form, featuredImage: e.target.value })}
                />
              </div>

              <div>
                <label className="label-text">Summary</label>
                <RichTextEditor
                  initialValue={form.summary}
                  onChange={(html) => setForm((f) => ({ ...f, summary: html }))}
                  placeholder="Short summary shown on article cards and previews..."
                  minHeight={70}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="label-text mb-0">Content</label>
                  <div className="flex gap-1.5">
                    <button type="button" onClick={() => setInsertMode('button')} className="flex items-center gap-1 text-xs text-gray-600 hover:text-primary-700 bg-gray-50 hover:bg-primary-50 rounded-lg px-2 py-1">
                      <MousePointerClick size={13} /> Button
                    </button>
                    <button type="button" onClick={() => setInsertMode('link')} className="flex items-center gap-1 text-xs text-gray-600 hover:text-primary-700 bg-gray-50 hover:bg-primary-50 rounded-lg px-2 py-1">
                      <Link2 size={13} /> Link Block
                    </button>
                    <button type="button" onClick={() => setInsertMode('external')} className="flex items-center gap-1 text-xs text-gray-600 hover:text-primary-700 bg-gray-50 hover:bg-primary-50 rounded-lg px-2 py-1">
                      <Globe2 size={13} /> External Link
                    </button>
                  </div>
                </div>

                {insertMode && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-2 space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        className="input-field text-sm"
                        placeholder={insertMode === 'button' ? 'Button Text' : 'Link Text'}
                        value={insertLabel}
                        onChange={(e) => setInsertLabel(e.target.value)}
                      />
                      <input
                        className="input-field text-sm"
                        placeholder="https://example.com"
                        value={insertUrl}
                        onChange={(e) => setInsertUrl(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={confirmInsert} className="btn-primary text-xs py-1.5 px-3">Insert</button>
                      <button type="button" onClick={() => { setInsertMode(null); setInsertLabel(''); setInsertUrl(''); }} className="btn-secondary text-xs py-1.5 px-3">Cancel</button>
                    </div>
                  </div>
                )}

                <RichTextEditor
                  ref={contentEditorRef}
                  initialValue={form.content}
                  onChange={(html) => setForm((f) => ({ ...f, content: html }))}
                  placeholder="Write your article..."
                  minHeight={220}
                />
                <p className="text-xs text-gray-400 mt-1">
                  Formatting is sanitized against an allowlist of safe tags before saving.
                </p>
              </div>

              <div>
                <label className="label-text">Status</label>
                <div className="flex gap-3">
                  <label className={`flex-1 border rounded-lg px-3 py-2.5 text-sm text-center cursor-pointer transition-colors ${form.status === 'Draft' ? 'border-yellow-400 bg-yellow-50 text-yellow-700 font-medium' : 'border-gray-200 text-gray-600'}`}>
                    <input type="radio" className="hidden" checked={form.status === 'Draft'} onChange={() => setForm({ ...form, status: 'Draft' })} />
                    Save as Draft
                  </label>
                  <label className={`flex-1 border rounded-lg px-3 py-2.5 text-sm text-center cursor-pointer transition-colors ${form.status === 'Published' ? 'border-primary-600 bg-primary-50 text-primary-700 font-medium' : 'border-gray-200 text-gray-600'}`}>
                    <input type="radio" className="hidden" checked={form.status === 'Published'} onChange={() => setForm({ ...form, status: 'Published' })} />
                    Publish
                  </label>
                </div>
              </div>

              <button type="submit" disabled={saving} className="btn-primary w-full">
                {saving ? 'Saving...' : editingId ? 'Update Article' : form.status === 'Draft' ? 'Save Draft' : 'Publish Article'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminArticles;
