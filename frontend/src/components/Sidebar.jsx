import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  User,
  FolderOpen,
  Users,
  BarChart3,
  Settings,
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useContext(AuthContext);

  if (!user) return null;

  const citizenLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/create-complaint', label: 'File Complaint', icon: PlusCircle },
    { to: '/my-complaints', label: 'My Complaints', icon: FileText },
    { to: '/profile', label: 'My Profile', icon: User },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Overview Dashboard', icon: LayoutDashboard },
    { to: '/admin/complaints', label: 'Manage Complaints', icon: FileText },
    { to: '/admin/categories', label: 'Complaint Categories', icon: FolderOpen },
    { to: '/admin/users', label: 'Manage Citizens', icon: Users },
    { to: '/admin/reports', label: 'Reports & Export', icon: BarChart3 },
    { to: '/profile', label: 'My Profile', icon: User },
  ];

  const activeStyle = 'flex items-center gap-3 px-4 py-3.5 bg-brand-50 text-brand-600 rounded-xl font-bold text-sm transition-all duration-300 shadow-sm shadow-brand-100/50 border border-brand-200/30';
  const inactiveStyle = 'flex items-center gap-3 px-4 py-3.5 text-slate-500 hover:text-brand-650 hover:bg-slate-50 rounded-xl font-semibold text-sm transition-all duration-300';


  const links = user.role === 'admin' ? adminLinks : citizenLinks;

  return (
    <aside className="w-64 h-[calc(100vh-65px)] sticky top-[65px] bg-white border-r border-slate-200/80 p-5 hidden md:flex flex-col justify-between">
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 mb-2">
          Core Actions
        </span>
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => (isActive ? activeStyle : inactiveStyle)}
            >
              <Icon size={18} />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Support Info Block */}
      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-center">
        <h4 className="text-xs font-bold text-slate-700">Need Assistance?</h4>
        <p className="text-[10px] text-slate-500 mt-1.5 leading-relaxed font-medium">Contact the national grievance helpline at 1800-11-2005.</p>
      </div>
    </aside>
  );
};

export default Sidebar;
