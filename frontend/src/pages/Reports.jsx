import React, { useState, useEffect } from 'react';
import { complaintsAPI, categoriesAPI, reportsAPI } from '../services/api';
import { Calendar, Search, FileDown, Eye, AlertCircle, FileSpreadsheet } from 'lucide-react';
import { Link } from 'react-router-dom';

const Reports = () => {
  const [categories, setCategories] = useState([]);
  const [complaints, setComplaints] = useState([]);

  // Filter States
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoriesAPI.getActive();
        if (res.data && res.data.success) {
          setCategories(res.data.data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();
  }, []);

  const handlePreview = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);

    try {
      const params = {
        limit: 50, // show up to 50 matching previews
      };
      if (search) params.search = search;
      if (status) params.status = status;
      if (category) params.category = category;
      if (priority) params.priority = priority;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await complaintsAPI.getAll(params);
      if (res.data && res.data.success) {
        setComplaints(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    handlePreview();
  }, [status, category, priority]);

  const handleExport = (format) => {
    const params = {};
    if (search) params.search = search;
    if (status) params.status = status;
    if (category) params.category = category;
    if (priority) params.priority = priority;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    params.format = format;
    params.token = localStorage.getItem('token');

    // Trigger URL file download directly in a new tab
    const downloadUrl = reportsAPI.getExportUrl(params);
    window.open(downloadUrl, '_blank');
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto animate-fade-in flex flex-col gap-6 text-slate-100">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-100 tracking-tight">Analytical Reports & Export</h2>
        <p className="text-zinc-500 text-xs">Configure analytical grids, filter variables, and download signed Excel spreadsheets or printable PDF tables.</p>
      </div>

      {/* Export parameters form */}
      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 shadow-sm flex flex-col gap-5">
        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Define Report Filters</h3>
        
        <form onSubmit={handlePreview} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-xs font-bold text-zinc-400">
          {/* Keyword search */}
          <div className="flex flex-col gap-1.5">
            <label>Search Keyword</label>
            <input
              type="text"
              placeholder="e.g. Broken pipe, Sector 4..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl font-semibold text-slate-200 placeholder:text-zinc-650 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500"
            />
          </div>

          {/* Status */}
          <div className="flex flex-col gap-1.5">
            <label>Status Filter</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl font-semibold text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500"
            >
              <option value="" className="bg-zinc-900">All Statuses</option>
              <option value="Submitted" className="bg-zinc-900">Submitted</option>
              <option value="Under Review" className="bg-zinc-900">Under Review</option>
              <option value="In Progress" className="bg-zinc-900">In Progress</option>
              <option value="Resolved" className="bg-zinc-900">Resolved</option>
              <option value="Closed" className="bg-zinc-900">Closed</option>
              <option value="Rejected" className="bg-zinc-900">Rejected</option>
            </select>
          </div>

          {/* Category */}
          <div className="flex flex-col gap-1.5">
            <label>Category Filter</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl font-semibold text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500"
            >
              <option value="" className="bg-zinc-900">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id} className="bg-zinc-900">{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div className="flex flex-col gap-1.5">
            <label>Priority level</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl font-semibold text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500"
            >
              <option value="" className="bg-zinc-900">All Priorities</option>
              <option value="Low" className="bg-zinc-900">Low</option>
              <option value="Medium" className="bg-zinc-900">Medium</option>
              <option value="High" className="bg-zinc-900">High</option>
              <option value="Critical" className="bg-zinc-900">Critical</option>
            </select>
          </div>

          {/* Start Date */}
          <div className="flex flex-col gap-1.5">
            <label className="flex items-center gap-1"><Calendar size={12} /> Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-2 bg-zinc-950 border border-zinc-800 rounded-xl font-semibold text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500"
            />
          </div>

          {/* End Date */}
          <div className="flex flex-col gap-1.5">
            <label className="flex items-center gap-1"><Calendar size={12} /> End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-2 bg-zinc-950 border border-zinc-800 rounded-xl font-semibold text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500"
            />
          </div>

          <div className="col-span-1 sm:col-span-2 lg:col-span-3 flex flex-wrap gap-3 pt-3 border-t border-zinc-850 mt-2">
            <button type="submit" className="btn-primary py-2.5 px-6 font-bold cursor-pointer">
              Generate Report Grid
            </button>
            
            <button
              type="button"
              onClick={() => handleExport('excel')}
              className="btn-secondary py-2.5 px-5 bg-emerald-500/10 text-emerald-450 hover:bg-emerald-500/20 border border-emerald-500/25 font-bold cursor-pointer flex items-center gap-1"
            >
              <FileSpreadsheet size={16} /> Download Excel Spreadsheet
            </button>

            <button
              type="button"
              onClick={() => handleExport('pdf')}
              className="btn-secondary py-2.5 px-5 bg-rose-500/10 text-rose-450 hover:bg-rose-500/20 border border-rose-500/25 font-bold cursor-pointer flex items-center gap-1"
            >
              <FileDown size={16} /> Download Printable PDF Report
            </button>
          </div>
        </form>
      </div>

      {/* Preview Table */}
      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 shadow-sm overflow-hidden flex-1 flex flex-col justify-between">
        <div className="p-5 border-b border-zinc-850">
          <h3 className="text-sm font-extrabold text-slate-200 tracking-tight">Report Preview Grid</h3>
          <p className="text-zinc-500 text-xs">Preview of the matching grievances list to be exported ({complaints.length} records matched).</p>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-brand-650 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : complaints.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <AlertCircle className="text-zinc-650 mb-2" size={36} />
              <h3 className="font-bold text-slate-300 text-sm">No match preview records</h3>
              <p className="text-zinc-500 text-xs">Modify filter bounds or date ranges.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-950/60 border-b border-zinc-850 text-zinc-500 text-[10px] font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Complaint ID</th>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Citizen</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Priority</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Filed Date</th>
                  <th className="px-6 py-4 text-center">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850 text-xs font-medium text-zinc-400">
                {complaints.map((comp) => (
                  <tr key={comp._id} className="hover:bg-zinc-800/15 transition-colors">
                    <td className="px-6 py-4 text-brand-400 font-extrabold">{comp.complaintId}</td>
                    <td className="px-6 py-4 max-w-[200px] truncate font-bold text-slate-300">{comp.title}</td>
                    <td className="px-6 py-4 font-semibold text-slate-300">{comp.citizen?.name}</td>
                    <td className="px-6 py-4">{comp.category?.name || 'N/A'}</td>
                    <td className="px-6 py-4 font-semibold text-zinc-550">{comp.priority}</td>
                    <td className="px-6 py-4 font-semibold">{comp.status}</td>
                    <td className="px-6 py-4 text-zinc-500 font-semibold">{new Date(comp.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-center">
                      <Link
                        to={`/admin/complaints/${comp._id}`}
                        className="p-1 hover:bg-zinc-850 rounded-lg text-zinc-500 hover:text-brand-400 inline-block cursor-pointer"
                      >
                        <Eye size={14} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
