import React, { useState, useEffect } from 'react';
import { dashboardAPI } from '../services/api';
import { Link } from 'react-router-dom';
import { Users, FileText, CheckCircle2, Clock, ShieldAlert, BarChart3, Star, Calendar } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await dashboardAPI.getAdminStats();
        if (res.data && res.data.success) {
          setStats(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load admin stats', err);
      }
      setLoading(false);
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const {
    stats: counters,
    categoryStats,
    trendData,
    averageResolutionTimeDays,
    averageSatisfaction,
    ratingDistribution,
    recentUsers,
  } = stats;

  // Colors for Category Pie Chart
  const PIE_COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#8B5CF6'];

  const overviewCards = [
    { label: 'Registered Citizens', count: counters?.totalUsers || 0, icon: Users, color: 'text-blue-400 bg-blue-500/10 border-blue-500/25' },
    { label: 'Total Complaints', count: counters?.totalComplaints || 0, icon: FileText, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/25' },
    { label: 'Under Review / Submitted', count: (counters?.Submitted || 0) + (counters?.UnderReview || 0), icon: Clock, color: 'text-amber-400 bg-amber-500/10 border-amber-500/25' },
    { label: 'Resolved / Closed', count: (counters?.Resolved || 0) + (counters?.Closed || 0), icon: CheckCircle2, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25' },
  ];

  return (
    <div className="flex-1 p-6 overflow-y-auto animate-fade-in flex flex-col gap-6 text-slate-100">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-100 tracking-tight">Executive Management Console</h2>
        <p className="text-zinc-500 text-xs">Monitor overall civic grievance statistics, satisfaction index, and system performance indicators.</p>
      </div>

      {/* Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {overviewCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className={`p-5 bg-zinc-900 border border-zinc-800/80 rounded-2xl shadow-sm flex items-center gap-4 card-hover ${card.color.split(' ')[2]}`}>
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

      {/* Performance KPIs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 bg-zinc-900 border border-zinc-805 rounded-2xl p-5 shadow-sm card-hover">
        <div className="flex items-center gap-4 border-r border-zinc-850 pr-5">
          <div className="w-12 h-12 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/25 flex items-center justify-center font-bold">
            <Clock size={24} />
          </div>
          <div>
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wide block">Average Resolution Time</span>
            <span className="text-2xl font-black text-slate-100 mt-0.5 block">{averageResolutionTimeDays} Days</span>
          </div>
        </div>

        <div className="flex items-center gap-4 pl-5">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/25 flex items-center justify-center font-bold">
            <Star size={24} fill="#F59E0B" className="text-amber-400" />
          </div>
          <div>
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wide block">Satisfaction Index Rating</span>
            <span className="text-2xl font-black text-slate-100 mt-0.5 block">{averageSatisfaction} / 5.0 Stars</span>
          </div>
        </div>
      </div>

      {/* Charts Block */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend line Chart */}
        <div className="lg:col-span-2 bg-zinc-900 rounded-2xl border border-zinc-800/80 p-5 shadow-sm flex flex-col justify-between card-hover">
          <h3 className="text-sm font-extrabold text-slate-200 mb-4 tracking-tight flex items-center gap-1.5">
            <Calendar size={16} className="text-brand-400" /> Monthly Grievance Trends (Last 6 Months)
          </h3>
          <div className="h-64">
            {trendData.length === 0 ? (
              <p className="text-center text-zinc-500 text-xs py-20">No monthly trends logged yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="month" stroke="#71717a" fontSize={11} fontStyle="bold" axisLine={false} tickLine={false} />
                  <YAxis stroke="#71717a" fontSize={11} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #27272a', backgroundColor: '#18181b' }} />
                  <Line type="monotone" dataKey="count" stroke="#6366F1" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Categories Pie Chart */}
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800/80 p-5 shadow-sm flex flex-col justify-between card-hover">
          <h3 className="text-sm font-extrabold text-slate-200 mb-4 tracking-tight flex items-center gap-1.5">
            <BarChart3 size={16} className="text-brand-400" /> Category Breakdown
          </h3>
          <div className="h-56 relative flex items-center justify-center">
            {categoryStats.length === 0 ? (
              <p className="text-center text-zinc-500 text-xs py-20">No complaints logged.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="count"
                  >
                    {categoryStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          {/* Pie Chart Legend */}
          <div className="flex flex-wrap justify-center gap-3 pt-2 text-[10px] font-bold text-zinc-400">
            {categoryStats.map((item, index) => (
              <div key={index} className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}></span>
                <span>{item.name} ({item.count})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Satisfaction rating Distribution */}
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800/80 p-5 shadow-sm card-hover">
          <h3 className="text-sm font-extrabold text-slate-200 mb-4 tracking-tight flex items-center gap-1.5">
            <Star size={16} fill="#F59E0B" className="text-amber-400" /> Citizen Review Distributions
          </h3>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ratingDistribution} layout="vertical" margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#27272a" />
                <XAxis type="number" stroke="#71717a" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis dataKey="rating" type="category" stroke="#71717a" fontSize={10} fontStyle="bold" axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #27272a', backgroundColor: '#18181b' }} />
                <Bar dataKey="count" fill="#F59E0B" radius={[0, 5, 5, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recently Registered Citizens list */}
        <div className="lg:col-span-2 bg-zinc-900 rounded-2xl border border-zinc-800/80 p-5 shadow-sm flex flex-col justify-between card-hover">
          <div>
            <h3 className="text-sm font-extrabold text-slate-200 mb-4 tracking-tight">Recent Registered Citizens</h3>
            <div className="flex flex-col gap-3">
              {recentUsers.length === 0 ? (
                <p className="text-zinc-500 text-xs py-8 text-center">No citizens registered yet.</p>
              ) : (
                recentUsers.map((user) => (
                  <div key={user._id} className="p-3 bg-zinc-950/40 border border-zinc-850 rounded-xl flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt="" className="w-9 h-9 rounded-full object-cover" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-indigo-950 border border-indigo-900/40 text-indigo-400 font-extrabold flex items-center justify-center text-sm">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h4 className="text-xs font-extrabold text-slate-300">{user.name}</h4>
                        <span className="text-[10px] text-zinc-500 block">{user.email} | {user.phone || 'No phone'}</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-zinc-550 font-bold">
                      Joined: {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
          <Link to="/admin/users" className="text-xs font-bold text-brand-400 hover:text-brand-300 mt-4 flex items-center justify-center gap-1 hover:underline">
            Manage all system users <ChevronRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
};

// Helper for chevron right in link
const ChevronRight = ({ size }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
);

export default AdminDashboard;
