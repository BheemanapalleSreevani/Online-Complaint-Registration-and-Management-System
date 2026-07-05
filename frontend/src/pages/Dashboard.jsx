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

  // Formatting chart data
  const chartData = stats
    ? [
        { name: 'Pending', count: stats.pending, color: '#6366F1' },
        { name: 'In Progress', count: stats.inProgress, color: '#A855F7' },
        { name: 'Resolved', count: stats.resolved, color: '#10B981' },
        { name: 'Closed', count: stats.closed, color: '#71717A' },
      ]
    : [];

  const cards = [
    { label: 'Total Submitted', count: stats?.total || 0, icon: FileText, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/25' },
    { label: 'Under Review / Pending', count: stats?.pending || 0, icon: Clock, color: 'text-amber-400 bg-amber-500/10 border-amber-500/25' },
    { label: 'In Progress', count: stats?.inProgress || 0, icon: Activity, color: 'text-purple-400 bg-purple-500/10 border-purple-500/25' },
    { label: 'Resolved Tickets', count: stats?.resolved || 0, icon: CheckCircle2, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25' },
  ];

  return (
    <div className="flex-1 p-6 flex flex-col gap-8 overflow-y-auto animate-fade-in text-slate-100">
      {/* Welcome header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-100 tracking-tight">Citizen Dashboard</h2>
          <p className="text-zinc-500 text-xs">Welcome back, {user?.name}. Monitor and track the resolution of your complaints.</p>
        </div>
        <Link to="/create-complaint" className="btn-primary py-2 px-4 text-xs font-bold shadow-md cursor-pointer">
          <PlusCircle size={16} /> File New Complaint
        </Link>
      </div>

      {/* Stats counter cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className={`p-5 bg-zinc-900 border rounded-2xl shadow-sm flex items-center gap-4 card-hover ${card.color.split(' ')[2]}`}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${card.color.split(' ').slice(0,2).join(' ')}`}>
                <Icon size={22} />
              </div>
              <div>
                <span className="text-xs font-bold text-zinc-500 block uppercase tracking-wide">{card.label}</span>
                <span className="text-2xl font-black text-slate-100 block mt-0.5">{card.count}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid: Charts & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recharts Bar Chart */}
        <div className="lg:col-span-2 bg-zinc-900 rounded-2xl border border-zinc-800/80 p-5 shadow-sm card-hover">
          <h3 className="text-sm font-extrabold text-slate-200 mb-4 tracking-tight">Complaint Distribution Status</h3>
          <div className="h-64">
            {stats?.total === 0 ? (
              <div className="h-full flex items-center justify-center text-zinc-500 text-xs font-medium">
                No active complaints registered to plot data.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                  <XAxis dataKey="name" stroke="#71717a" fontSize={11} fontStyle="bold" axisLine={false} tickLine={false} />
                  <YAxis stroke="#71717a" fontSize={11} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: '#1f1f23' }} contentStyle={{ borderRadius: '12px', border: '1px solid #27272a', backgroundColor: '#18181b' }} />
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
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800/80 p-5 shadow-sm flex flex-col justify-between card-hover">
          <div>
            <h3 className="text-sm font-extrabold text-slate-200 mb-4 tracking-tight">Recent Activity</h3>
            <div className="flex flex-col gap-3">
              {recent.length === 0 ? (
                <p className="text-zinc-500 text-xs py-8 text-center">No complaints filed yet.</p>
              ) : (
                recent.map((comp) => (
                  <Link
                    key={comp._id}
                    to={`/complaints/${comp._id}`}
                    className="p-3 hover:bg-zinc-800/30 border border-zinc-800/60 rounded-xl flex items-center justify-between gap-3 group transition-all"
                  >
                    <div className="truncate">
                      <span className="text-[10px] font-bold text-brand-400 block">{comp.complaintId}</span>
                      <h4 className="text-xs font-extrabold text-slate-300 truncate group-hover:text-brand-400 transition-colors">
                        {comp.title}
                      </h4>
                      <span className="text-[10px] text-zinc-500 block mt-0.5">
                        {new Date(comp.createdAt).toLocaleDateString()} | {comp.category?.name}
                      </span>
                    </div>
                    <span className={`status-badge uppercase text-[9px] font-bold shrink-0 ${
                      comp.status === 'Resolved' || comp.status === 'Closed'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25'
                        : comp.status === 'In Progress'
                        ? 'bg-purple-500/10 text-purple-400 border border-purple-500/25'
                        : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/25'
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
              className="text-xs font-bold text-brand-400 hover:text-brand-350 mt-4 flex items-center justify-center gap-1 hover:underline"
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
