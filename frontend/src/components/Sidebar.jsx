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

  const activeStyle = 'flex items-center gap-3 px-4 py-3.5 bg-gradient-to-r from-brand-600 to-violet-600 text-white rounded-xl shadow-lg shadow-brand-500/10 font-bold text-sm transform scale-[1.01] transition-all duration-300';
  const inactiveStyle = 'flex items-center gap-3 px-4 py-3.5 text-zinc-400 hover:text-brand-400 hover:bg-zinc-800/40 hover:pl-5 rounded-xl font-semibold text-sm transition-all duration-300';


  const links = user.role === 'admin' ? adminLinks : citizenLinks;

  return (
    <aside className="w-64 h-[calc(100vh-65px)] sticky top-[65px] bg-zinc-900 border-r border-zinc-850 p-5 hidden md:flex flex-col justify-between">
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-4 mb-2">
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
      <div className="p-4 bg-zinc-950/60 rounded-2xl border border-zinc-800/80 text-center">
        <h4 className="text-xs font-bold text-zinc-300">Need Assistance?</h4>
        <p className="text-[10px] text-zinc-500 mt-1.5 leading-relaxed">Contact the national grievance helpline at 1800-11-2005.</p>
      </div>
    </aside>
  );
};

export default Sidebar;
