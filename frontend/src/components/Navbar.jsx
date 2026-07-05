import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { notificationsAPI } from '../services/api';
import { Bell, LogOut, User as UserIcon, ShieldAlert, Check } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await notificationsAPI.getAll();
      if (res.data && res.data.success) {
        setNotifications(res.data.data);
        setUnreadCount(res.data.data.filter((n) => !n.isRead).length);
      }
    } catch (err) {
      console.error('Error fetching notifications', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, [user]);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationsAPI.markAsRead(id);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-40 w-full glass-panel border-b border-zinc-800/80 px-6 py-3 flex items-center justify-between">
      {/* Brand logo */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center shadow-md shadow-brand-500/20 text-white font-black text-lg tracking-wider">
          OC
        </div>
        <div>
          <span className="font-extrabold text-slate-200 text-base block tracking-tight leading-tight">
            Grievance Portal
          </span>
          <span className="text-[10px] text-brand-600 font-semibold tracking-wider uppercase block">
            National Grievance Cell
          </span>
        </div>
      </div>

      {/* Action items */}
      <div className="flex items-center gap-5">
        {user && (
          <>
            {/* Role indicator */}
            <span className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              user.role === 'admin' 
                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/25' 
                : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/25'
            }`}>
              {user.role === 'admin' && <ShieldAlert size={12} />}
              {user.role}
            </span>

            {/* Notifications Menu */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-slate-400 hover:bg-zinc-800 rounded-lg transition-colors relative cursor-pointer"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 glass-panel border border-zinc-800/80 rounded-xl shadow-xl py-2 z-50 animate-fade-in">
                  <div className="px-4 py-2 border-b border-zinc-850 flex items-center justify-between">
                    <span className="font-bold text-slate-200 text-sm">Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[11px] font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-0.5 cursor-pointer"
                      >
                        <Check size={12} /> Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-6 text-center text-slate-500 text-xs">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n._id}
                          onClick={() => {
                            if (!n.isRead) handleMarkAsRead(n._id);
                            setShowNotifications(false);
                            navigate(user.role === 'admin' ? `/admin/complaints/${n.complaint._id}` : `/complaints/${n.complaint._id}`);
                          }}
                          className={`px-4 py-3 hover:bg-zinc-800/40 border-b border-zinc-850/50 cursor-pointer flex gap-3 transition-colors ${
                            !n.isRead ? 'bg-indigo-950/20 font-medium' : ''
                          }`}
                        >
                          <div className="flex-1">
                            <h4 className="text-xs font-bold text-slate-200">{n.title}</h4>
                            <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{n.message}</p>
                            <span className="text-[9px] text-slate-500 block mt-1">
                              {new Date(n.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          {!n.isRead && (
                            <span className="w-1.5 h-1.5 bg-brand-500 rounded-full mt-1.5 flex-shrink-0"></span>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar / Link */}
            <div className="flex items-center gap-3 pl-3 border-l border-zinc-850">
              <Link to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} className="flex items-center gap-2.5 group">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-9 h-9 rounded-full object-cover border-2 border-brand-500/20 group-hover:border-brand-500 transition-colors"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-indigo-950 text-indigo-400 font-extrabold flex items-center justify-center text-sm border border-indigo-900/40 group-hover:bg-indigo-900 transition-colors">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="hidden md:block text-left">
                  <span className="text-xs font-bold text-slate-200 block leading-tight">{user.name}</span>
                  <span className="text-[10px] text-slate-400 block">{user.email}</span>
                </div>
              </Link>

              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 rounded-lg transition-colors ml-2 cursor-pointer"
                title="Log out"
              >
                <LogOut size={18} />
              </button>
            </div>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
