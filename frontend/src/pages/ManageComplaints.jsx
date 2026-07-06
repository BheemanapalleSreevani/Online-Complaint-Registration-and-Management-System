import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { complaintsAPI, categoriesAPI } from '../services/api';
import { Search, RefreshCw, ChevronLeft, ChevronRight, Eye, AlertCircle } from 'lucide-react';

const ManageComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [categories, setCategories] = useState([]);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const [loading, setLoading] = useState(true);

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

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 10,
      };
      if (search) params.search = search;
      if (status) params.status = status;
      if (category) params.category = category;
      if (priority) params.priority = priority;

      const res = await complaintsAPI.getAll(params);
      if (res.data && res.data.success) {
        setComplaints(res.data.data);
        setTotalPages(res.data.pagination.pages);
        setTotalRecords(res.data.pagination.total);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchComplaints();
  }, [page, status, category, priority]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchComplaints();
  };

  const handleResetFilters = () => {
    setSearch('');
    setStatus('');
    setCategory('');
    setPriority('');
    setPage(1);
    setTimeout(fetchComplaints, 50);
  };

  const getStatusBadgeClass = (s) => {
    switch (s) {
      case 'Submitted': return 'bg-blue-50 text-blue-600 border border-blue-200/50';
      case 'Under Review': return 'bg-orange-50 text-orange-brand border border-orange-200/50';
      case 'In Progress': return 'bg-brand-50 text-brand-600 border border-brand-200/50';
      case 'Resolved': return 'bg-teal-50 text-teal-600 border border-teal-200/50';
      case 'Closed': return 'bg-slate-100 text-slate-650 border border-slate-200';
      case 'Rejected': return 'bg-rose-50 text-rose-600 border border-rose-200';
      default: return 'bg-slate-50 text-slate-500 border border-slate-200';
    }
  };

  const getPriorityBadgeClass = (p) => {
    switch (p) {
      case 'Low': return 'bg-slate-100 text-slate-600 border border-slate-200';
      case 'Medium': return 'bg-blue-50 text-blue-600 border border-blue-200/50';
      case 'High': return 'bg-orange-50 text-orange-brand border border-orange-200/50';
      case 'Critical': return 'bg-rose-50 text-rose-600 border border-rose-200';
      default: return 'bg-slate-50 text-slate-500 border border-slate-200';
    }
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto animate-fade-in flex flex-col gap-6 text-slate-800">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Manage Grievances</h2>
        <p className="text-slate-500 text-xs font-medium">Examine registered civic complaints, edit urgency priorities, and assign resolution statuses.</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col gap-4 shadow-slate-100/50">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search by Complaint ID, Title, Location, Citizen..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-slate-800 placeholder:text-slate-400"
            />
          </div>
          <button type="submit" className="btn-primary py-2 px-5 text-xs font-bold shadow-sm cursor-pointer">
            Search
          </button>
          <button
            type="button"
            onClick={handleResetFilters}
            className="btn-secondary py-2 px-4 text-xs font-bold bg-white text-slate-600 hover:text-slate-800 border border-slate-200 cursor-pointer"
          >
            <RefreshCw size={14} /> Reset Filters
          </button>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-slate-100 pt-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-450 whitespace-nowrap">Status:</span>
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs font-medium text-slate-700 focus:outline-none"
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

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-450 whitespace-nowrap">Category:</span>
            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(1); }}
              className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs font-medium text-slate-700 focus:outline-none"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-450 whitespace-nowrap">Priority:</span>
            <select
              value={priority}
              onChange={(e) => { setPriority(e.target.value); setPage(1); }}
              className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs font-medium text-slate-700 focus:outline-none"
            >
              <option value="">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table grid */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex-1 flex flex-col justify-between shadow-slate-100/50">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : complaints.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-4">
              <AlertCircle className="text-slate-400 mb-3" size={40} />
              <h3 className="font-bold text-slate-700 text-sm">No complaints logged yet</h3>
              <p className="text-slate-450 text-xs mt-1 font-medium">Grievances database is empty or matching search patterns not found.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Complaint ID</th>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Citizen Name</th>
                  <th className="px-6 py-4 font-bold">Priority</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Filed Date</th>
                  <th className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-655">
                {complaints.map((comp) => (
                  <tr key={comp._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-brand-600 font-extrabold">{comp.complaintId}</td>
                    <td className="px-6 py-4 max-w-[200px] truncate font-bold text-slate-800">{comp.title}</td>
                    <td className="px-6 py-4 font-medium">{comp.category?.name || 'N/A'}</td>
                    <td className="px-6 py-4 font-semibold text-slate-800">{comp.citizen?.name || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span className={`status-badge text-[9px] uppercase ${getPriorityBadgeClass(comp.priority)}`}>
                        {comp.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`status-badge text-[9px] uppercase ${getStatusBadgeClass(comp.status)}`}>
                        {comp.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 font-medium">{new Date(comp.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-center">
                      <Link
                        to={`/admin/complaints/${comp._id}`}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-600 hover:text-brand-700 hover:bg-brand-50 px-2.5 py-1.5 rounded-lg border border-brand-200/40 transition-all cursor-pointer shadow-sm"
                      >
                        <Eye size={12} /> Manage Issue
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Paginated Footer */}
        {complaints.length > 0 && (
          <div className="px-6 py-4 border-t border-slate-200/60 bg-slate-50/40 flex items-center justify-between">
            <span className="text-slate-450 text-xs font-semibold">
              Showing Page {page} of {totalPages} ({totalRecords} records total)
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="btn-secondary py-1.5 px-3 text-xs font-semibold bg-white text-slate-550 border border-slate-200 disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft size={14} /> Prev
              </button>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className="btn-secondary py-1.5 px-3 text-xs font-semibold bg-white text-slate-550 border border-slate-200 disabled:opacity-40 cursor-pointer"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageComplaints;
