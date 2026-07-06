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
    <div className="flex-1 p-6 overflow-y-auto animate-fade-in flex flex-col gap-6 text-slate-800">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Analytical Reports & Export</h2>
        <p className="text-slate-500 text-xs font-medium">Configure analytical grids, filter variables, and download signed Excel spreadsheets or printable PDF tables.</p>
      </div>

      {/* Export parameters form */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col gap-5 shadow-slate-100/50">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Define Report Filters</h3>
        
        <form onSubmit={handlePreview} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-xs font-bold text-slate-600">
          {/* Keyword search */}
          <div className="flex flex-col gap-1.5">
            <label>Search Keyword</label>
            <input
              type="text"
              placeholder="e.g. Broken pipe, Sector 4..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500"
            />
          </div>

          {/* Status */}
          <div className="flex flex-col gap-1.5">
            <label>Status Filter</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500"
            >
              <option value="">All Statuses</option>
              <option value="Submitted">Submitted</option>
              <option value="Under Review">Under Review</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {/* Category */}
          <div className="flex flex-col gap-1.5">
            <label>Category Filter</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div className="flex flex-col gap-1.5">
            <label>Priority level</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500"
            >
              <option value="">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>

          {/* Start Date */}
          <div className="flex flex-col gap-1.5">
            <label className="flex items-center gap-1"><Calendar size={12} /> Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-2 bg-white border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500"
            />
          </div>

          {/* End Date */}
          <div className="flex flex-col gap-1.5">
            <label className="flex items-center gap-1"><Calendar size={12} /> End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-2 bg-white border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500"
            />
          </div>

          <div className="col-span-1 sm:col-span-2 lg:col-span-3 flex flex-wrap gap-3 pt-3 border-t border-slate-100 mt-2">
            <button type="submit" className="btn-primary py-2.5 px-6 font-bold cursor-pointer">
              Generate Report Grid
            </button>
            
            <button
              type="button"
              onClick={() => handleExport('excel')}
              className="btn-secondary py-2.5 px-5 bg-teal-50 text-teal-600 hover:bg-teal-100/60 border border-teal-200 font-bold cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <FileSpreadsheet size={16} /> Download Excel Spreadsheet
            </button>

            <button
              type="button"
              onClick={() => handleExport('pdf')}
              className="btn-secondary py-2.5 px-5 bg-rose-50 text-rose-600 hover:bg-rose-100/60 border border-rose-200 font-bold cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <FileDown size={16} /> Download Printable PDF Report
            </button>
          </div>
        </form>
      </div>

      {/* Preview Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col justify-between shadow-slate-100/50">
        <div className="p-5 border-b border-slate-100">
          <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">Report Preview Grid</h3>
          <p className="text-slate-500 text-xs font-medium">Preview of the matching grievances list to be exported ({complaints.length} records matched).</p>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : complaints.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <AlertCircle className="text-slate-400 mb-2" size={36} />
              <h3 className="font-bold text-slate-700 text-sm">No match preview records</h3>
              <p className="text-slate-450 text-xs font-medium">Modify filter bounds or date ranges.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Complaint ID</th>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Citizen</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4 font-bold">Priority</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4">Filed Date</th>
                  <th className="px-6 py-4 text-center">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-655">
                {complaints.map((comp) => (
                  <tr key={comp._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-brand-600 font-extrabold">{comp.complaintId}</td>
                    <td className="px-6 py-4 max-w-[200px] truncate font-bold text-slate-800">{comp.title}</td>
                    <td className="px-6 py-4 font-semibold text-slate-800">{comp.citizen?.name}</td>
                    <td className="px-6 py-4 font-medium">{comp.category?.name || 'N/A'}</td>
                    <td className="px-6 py-4 font-semibold text-slate-500">{comp.priority}</td>
                    <td className="px-6 py-4 font-semibold text-slate-600">{comp.status}</td>
                    <td className="px-6 py-4 text-slate-400 font-medium">{new Date(comp.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-center">
                      <Link
                        to={`/admin/complaints/${comp._id}`}
                        className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-brand-600 inline-block cursor-pointer"
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
