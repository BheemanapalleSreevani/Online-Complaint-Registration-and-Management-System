import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { User, Lock, Mail, Phone, ShieldAlert, ArrowLeft, Key } from 'lucide-react';

const Register = () => {
  const { register, isAuthenticated, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminAccessKey, setAdminAccessKey] = useState('');

  useEffect(() => {
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

    if (!name || !email || !phone || !password) {
      setErrorMsg('Please fill in all the required fields.');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    if (isAdmin && !adminAccessKey) {
      setErrorMsg('Please enter the Admin Security Access Key.');
      setLoading(false);
      return;
    }

    const result = await register(name, email, password, phone, isAdmin ? 'admin' : 'citizen', adminAccessKey);
    setLoading(false);

    if (result && !result.success) {
      setErrorMsg(result.message);
    } else {
      if (result && result.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4 py-8 relative overflow-hidden text-slate-100">
      {/* Decorative Premium Blur Backgrounds */}
      <div className="absolute top-10 -left-10 w-72 h-72 bg-brand-500/10 rounded-full mix-blend-screen filter blur-[100px] opacity-30 animate-pulse"></div>
      <div className="absolute -bottom-10 right-10 w-72 h-72 bg-indigo-500/10 rounded-full mix-blend-screen filter blur-[100px] opacity-30 animate-pulse"></div>

      <div className="w-full max-w-md bg-zinc-900 rounded-3xl border border-zinc-800 shadow-2xl p-8 relative z-10 hover:shadow-indigo-500/5 transition-all duration-500">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-300 mb-6 transition-all duration-200 hover:-translate-x-1">
          <ArrowLeft size={14} /> Back to Home
        </Link>

        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white font-extrabold text-xl mx-auto shadow-lg shadow-brand-500/25 transform hover:rotate-12 transition-transform duration-300">
            OC
          </div>
          <h2 className="text-2xl font-extrabold text-slate-100 mt-4 tracking-tight">Create Account</h2>
          <p className="text-zinc-500 text-xs mt-1">Register to access the online grievance portal</p>
        </div>

        {/* Role Select Tabs */}
        <div className="mt-6 flex bg-zinc-950 p-1.5 rounded-xl border border-zinc-850">
          <button
            type="button"
            onClick={() => {
              setIsAdmin(false);
              setErrorMsg('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-300 cursor-pointer ${
              !isAdmin ? 'bg-zinc-900 text-brand-400 border border-zinc-850 shadow-sm scale-100' : 'text-zinc-500 hover:text-zinc-300 scale-95'
            }`}
          >
            Citizen Sign Up
          </button>
          <button
            type="button"
            onClick={() => {
              setIsAdmin(true);
              setErrorMsg('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-300 cursor-pointer ${
              isAdmin ? 'bg-zinc-900 text-brand-400 border border-zinc-850 shadow-sm scale-100' : 'text-zinc-500 hover:text-zinc-300 scale-95'
            }`}
          >
            Officer Sign Up
          </button>
        </div>

        {errorMsg && (
          <div className="mt-6 p-4 bg-rose-500/10 border border-rose-500/25 rounded-xl flex gap-3 text-rose-400 text-xs font-semibold animate-bounce">
            <ShieldAlert size={16} className="shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-zinc-400">Full Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-3.5 text-zinc-500" size={16} />
              <input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 hover:bg-zinc-850/30 transition-all font-medium text-slate-200 placeholder:text-zinc-650"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-zinc-400">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 text-zinc-500" size={16} />
              <input
                type="email"
                placeholder={isAdmin ? "officer@complaints.com" : "john@example.com"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 hover:bg-zinc-850/30 transition-all font-medium text-slate-200 placeholder:text-zinc-650"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-zinc-400">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-3.5 text-zinc-500" size={16} />
              <input
                type="text"
                placeholder="+919876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 hover:bg-zinc-850/30 transition-all font-medium text-slate-200 placeholder:text-zinc-650"
                required
              />
            </div>
          </div>

          {isAdmin && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-zinc-400">Security Access Key</label>
              <div className="relative">
                <Key className="absolute left-3.5 top-3.5 text-zinc-500" size={16} />
                <input
                  type="password"
                  placeholder="Enter admin verification key"
                  value={adminAccessKey}
                  onChange={(e) => setAdminAccessKey(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 hover:bg-zinc-850/30 transition-all font-medium text-slate-200 placeholder:text-zinc-650"
                  required
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-zinc-400">Account Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 text-zinc-500" size={16} />
              <input
                type="password"
                placeholder="•••••••• (Min 6 chars)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 hover:bg-zinc-850/30 transition-all font-medium text-slate-200 placeholder:text-zinc-650"
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
              isAdmin ? 'Register Admin Account' : 'Create Free Account'
            )}
          </button>
        </form>

        <div className="text-center mt-6">
          <span className="text-zinc-500 text-xs font-medium">Already registered? </span>
          <Link to="/login" className="text-brand-400 hover:text-brand-300 hover:underline text-xs font-bold transition-colors">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
