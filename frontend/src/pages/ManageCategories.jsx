import React, { useState, useEffect } from 'react';
import { categoriesAPI } from '../services/api';
import { FolderPlus, Pencil, Trash, Check, X, AlertTriangle } from 'lucide-react';

const ManageCategories = () => {
  const [categories, setCategories] = useState([]);
  
  // Form states
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [active, setActive] = useState(true);

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await categoriesAPI.getAll();
      if (res.data && res.data.success) {
        setCategories(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!name || !description) {
      setErrorMsg('Please enter both category name and description.');
      return;
    }

    try {
      if (editingId) {
        // Update
        const res = await categoriesAPI.update(editingId, { name, description, active });
        if (res.data && res.data.success) {
          setSuccessMsg('Category updated successfully.');
          handleResetForm();
          fetchCategories();
        }
      } else {
        // Create
        const res = await categoriesAPI.create({ name, description });
        if (res.data && res.data.success) {
          setSuccessMsg('New category added successfully.');
          handleResetForm();
          fetchCategories();
        }
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit category.');
    }
  };

  const handleEditClick = (cat) => {
    setEditingId(cat._id);
    setName(cat.name);
    setDescription(cat.description);
    setActive(cat.active);
  };

  const handleDeleteClick = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this category? All associated complaints may lose this tag.')) {
      return;
    }
    try {
      const res = await categoriesAPI.delete(id);
      if (res.data && res.data.success) {
        setSuccessMsg('Category removed successfully.');
        fetchCategories();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to remove category.');
    }
  };

  const handleToggleActive = async (cat) => {
    try {
      await categoriesAPI.update(cat._id, {
        name: cat.name,
        description: cat.description,
        active: !cat.active,
      });
      fetchCategories();
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetForm = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setActive(true);
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto animate-fade-in flex flex-col md:flex-row gap-6 text-slate-100">
      {/* Table List of Categories */}
      <div className="flex-1 bg-zinc-900 rounded-2xl border border-zinc-800 shadow-sm overflow-hidden flex flex-col justify-between">
        <div className="p-5 border-b border-zinc-850 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-slate-200 tracking-tight">Category Dashboard</h2>
            <p className="text-zinc-500 text-xs">A list of all grievance types currently accessible by citizens.</p>
          </div>
        </div>

        <div className="overflow-x-auto flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-brand-650 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-950/60 border-b border-zinc-850 text-zinc-500 text-[10px] font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850 text-xs font-semibold text-zinc-400">
                {categories.map((cat) => (
                  <tr key={cat._id} className="hover:bg-zinc-800/15 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-300">{cat.name}</td>
                    <td className="px-6 py-4 max-w-[250px] truncate text-zinc-500 font-medium">{cat.description}</td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleToggleActive(cat)}
                        className={`status-badge uppercase text-[9px] font-bold cursor-pointer hover:opacity-85 border ${
                          cat.active ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25' : 'bg-rose-500/10 text-rose-450 border-rose-500/25'
                        }`}
                      >
                        {cat.active ? <Check size={10} className="inline mr-0.5" /> : <X size={10} className="inline mr-0.5" />}
                        {cat.active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleEditClick(cat)}
                        className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-brand-400 transition-colors cursor-pointer"
                        title="Edit Details"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(cat._id)}
                        className="p-1.5 hover:bg-rose-500/15 rounded-lg text-zinc-500 hover:text-rose-400 transition-colors cursor-pointer"
                        title="Remove Category"
                      >
                        <Trash size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Action form panel */}
      <div className="w-full md:w-80 bg-zinc-900 rounded-2xl border border-zinc-800 shadow-sm p-5 self-start">
        <h3 className="text-sm font-extrabold text-slate-200 mb-4 tracking-tight flex items-center gap-1.5 pb-3 border-b border-zinc-850">
          <FolderPlus size={16} className="text-brand-400" /> {editingId ? 'Edit Category' : 'Add Category'}
        </h3>

        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/25 text-emerald-450 text-xs font-semibold rounded-xl">
            {successMsg}
          </div>
        )}

        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/25 text-rose-450 text-xs font-semibold rounded-xl flex gap-1.5">
            <AlertTriangle size={14} className="shrink-0 mt-0.5" /> <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs font-bold text-zinc-400">
          <div className="flex flex-col gap-1.5">
            <label>Category Title *</label>
            <input
              type="text"
              placeholder="e.g. Electricity & Power"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-semibold text-slate-200 placeholder:text-zinc-650 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label>Description *</label>
            <textarea
              placeholder="Provide summary describing what complains route under here..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-medium text-slate-200 placeholder:text-zinc-650 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500"
              required
            ></textarea>
          </div>

          {editingId && (
            <div className="flex items-center gap-2 mt-1">
              <input
                type="checkbox"
                id="cat-active"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="w-4 h-4 text-brand-500 border-zinc-800 rounded bg-zinc-950 cursor-pointer"
              />
              <label htmlFor="cat-active" className="text-zinc-450 select-none cursor-pointer">Mark as Active</label>
            </div>
          )}

          <div className="flex gap-2 mt-2">
            <button type="submit" className="btn-primary py-2 px-4 text-xs flex-1 cursor-pointer">
              {editingId ? 'Save Edits' : 'Create Category'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={handleResetForm}
                className="btn-secondary py-2 px-4 text-xs bg-zinc-950 hover:bg-zinc-800 text-zinc-450 border border-zinc-800 flex-1 cursor-pointer"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManageCategories;
