import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { complaintsAPI, categoriesAPI } from '../services/api';
import { Search, Filter, RefreshCw, ChevronLeft, ChevronRight, Eye, AlertCircle } from 'lucide-react';

const MyComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // Filtering & Pagination state
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  
  const [loading, setLoading] = useState(true);

  // Fetch categories on load
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
        limit: 8,
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
    // Workaround to let state updates apply, or call directly
    setTimeout(fetchComplaints, 50);
  };

  const getStatusBadgeClass = (s) => {
    switch (s) {
      case 'Submitted':
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/25';
      case 'Under Review':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/25';
      case 'In Progress':
        return 'bg-purple-500/10 text-purple-400 border border-purple-500/25';
      case 'Resolved':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25';
      case 'Closed':
        return 'bg-zinc-800 text-zinc-400 border border-zinc-700';
      case 'Rejected':
        return 'bg-rose-500/10 text-rose-450 border border-rose-500/25';
      default:
        return 'bg-zinc-900 text-zinc-400';
    }
  };

  const getPriorityBadgeClass = (p) => {
    switch (p) {
      case 'Low':
        return 'bg-zinc-800 text-zinc-400 border border-zinc-700';
      case 'Medium':
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/25';
      case 'High':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/25';
      case 'Critical':
        return 'bg-rose-500/10 text-rose-450 border border-rose-500/25';
      default:
        return 'bg-zinc-900 text-zinc-400';
    }
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto animate-fade-in flex flex-col gap-6 text-slate-100">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-100 tracking-tight">My Registered Complaints</h2>
        <p className="text-zinc-500 text-xs">View all grievances you have logged, track live milestones, and add rating reviews.</p>
      </div>

      {/* Filter and search actions header */}
      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-4 shadow-sm flex flex-col gap-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3.5 text-zinc-500" size={16} />
            <input
              type="text"
              placeholder="Search by Complaint ID, Title, Location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-slate-200 placeholder:text-zinc-650"
            />
          </div>
          <button type="submit" className="btn-primary py-2 px-5 text-xs font-bold shadow-sm cursor-pointer">
            Search
          </button>
          <button
            type="button"
            onClick={handleResetFilters}
            className="btn-secondary py-2 px-4 text-xs font-bold bg-zinc-950 text-zinc-400 hover:text-zinc-200 border border-zinc-850 cursor-pointer"
          >
            <RefreshCw size={14} /> Clear Filters
          </button>
        </form>

        {/* Quick Dropdown Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-zinc-850 pt-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-zinc-500 whitespace-nowrap">Status:</span>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-xs font-medium text-slate-255 focus:outline-none"
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

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-zinc-500 whitespace-nowrap">Category:</span>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-xs font-medium text-slate-255 focus:outline-none"
            >
              <option value="" className="bg-zinc-900">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id} className="bg-zinc-900">
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-zinc-500 whitespace-nowrap">Priority:</span>
            <select
              value={priority}
              onChange={(e) => {
                setPriority(e.target.value);
                setPage(1);
              }}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-xs font-medium text-slate-255 focus:outline-none"
            >
              <option value="" className="bg-zinc-900">All Priorities</option>
              <option value="Low" className="bg-zinc-900">Low</option>
              <option value="Medium" className="bg-zinc-900">Medium</option>
              <option value="High" className="bg-zinc-900">High</option>
              <option value="Critical" className="bg-zinc-900">Critical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid List/Table Container */}
      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 shadow-sm overflow-hidden flex-1 flex flex-col justify-between">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="w-10 h-10 border-4 border-brand-650 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : complaints.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-4">
              <AlertCircle className="text-zinc-650 mb-3" size={40} />
              <h3 className="font-bold text-slate-300 text-sm">No complaints found</h3>
              <p className="text-zinc-500 text-xs mt-1">Try relaxing filters or search terms.</p>
              <Link to="/create-complaint" className="btn-primary py-2 px-4 text-xs font-bold mt-5 shadow-sm cursor-pointer">
                File a Grievance Now
              </Link>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-950/60 border-b border-zinc-850 text-zinc-500 text-[10px] font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Complaint ID</th>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Priority</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Submitted Date</th>
                  <th className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850 text-xs font-medium text-zinc-450">
                {complaints.map((comp) => (
                  <tr key={comp._id} className="hover:bg-zinc-800/15 transition-colors">
                    <td className="px-6 py-4 text-brand-400 font-extrabold">{comp.complaintId}</td>
                    <td className="px-6 py-4 max-w-[200px] truncate font-bold text-slate-300">{comp.title}</td>
                    <td className="px-6 py-4">{comp.category?.name || 'N/A'}</td>
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
                    <td className="px-6 py-4 text-zinc-500 font-semibold">
                      {new Date(comp.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Link
                        to={`/complaints/${comp._id}`}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-400 hover:text-brand-300 hover:bg-brand-950/40 px-2.5 py-1 rounded-lg border border-brand-500/10 transition-all cursor-pointer"
                      >
                        <Eye size={12} /> View Details
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
          <div className="px-6 py-4 border-t border-zinc-850 bg-zinc-950/30 flex items-center justify-between">
            <span className="text-zinc-550 text-xs font-semibold">
              Showing Page {page} of {totalPages} ({totalRecords} records total)
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="btn-secondary py-1.5 px-3 text-xs font-semibold bg-zinc-950 text-zinc-400 hover:text-zinc-200 border border-zinc-800 disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft size={14} /> Prev
              </button>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className="btn-secondary py-1.5 px-3 text-xs font-semibold bg-zinc-950 text-zinc-400 hover:text-zinc-200 border border-zinc-800 disabled:opacity-40 cursor-pointer"
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

export default MyComplaints;
