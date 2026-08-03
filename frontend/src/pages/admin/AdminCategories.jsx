import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, ChevronDown, ChevronUp, X } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getArticleCategories, createArticleCategory, updateArticleCategory, deleteArticleCategory,
} from '../../services/articleCategoryApi';
import {
  getSubcategories, createSubcategory, updateSubcategory, deleteSubcategory,
} from '../../services/subcategoryApi';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [subcategoriesByCategory, setSubcategoriesByCategory] = useState({});
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  const [newCategoryName, setNewCategoryName] = useState('');
  const [adding, setAdding] = useState(false);

  const [editingCategory, setEditingCategory] = useState(null); // { _id, name }
  const [editCategoryName, setEditCategoryName] = useState('');

  const [newSubName, setNewSubName] = useState('');
  const [addingSub, setAddingSub] = useState(false);
  const [editingSub, setEditingSub] = useState(null); // { _id, name, category }
  const [editSubName, setEditSubName] = useState('');

  const loadCategories = () => {
    setLoading(true);
    getArticleCategories().then(setCategories).catch(() => toast.error('Failed to load categories')).finally(() => setLoading(false));
  };

  useEffect(() => { loadCategories(); }, []);

  const toggleExpand = async (categoryId) => {
    if (expandedId === categoryId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(categoryId);
    if (!subcategoriesByCategory[categoryId]) {
      try {
        const subs = await getSubcategories(categoryId);
        setSubcategoriesByCategory((prev) => ({ ...prev, [categoryId]: subs }));
      } catch {
        toast.error('Failed to load subcategories');
      }
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    setAdding(true);
    try {
      const category = await createArticleCategory(newCategoryName.trim());
      setCategories((prev) => [...prev, category].sort((a, b) => a.name.localeCompare(b.name)));
      setNewCategoryName('');
      toast.success('Category added');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add category');
    } finally {
      setAdding(false);
    }
  };

  const handleUpdateCategory = async () => {
    if (!editCategoryName.trim()) return;
    try {
      const updated = await updateArticleCategory(editingCategory._id, editCategoryName.trim());
      setCategories((prev) => prev.map((c) => (c._id === updated._id ? updated : c)).sort((a, b) => a.name.localeCompare(b.name)));
      setEditingCategory(null);
      toast.success('Category updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Delete this category? If it is used by any articles, it will be archived instead of removed.')) return;
    try {
      const { message } = await deleteArticleCategory(id);
      toast.success(message || 'Category deleted');
      setCategories((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleAddSub = async (categoryId) => {
    if (!newSubName.trim()) return;
    setAddingSub(true);
    try {
      const sub = await createSubcategory(newSubName.trim(), categoryId);
      setSubcategoriesByCategory((prev) => ({
        ...prev,
        [categoryId]: [...(prev[categoryId] || []), sub].sort((a, b) => a.name.localeCompare(b.name)),
      }));
      setNewSubName('');
      toast.success('Subcategory added');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add subcategory');
    } finally {
      setAddingSub(false);
    }
  };

  const handleUpdateSub = async () => {
    if (!editSubName.trim()) return;
    try {
      const updated = await updateSubcategory(editingSub._id, editSubName.trim());
      setSubcategoriesByCategory((prev) => ({
        ...prev,
        [editingSub.category]: (prev[editingSub.category] || []).map((s) => (s._id === updated._id ? updated : s)),
      }));
      setEditingSub(null);
      toast.success('Subcategory updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const handleDeleteSub = async (categoryId, subId) => {
    if (!window.confirm('Delete this subcategory? If it is used by any articles, it will be archived instead of removed.')) return;
    try {
      const { message } = await deleteSubcategory(subId);
      toast.success(message || 'Subcategory deleted');
      setSubcategoriesByCategory((prev) => ({
        ...prev,
        [categoryId]: (prev[categoryId] || []).filter((s) => s._id !== subId),
      }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="pt-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Categories</h1>
        <p className="text-sm text-gray-500">Manage article categories and their subcategories</p>
      </div>

      <form onSubmit={handleAddCategory} className="card flex gap-2">
        <input
          className="input-field"
          placeholder="New category name (e.g. Nutrition)"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
        />
        <button type="submit" disabled={adding} className="btn-primary flex items-center gap-1.5 whitespace-nowrap">
          <Plus size={15} /> Add Category
        </button>
      </form>

      {loading ? (
        <p className="text-sm text-gray-500">Loading categories...</p>
      ) : categories.length === 0 ? (
        <p className="text-sm text-gray-500">No categories yet.</p>
      ) : (
        <div className="space-y-3">
          {categories.map((cat) => (
            <div key={cat._id} className="card !p-0 overflow-hidden">
              <div className="flex items-center justify-between p-4">
                {editingCategory?._id === cat._id ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      className="input-field"
                      value={editCategoryName}
                      onChange={(e) => setEditCategoryName(e.target.value)}
                      autoFocus
                    />
                    <button onClick={handleUpdateCategory} className="btn-primary text-xs px-3 py-1.5 whitespace-nowrap">Save</button>
                    <button onClick={() => setEditingCategory(null)} className="btn-secondary text-xs px-3 py-1.5 whitespace-nowrap">Cancel</button>
                  </div>
                ) : (
                  <>
                    <button onClick={() => toggleExpand(cat._id)} className="flex items-center gap-2 font-medium text-gray-800 flex-1 text-left">
                      {expandedId === cat._id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      {cat.name}
                    </button>
                    <div className="flex gap-1.5 flex-shrink-0">
                      <button onClick={() => { setEditingCategory(cat); setEditCategoryName(cat.name); }} className="p-1.5 rounded hover:bg-gray-100 text-gray-600">
                        <Edit2 size={15} />
                      </button>
                      <button onClick={() => handleDeleteCategory(cat._id)} className="p-1.5 rounded hover:bg-red-50 text-red-600">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </>
                )}
              </div>

              {expandedId === cat._id && (
                <div className="border-t border-gray-100 p-4 bg-gray-50/50 space-y-3">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Subcategories</p>

                  {(subcategoriesByCategory[cat._id] || []).length === 0 ? (
                    <p className="text-sm text-gray-400">No subcategories yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {subcategoriesByCategory[cat._id].map((sub) => (
                        <div key={sub._id} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-gray-100">
                          {editingSub?._id === sub._id ? (
                            <div className="flex items-center gap-2 flex-1">
                              <input className="input-field text-sm" value={editSubName} onChange={(e) => setEditSubName(e.target.value)} autoFocus />
                              <button onClick={handleUpdateSub} className="btn-primary text-xs px-2.5 py-1 whitespace-nowrap">Save</button>
                              <button onClick={() => setEditingSub(null)} className="btn-secondary text-xs px-2.5 py-1 whitespace-nowrap">Cancel</button>
                            </div>
                          ) : (
                            <>
                              <span className="text-sm text-gray-700">{sub.name}</span>
                              <div className="flex gap-1">
                                <button onClick={() => { setEditingSub(sub); setEditSubName(sub.name); }} className="p-1 rounded hover:bg-gray-100 text-gray-500">
                                  <Edit2 size={13} />
                                </button>
                                <button onClick={() => handleDeleteSub(cat._id, sub._id)} className="p-1 rounded hover:bg-red-50 text-red-500">
                                  <X size={14} />
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2 pt-1">
                    <input
                      className="input-field text-sm"
                      placeholder="New subcategory name"
                      value={newSubName}
                      onChange={(e) => setNewSubName(e.target.value)}
                    />
                    <button onClick={() => handleAddSub(cat._id)} disabled={addingSub} className="btn-secondary text-sm px-3 whitespace-nowrap">
                      {addingSub ? '...' : 'Add'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminCategories;