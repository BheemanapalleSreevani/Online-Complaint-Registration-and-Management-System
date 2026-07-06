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

  // Modern vibrant palette for Category Pie Chart
  const PIE_COLORS = ['#7C3AED', '#14B8A6', '#F97316', '#22C55E', '#EC4899', '#3B82F6'];

  const overviewCards = [
    { label: 'Registered Citizens', count: counters?.totalUsers || 0, icon: Users, color: 'text-blue-600 bg-blue-50 border-blue-200/60' },
    { label: 'Total Complaints', count: counters?.totalComplaints || 0, icon: FileText, color: 'text-brand-600 bg-brand-50 border-brand-200/60' },
    { label: 'Under Review / Submitted', count: (counters?.Submitted || 0) + (counters?.UnderReview || 0), icon: Clock, color: 'text-orange-brand bg-orange-50 border-orange-200/50' },
    { label: 'Resolved / Closed', count: (counters?.Resolved || 0) + (counters?.Closed || 0), icon: CheckCircle2, color: 'text-teal-brand bg-teal-50 border-teal-200/50' },
  ];

  return (
    <div className="flex-1 p-6 overflow-y-auto animate-fade-in flex flex-col gap-6 text-slate-800">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Executive Management Console</h2>
        <p className="text-slate-500 text-xs font-medium">Monitor overall civic grievance statistics, satisfaction index, and system performance indicators.</p>
      </div>

      {/* Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {overviewCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className={`p-5 bg-white border border-slate-200/85 rounded-2xl shadow-sm flex items-center gap-4 card-hover shadow-slate-100/50 ${card.color.split(' ')[2]}`}>
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

      {/* Performance KPIs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm card-hover shadow-slate-100/50">
        <div className="flex items-center gap-4 border-r border-slate-100 pr-5">
          <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 border border-brand-200/50 flex items-center justify-center font-bold">
            <Clock size={24} />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Average Resolution Time</span>
            <span className="text-2xl font-black text-slate-800 mt-0.5 block">{averageResolutionTimeDays} Days</span>
          </div>
        </div>

        <div className="flex items-center gap-4 pl-5">
          <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-brand border border-orange-200/50 flex items-center justify-center font-bold">
            <Star size={24} fill="#F97316" className="text-orange-brand" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Satisfaction Index Rating</span>
            <span className="text-2xl font-black text-slate-800 mt-0.5 block">{averageSatisfaction} / 5.0 Stars</span>
          </div>
        </div>
      </div>

      {/* Charts Block */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend line Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex flex-col justify-between card-hover shadow-slate-100/50">
          <h3 className="text-sm font-extrabold text-slate-800 mb-4 tracking-tight flex items-center gap-1.5">
            <Calendar size={16} className="text-brand-600" /> Monthly Grievance Trends (Last 6 Months)
          </h3>
          <div className="h-64">
            {trendData.length === 0 ? (
              <p className="text-center text-slate-400 text-xs py-20 font-medium">No monthly trends logged yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="month" stroke="#64748B" fontSize={11} fontStyle="bold" axisLine={false} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={11} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }} />
                  <Line type="monotone" dataKey="count" stroke="#7C3AED" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Categories Pie Chart */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex flex-col justify-between card-hover shadow-slate-100/50">
          <h3 className="text-sm font-extrabold text-slate-800 mb-4 tracking-tight flex items-center gap-1.5">
            <BarChart3 size={16} className="text-brand-600" /> Category Breakdown
          </h3>
          <div className="h-56 relative flex items-center justify-center">
            {categoryStats.length === 0 ? (
              <p className="text-center text-slate-400 text-xs py-20 font-medium">No complaints logged.</p>
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
          <div className="flex flex-wrap justify-center gap-3 pt-2 text-[10px] font-bold text-slate-500">
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
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm card-hover shadow-slate-100/50">
          <h3 className="text-sm font-extrabold text-slate-800 mb-4 tracking-tight flex items-center gap-1.5">
            <Star size={16} fill="#F97316" className="text-orange-brand" /> Citizen Review Distributions
          </h3>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ratingDistribution} layout="vertical" margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                <XAxis type="number" stroke="#64748B" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis dataKey="rating" type="category" stroke="#64748B" fontSize={10} fontStyle="bold" axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }} />
                <Bar dataKey="count" fill="#F97316" radius={[0, 5, 5, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recently Registered Citizens list */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex flex-col justify-between card-hover shadow-slate-100/50">
          <div>
            <h3 className="text-sm font-extrabold text-slate-800 mb-4 tracking-tight">Recent Registered Citizens</h3>
            <div className="flex flex-col gap-3">
              {recentUsers.length === 0 ? (
                <p className="text-slate-400 text-xs py-8 text-center font-medium">No citizens registered yet.</p>
              ) : (
                recentUsers.map((user) => (
                  <div key={user._id} className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl flex items-center justify-between gap-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt="" className="w-9 h-9 rounded-full object-cover" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-brand-50 border border-brand-200/50 text-brand-600 font-extrabold flex items-center justify-center text-sm animate-pulse">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h4 className="text-xs font-extrabold text-slate-700">{user.name}</h4>
                        <span className="text-[10px] text-slate-450 block font-medium">{user.email} | {user.phone || 'No phone'}</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold">
                      Joined: {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
          <Link to="/admin/users" className="text-xs font-bold text-brand-600 hover:text-brand-700 mt-4 flex items-center justify-center gap-1 hover:underline">
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
