import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { categoriesAPI, complaintsAPI } from '../services/api';
import { PlusCircle, FileText, MapPin, AlertTriangle, Upload, CheckCircle2, ArrowLeft } from 'lucide-react';

const CreateComplaint = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('Low');
  const [location, setLocation] = useState('');
  const [files, setFiles] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoriesAPI.getActive();
        if (res.data && res.data.success) {
          setCategories(res.data.data);
          if (res.data.data.length > 0) {
            setCategory(res.data.data[0]._id);
          }
        }
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };
    fetchCategories();
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files) {
      const fileList = Array.from(e.target.files);
      if (files.length + fileList.length > 5) {
        setErrorMsg('You can upload a maximum of 5 supporting documents.');
        return;
      }
      setFiles([...files, ...fileList]);
    }
  };

  const removeFile = (idx) => {
    setFiles(files.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    if (!title || !description || !category || !location) {
      setErrorMsg('Please fill in all the required fields.');
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('priority', priority);
    formData.append('location', location);

    files.forEach((file) => {
      formData.append('attachments', file);
    });

    try {
      const res = await complaintsAPI.create(formData);
      setLoading(false);
      if (res.data && res.data.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/my-complaints');
        }, 1500);
      }
    } catch (err) {
      setLoading(false);
      setErrorMsg(err.response?.data?.message || 'Failed to submit complaint. Try again.');
    }
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto animate-fade-in max-w-3xl mx-auto w-full text-slate-100">
      <Link to="/dashboard" className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-500 hover:text-zinc-350 mb-6 transition-colors">
        <ArrowLeft size={14} /> Back to Dashboard
      </Link>

      <div className="bg-zinc-900 rounded-3xl border border-zinc-800 shadow-xl overflow-hidden p-6 md:p-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <PlusCircle size={22} />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-200 tracking-tight">Register Grievance</h2>
            <p className="text-zinc-500 text-xs">Submit an official complaint record. Add description and location maps.</p>
          </div>
        </div>

        {success && (
          <div className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/25 rounded-xl flex gap-3 text-emerald-400 text-xs font-semibold">
            <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
            <span>Complaint registered successfully! Dispatching receipts...</span>
          </div>
        )}

        {errorMsg && (
          <div className="mt-6 p-4 bg-rose-500/10 border border-rose-500/25 rounded-xl flex gap-3 text-rose-400 text-xs font-semibold">
            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
            {/* Title */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-zinc-400">Complaint Title *</label>
              <input
                type="text"
                placeholder="Brief summary of the issue (e.g. Water leak in Sector 4)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-slate-200 placeholder:text-zinc-650"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Category */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-zinc-400">Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-slate-250"
                  required
                >
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id} className="bg-zinc-900">
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-zinc-400">Estimated Priority *</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-slate-250"
                  required
                >
                  <option value="Low" className="bg-zinc-900">Low - Minor issue</option>
                  <option value="Medium" className="bg-zinc-900">Medium - Regular public fix</option>
                  <option value="High" className="bg-zinc-900">High - Urgent resolution needed</option>
                  <option value="Critical" className="bg-zinc-900">Critical - Safety hazard / extreme emergency</option>
                </select>
              </div>
            </div>

            {/* Location */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-zinc-400">Specific Location *</label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-3.5 text-zinc-500" size={16} />
                <input
                  type="text"
                  placeholder="Street address, nearest landmark, city, pin code"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-slate-200 placeholder:text-zinc-650"
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-zinc-400">Full Description *</label>
              <textarea
                placeholder="Describe the complaint in detail (include dates, duration of problem, impacts)..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-slate-200 placeholder:text-zinc-650"
                required
              ></textarea>
            </div>

            {/* File upload */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-zinc-400">Supporting Documents / Images (Max 5)</label>
              <div className="border-2 border-dashed border-zinc-800 hover:border-brand-500 rounded-2xl p-6 transition-colors bg-zinc-950/40 flex flex-col items-center justify-center cursor-pointer relative hover:bg-zinc-950/80">
                <Upload size={32} className="text-zinc-500" />
                <span className="text-xs font-bold text-zinc-300 mt-2">Click to select files</span>
                <span className="text-[10px] text-zinc-550 mt-0.5">JPEG, PNG, PDF formats up to 10MB</span>
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  accept=".jpg,.jpeg,.png,.gif,.pdf,.docx,.doc,.xls,.xlsx"
                />
              </div>

              {/* Uploaded files list */}
              {files.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {files.map((file, idx) => (
                    <div key={idx} className="bg-indigo-950/60 border border-indigo-900/40 rounded-xl pl-3 pr-2 py-1.5 flex items-center gap-2 text-xs text-indigo-400 font-semibold shadow-sm animate-fade-in">
                      <FileText size={14} />
                      <span className="truncate max-w-[150px]">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeFile(idx)}
                        className="w-5 h-5 rounded-full hover:bg-indigo-900/40 flex items-center justify-center text-indigo-300 font-black text-sm cursor-pointer"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-4 py-3 font-bold text-sm shadow-lg shadow-brand-650/10 cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'File Official Complaint'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default CreateComplaint;
