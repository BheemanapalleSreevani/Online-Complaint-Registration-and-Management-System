import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { dashboardAPI } from '../services/api';
import { FileText, Clock, CheckCircle2, ChevronRight, Activity, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await dashboardAPI.getCitizenStats();
        if (res.data && res.data.success) {
          setStats(res.data.data.stats);
          setRecent(res.data.data.recentActivity);
        }
      } catch (err) {
        console.error('Error fetching dashboard details', err);
      }
      setLoading(false);
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Formatting chart data with violet/teal/orange palette
  const chartData = stats
    ? [
        { name: 'Pending', count: stats.pending, color: '#F97316' },     // Orange
        { name: 'In Progress', count: stats.inProgress, color: '#7C3AED' }, // Violet
        { name: 'Resolved', count: stats.resolved, color: '#14B8A6' },   // Teal
        { name: 'Closed', count: stats.closed, color: '#64748B' },       // Slate
      ]
    : [];

  const cards = [
    { label: 'Total Submitted', count: stats?.total || 0, icon: FileText, color: 'text-brand-600 bg-brand-50 border-brand-200/60' },
    { label: 'Under Review / Pending', count: stats?.pending || 0, icon: Clock, color: 'text-orange-brand bg-orange-50 border-orange-200/50' },
    { label: 'In Progress', count: stats?.inProgress || 0, icon: Activity, color: 'text-violet-600 bg-violet-50 border-violet-200/50' },
    { label: 'Resolved Tickets', count: stats?.resolved || 0, icon: CheckCircle2, color: 'text-teal-brand bg-teal-50 border-teal-200/50' },
  ];

  return (
    <div className="flex-1 p-6 flex flex-col gap-8 overflow-y-auto animate-fade-in text-slate-800">
      {/* Welcome header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Citizen Dashboard</h2>
          <p className="text-slate-500 text-xs font-medium">Welcome back, {user?.name}. Monitor and track the resolution of your complaints.</p>
        </div>
        <Link to="/create-complaint" className="btn-primary py-2.5 px-4 text-xs font-bold shadow-md cursor-pointer">
          <PlusCircle size={16} /> File New Complaint
        </Link>
      </div>

      {/* Stats counter cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className={`p-5 bg-white border rounded-2xl shadow-sm flex items-center gap-4 card-hover shadow-slate-100/50 ${card.color.split(' ')[2]}`}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${card.color.split(' ').slice(0,2).join(' ')}`}>
                <Icon size={22} />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">{card.label}</span>
                <span className="text-2xl font-black text-slate-800 block mt-0.5">{card.count}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid: Charts & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recharts Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm card-hover shadow-slate-100/40">
          <h3 className="text-sm font-extrabold text-slate-800 mb-4 tracking-tight">Complaint Distribution Status</h3>
          <div className="h-64">
            {stats?.total === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs font-semibold">
                No active complaints registered to plot data.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="name" stroke="#64748B" fontSize={11} fontStyle="bold" axisLine={false} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={11} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: '#F8FAFC' }} contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }} />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]} maxBarSize={45}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Recent complaints table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex flex-col justify-between card-hover shadow-slate-100/40">
          <div>
            <h3 className="text-sm font-extrabold text-slate-800 mb-4 tracking-tight">Recent Activity</h3>
            <div className="flex flex-col gap-3">
              {recent.length === 0 ? (
                <p className="text-slate-400 text-xs py-8 text-center font-medium">No complaints filed yet.</p>
              ) : (
                recent.map((comp) => (
                  <Link
                    key={comp._id}
                    to={`/complaints/${comp._id}`}
                    className="p-3 hover:bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between gap-3 group transition-all"
                  >
                    <div className="truncate">
                      <span className="text-[10px] font-bold text-brand-600 block">{comp.complaintId}</span>
                      <h4 className="text-xs font-extrabold text-slate-700 truncate group-hover:text-brand-600 transition-colors">
                        {comp.title}
                      </h4>
                      <span className="text-[10px] text-slate-400 block mt-0.5 font-medium">
                        {new Date(comp.createdAt).toLocaleDateString()} | {comp.category?.name}
                      </span>
                    </div>
                    <span className={`status-badge uppercase text-[9px] font-bold shrink-0 ${
                      comp.status === 'Resolved'
                        ? 'bg-teal-50 text-teal-600 border border-teal-200/50'
                        : comp.status === 'Closed'
                        ? 'bg-slate-100 text-slate-600 border border-slate-200'
                        : comp.status === 'In Progress'
                        ? 'bg-brand-50 text-brand-600 border border-brand-200/50'
                        : 'bg-orange-50 text-orange-brand border border-orange-200/50'
                    }`}>
                      {comp.status}
                    </span>
                  </Link>
                ))
              )}
            </div>
          </div>
          {recent.length > 0 && (
            <Link
              to="/my-complaints"
              className="text-xs font-bold text-brand-600 hover:text-brand-700 mt-4 flex items-center justify-center gap-1 hover:underline"
            >
              View all registered complaints <ChevronRight size={14} />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
