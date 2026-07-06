import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { User, Phone, CheckCircle2, AlertTriangle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const Profile = () => {
  const { user, updateUserInfo } = useContext(AuthContext);
  
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await authAPI.updateProfile({ name, phone, avatarUrl });
      setLoading(false);
      if (res.data && res.data.success) {
        updateUserInfo(res.data.data);
        setMessage('Your profile details have been successfully updated.');
      }
    } catch (err) {
      setLoading(false);
      setErrorMsg(err.response?.data?.message || 'Failed to update profile details.');
    }
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto animate-fade-in max-w-2xl mx-auto w-full text-slate-805">
      <Link to={user?.role === 'admin' ? '/admin/dashboard' : '/dashboard'} className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-slate-700 mb-6 transition-colors">
        <ArrowLeft size={14} /> Back to Dashboard
      </Link>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden p-6 md:p-8 shadow-slate-100/50">
        <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Account Profile</h2>
        <p className="text-slate-450 text-xs font-medium">Review your registration details and update profile parameters.</p>

        {message && (
          <div className="mt-6 p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex gap-3 text-emerald-600 text-xs font-semibold">
            <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
            <span>{message}</span>
          </div>
        )}

        {errorMsg && (
          <div className="mt-6 p-4 bg-rose-50 border border-rose-100 rounded-xl flex gap-3 text-rose-600 text-xs font-semibold animate-shake">
            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
          {/* Email (Readonly) */}
          <div className="flex flex-col gap-1.5 opacity-70">
            <label className="text-xs font-bold text-slate-500">Email Address (Read-only)</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-400 cursor-not-allowed"
            />
          </div>

          {/* Full Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-600">Display Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-slate-800 placeholder:text-slate-400"
                required
              />
            </div>
          </div>

          {/* Phone */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-600">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="+919876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-slate-800 placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Avatar URL */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-600">Profile Photo (Image Link)</label>
            <input
              type="text"
              placeholder="https://images.unsplash.com/..."
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-slate-800 placeholder:text-slate-400"
            />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full mt-4 py-3 font-bold text-sm shadow-md cursor-pointer"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Save Profile Updates'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
