import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Lock, Mail, ShieldAlert, ArrowLeft } from 'lucide-react';

const Login = () => {
  const { login, adminLogin, isAuthenticated, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Enable admin tab if URL search parameter admin=true is set
    if (searchParams.get('admin') === 'true') {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, [searchParams]);

  useEffect(() => {
    // Redirect if already logged in
    if (isAuthenticated && user) {
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      setLoading(false);
      return;
    }

    const action = isAdmin ? adminLogin : login;
    const result = await action(email, password);

    setLoading(false);

    if (result && !result.success) {
      setErrorMsg(result.message);
    } else if (result && result.success) {
      if (result.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4 relative overflow-hidden text-slate-800">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-10 -left-10 w-72 h-72 bg-brand-500/5 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-pulse"></div>
      <div className="absolute -bottom-10 right-10 w-72 h-72 bg-teal-brand/5 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-pulse"></div>

      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/80 shadow-xl p-8 relative z-10 hover:shadow-2xl transition-all duration-500 shadow-slate-100/50">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-700 mb-6 transition-all duration-200 hover:-translate-x-1">
          <ArrowLeft size={14} /> Back to Home
        </Link>

        {/* Brand headers */}
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white font-extrabold text-xl mx-auto shadow-lg shadow-brand-500/25 transform hover:rotate-12 transition-transform duration-300">
            OC
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 mt-4 tracking-tight">Welcome Back</h2>
          <p className="text-slate-450 text-xs mt-1 font-medium">Please authenticate to continue to your dashboard</p>
        </div>

        {/* Role Select Tabs */}
        <div className="mt-8 flex bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
          <button
            type="button"
            onClick={() => {
              setIsAdmin(false);
              setErrorMsg('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-300 cursor-pointer ${
              !isAdmin ? 'bg-white text-brand-600 border border-slate-200/60 shadow-sm scale-100' : 'text-slate-500 hover:text-slate-800 scale-95'
            }`}
          >
            Citizen Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsAdmin(true);
              setErrorMsg('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-300 cursor-pointer ${
              isAdmin ? 'bg-white text-brand-600 border border-slate-200/60 shadow-sm scale-100' : 'text-slate-500 hover:text-slate-800 scale-95'
            }`}
          >
            Officer Sign In
          </button>
        </div>

        {/* Error notification block */}
        {errorMsg && (
          <div className="mt-6 p-4 bg-rose-50 border border-rose-100 rounded-xl flex gap-3 text-rose-600 text-xs font-semibold animate-bounce leading-relaxed">
            <ShieldAlert size={16} className="shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form elements */}
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-650">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
              <input
                type="email"
                placeholder={isAdmin ? "officer@complaints.com" : "citizen@complaints.com"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 hover:bg-slate-50/50 transition-all font-medium text-slate-800 placeholder:text-slate-400"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-650">Account Password</label>
              {!isAdmin && (
                <Link to="/forgot-password" className="text-[11px] font-bold text-brand-600 hover:text-brand-700 hover:underline transition-colors">
                  Forgot Password?
                </Link>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 hover:bg-slate-50/50 transition-all font-medium text-slate-800 placeholder:text-slate-400"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full mt-2 py-3.5 font-bold text-sm bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 active:scale-[0.98] shadow-lg shadow-brand-500/10 transition-all duration-300 cursor-pointer"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              isAdmin ? 'Sign In as Officer' : 'Secure Citizen Sign In'
            )}
          </button>
        </form>

        <div className="text-center mt-6 flex flex-col gap-2">
          {!isAdmin ? (
            <div>
              <span className="text-slate-500 text-xs font-medium">New user? </span>
              <Link to="/register" className="text-brand-600 hover:text-brand-700 hover:underline text-xs font-bold transition-colors">
                Create Free Account
              </Link>
            </div>
          ) : (
            <div>
              <span className="text-slate-500 text-xs font-medium">New officer? </span>
              <Link to="/register?admin=true" className="text-brand-600 hover:text-brand-700 hover:underline text-xs font-bold transition-colors">
                Register Admin Account
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
