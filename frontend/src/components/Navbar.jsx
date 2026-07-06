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
    <nav className="sticky top-0 z-40 w-full glass-panel border-b border-slate-200/80 px-6 py-3 flex items-center justify-between shadow-sm">
      {/* Brand logo */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center shadow-md shadow-brand-500/25 text-white font-black text-lg tracking-wider transform hover:rotate-6 transition-all duration-300">
          OC
        </div>
        <div>
          <span className="font-extrabold text-slate-900 text-base block tracking-tight leading-tight">
            Grievance Portal
          </span>
          <span className="text-[10px] text-brand-600 font-bold tracking-wider uppercase block">
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
                ? 'bg-rose-50 text-rose-600 border border-rose-200' 
                : 'bg-brand-50 text-brand-600 border border-brand-200'
            }`}>
              {user.role === 'admin' && <ShieldAlert size={12} />}
              {user.role}
            </span>

            {/* Notifications Menu */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors relative cursor-pointer"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4.5 h-4.5 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-bounce border-2 border-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50 animate-fade-in">
                  <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-sm">Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[11px] font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-0.5 cursor-pointer"
                      >
                        <Check size={12} /> Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-6 text-center text-slate-400 text-xs">
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
                          className={`px-4 py-3 hover:bg-slate-50 border-b border-slate-100/50 cursor-pointer flex gap-3 transition-colors ${
                            !n.isRead ? 'bg-brand-50/40 font-medium' : ''
                          }`}
                        >
                          <div className="flex-1">
                            <h4 className="text-xs font-bold text-slate-800">{n.title}</h4>
                            <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">{n.message}</p>
                            <span className="text-[9px] text-slate-400 block mt-1 font-medium">
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
            <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
              <Link to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} className="flex items-center gap-2.5 group">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-9 h-9 rounded-full object-cover border-2 border-brand-200 group-hover:border-brand-500 transition-colors"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-brand-50 text-brand-650 font-extrabold flex items-center justify-center text-sm border border-brand-200/50 group-hover:bg-brand-100 transition-colors">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="hidden md:block text-left">
                  <span className="text-xs font-bold text-slate-800 block leading-tight group-hover:text-brand-600 transition-colors">{user.name}</span>
                  <span className="text-[10px] text-slate-400 block">{user.email}</span>
                </div>
              </Link>

              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors ml-2 cursor-pointer"
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
