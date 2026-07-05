import React, { useState, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Lock, CheckCircle2, ShieldAlert } from 'lucide-react';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { updateUserInfo } = useContext(AuthContext); // to update token if returned

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setErrorMsg('');

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const res = await authAPI.resetPassword(token, { password });
      setLoading(false);
      if (res.data && res.data.success) {
        setMessage('Your password has been successfully reset.');
        // Set token inside localStorage
        localStorage.setItem('token', res.data.token);
        setTimeout(() => {
          window.location.href = '/dashboard'; // reload and trigger session
        }, 1500);
      }
    } catch (err) {
      setLoading(false);
      setErrorMsg(err.response?.data?.message || 'Token is invalid or has expired.');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4 relative overflow-hidden text-slate-100">
      <div className="w-full max-w-md bg-zinc-900 rounded-3xl border border-zinc-800 shadow-2xl p-8 relative z-10">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white font-extrabold text-xl mx-auto shadow-lg shadow-brand-500/25">
            OC
          </div>
          <h2 className="text-2xl font-extrabold text-slate-100 mt-4 tracking-tight">Create New Password</h2>
          <p className="text-zinc-500 text-xs mt-1">Please enter your new password to secure your account</p>
        </div>

        {message && (
          <div className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/25 rounded-xl flex gap-3 text-emerald-400 text-xs font-semibold leading-relaxed">
            <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
            <span>{message} Redirecting to your portal...</span>
          </div>
        )}

        {errorMsg && (
          <div className="mt-6 p-4 bg-rose-500/10 border border-rose-500/25 rounded-xl flex gap-3 text-rose-400 text-xs font-semibold leading-relaxed">
            <ShieldAlert size={16} className="shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {!message && (
          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-zinc-400">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 text-zinc-500" size={16} />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-slate-200 placeholder:text-zinc-605"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-zinc-400">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 text-zinc-500" size={16} />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-slate-200 placeholder:text-zinc-605"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-2 py-3.5 font-bold text-sm bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 shadow-lg shadow-brand-500/10 cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Update & Sign In'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
