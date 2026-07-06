import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { Search, ShieldAlert, UserCheck, UserX, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('citizen');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 10,
        role: roleFilter,
      };
      if (search) params.search = search;

      const res = await adminAPI.getUsers(params);
      if (res.data && res.data.success) {
        setUsers(res.data.data);
        setTotalPages(res.data.pagination.pages);
        setTotalRecords(res.data.pagination.total);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleToggleBlock = async (user) => {
    setMessage('');
    try {
      const res = await adminAPI.toggleBlock(user._id);
      if (res.data && res.data.success) {
        setMessage(res.data.message);
        fetchUsers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleChangeRole = async (user) => {
    setMessage('');
    const nextRole = user.role === 'admin' ? 'citizen' : 'admin';
    if (!window.confirm(`Are you sure you want to change role of ${user.name} to ${nextRole}?`)) {
      return;
    }
    try {
      const res = await adminAPI.changeRole(user._id, { role: nextRole });
      if (res.data && res.data.success) {
        setMessage(res.data.message);
        fetchUsers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto animate-fade-in flex flex-col gap-6 text-slate-800">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Manage System Users</h2>
        <p className="text-slate-500 text-xs font-medium">Examine registered citizen profiles, toggle role specifications, and suspend accounts.</p>
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs font-semibold rounded-xl flex gap-2 animate-fade-in">
          <UserCheck size={16} /> <span>{message}</span>
        </div>
      )}

      {/* Query box filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between shadow-slate-100/50">
        <form onSubmit={handleSearchSubmit} className="flex gap-2 flex-1 w-full md:max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search by Citizen Name or Email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-medium text-slate-800 placeholder:text-slate-400"
            />
          </div>
          <button type="submit" className="btn-primary py-2 px-5 text-xs font-bold shadow-sm cursor-pointer">
            Search
          </button>
        </form>

        <div className="flex bg-slate-100/80 p-1 rounded-xl border border-slate-200/60 w-full md:w-auto justify-center">
          <button
            onClick={() => { setRoleFilter('citizen'); setPage(1); }}
            className={`py-1.5 px-4 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              roleFilter === 'citizen' ? 'bg-white text-brand-600 shadow-sm border border-slate-200/60' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Citizens
          </button>
          <button
            onClick={() => { setRoleFilter('admin'); setPage(1); }}
            className={`py-1.5 px-4 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              roleFilter === 'admin' ? 'bg-white text-brand-600 shadow-sm border border-slate-200/60' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Admins
          </button>
        </div>
      </div>

      {/* Users table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col justify-between shadow-slate-100/50">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-4">
              <AlertCircle className="text-slate-400 mb-3" size={40} />
              <h3 className="font-bold text-slate-700 text-sm">No registered profiles found</h3>
              <p className="text-slate-450 text-xs mt-1 font-medium">Grievances database does not contain matches for query.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">User Details</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Phone</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-655">
                {users.map((usr) => (
                  <tr key={usr._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-3">
                      {usr.avatarUrl ? (
                        <img src={usr.avatarUrl} alt="" className="w-8.5 h-8.5 rounded-full object-cover border border-slate-200" />
                      ) : (
                        <div className="w-8.5 h-8.5 rounded-full bg-brand-50 border border-brand-200/50 text-brand-600 font-extrabold flex items-center justify-center text-xs">
                          {usr.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-slate-800">{usr.name}</h4>
                        <span className="text-[9px] text-slate-400 block uppercase font-bold tracking-wider">{usr.role}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-medium">{usr.email}</td>
                    <td className="px-6 py-4 font-semibold text-slate-500">{usr.phone || 'N/A'}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`status-badge text-[9px] uppercase border ${
                        usr.isBlocked ? 'bg-rose-50 text-rose-600 border border-rose-200/60' : 'bg-teal-50 text-teal-600 border border-teal-200/60'
                      }`}>
                        {usr.isBlocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center flex items-center justify-center gap-3">
                      {/* Block toggle */}
                      <button
                        onClick={() => handleToggleBlock(usr)}
                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer shadow-sm ${
                          usr.isBlocked 
                            ? 'text-teal-600 border border-teal-200 hover:bg-teal-50 bg-white' 
                            : 'text-rose-600 border border-rose-200 hover:bg-rose-55 bg-white'
                        }`}
                      >
                        {usr.isBlocked ? <UserCheck size={12} /> : <UserX size={12} />}
                        {usr.isBlocked ? 'Unblock' : 'Block Account'}
                      </button>

                      {/* Change role */}
                      <button
                        onClick={() => handleChangeRole(usr)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-800 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer shadow-sm"
                      >
                        <ShieldAlert size={12} /> Change Role
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Paginated Footer */}
        {users.length > 0 && (
          <div className="px-6 py-4 border-t border-slate-200/60 bg-slate-50/40 flex items-center justify-between">
            <span className="text-slate-450 text-xs font-semibold">
              Showing Page {page} of {totalPages} ({totalRecords} records total)
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="btn-secondary py-1.5 px-3 text-xs font-semibold bg-white text-slate-500 hover:text-slate-800 border border-slate-200 disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft size={14} /> Prev
              </button>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className="btn-secondary py-1.5 px-3 text-xs font-semibold bg-white text-slate-500 hover:text-slate-800 border border-slate-200 disabled:opacity-40 cursor-pointer"
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

export default ManageUsers;
