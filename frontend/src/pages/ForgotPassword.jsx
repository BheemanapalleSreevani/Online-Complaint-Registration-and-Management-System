import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { Mail, CheckCircle2, ShieldAlert, ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await authAPI.forgotPassword({ email });
      setLoading(false);
      if (res.data && res.data.success) {
        setMessage('A password reset link has been dispatched to your email address.');
      }
    } catch (err) {
      setLoading(false);
      setErrorMsg(err.response?.data?.message || 'Failed to dispatch email. Please check address.');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4 relative overflow-hidden text-slate-100">
      <div className="w-full max-w-md bg-zinc-900 rounded-3xl border border-zinc-800 shadow-2xl p-8 relative z-10">
        <Link to="/login" className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-500 hover:text-zinc-300 mb-6 transition-colors">
          <ArrowLeft size={14} /> Back to Sign In
        </Link>

        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white font-extrabold text-xl mx-auto shadow-lg shadow-brand-500/25">
            OC
          </div>
          <h2 className="text-2xl font-extrabold text-slate-100 mt-4 tracking-tight">Recover Password</h2>
          <p className="text-zinc-500 text-xs mt-1">Enter your registered email and we'll send you a password reset link</p>
        </div>

        {message && (
          <div className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/25 rounded-xl flex gap-3 text-emerald-400 text-xs font-semibold leading-relaxed">
            <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
            <span>{message}</span>
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
              <label className="text-xs font-bold text-zinc-400">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 text-zinc-500" size={16} />
                <input
                  type="email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                'Send Reset Link'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
