import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Users, Clock, ArrowRight, Activity } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between relative overflow-hidden text-slate-800">
      {/* Decorative Ambient Background Blurs */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-brand-500/5 filter blur-[130px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-teal-brand/5 filter blur-[130px] pointer-events-none"></div>

      {/* Top Banner Header */}
      <header className="px-8 py-5 bg-white/70 border-b border-slate-200/80 flex items-center justify-between relative z-20 backdrop-blur-md shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white font-extrabold text-lg shadow-md shadow-brand-500/25 transform hover:rotate-12 transition-transform duration-300">
            OC
          </div>
          <div>
            <h1 className="font-extrabold text-slate-900 text-sm tracking-tight leading-tight">Online Grievance Cell</h1>
            <span className="text-[9px] text-brand-600 font-extrabold uppercase tracking-widest block mt-0.5">Government of India</span>
          </div>
        </div>
        <div className="flex items-center gap-5">
          <Link to="/login" className="text-xs font-bold text-slate-500 hover:text-brand-600 transition-colors uppercase tracking-wider">
            Sign In
          </Link>
          <Link to="/register" className="btn-primary py-2 px-5 text-xs font-bold shadow-md transform active:scale-95 transition-all cursor-pointer">
            Register Now
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-6xl mx-auto px-6 py-20 flex flex-col items-center justify-center text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-50 border border-brand-200/60 text-brand-600 text-xs font-extrabold rounded-full mb-8 shadow-sm animate-pulse">
          <Activity size={14} className="text-brand-600" />
          <span>Real-time Grievance Resolution Portal</span>
        </div>
        
        <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight max-w-4xl">
          Register & Track Your <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-indigo-600">Civic Complaints</span> Instantly
        </h2>
        
        <p className="mt-8 text-slate-500 text-base md:text-lg max-w-3xl font-medium leading-relaxed">
          A unified government portal for citizens to submit local public complaints, engage in direct dialogue with municipal executive officers, and export digitally verified receipts.
        </p>

        <div className="mt-12 flex flex-wrap gap-5 justify-center">
          <Link to="/register" className="btn-primary px-8 py-3.5 text-sm font-bold shadow-xl shadow-brand-500/20 transform hover:-translate-y-0.5 transition-all cursor-pointer">
            File a Grievance <ArrowRight size={16} />
          </Link>
          <Link to="/login" className="btn-secondary px-8 py-3.5 text-sm font-bold transform hover:-translate-y-0.5 transition-all cursor-pointer">
            Track Progress
          </Link>
        </div>

        {/* Feature stats */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
          <div className="p-8 bg-white rounded-3xl border border-slate-200/80 shadow-md hover:shadow-brand-500/5 hover:-translate-y-1 hover:border-brand-500/25 transition-all duration-300 text-left flex gap-5">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-650 shrink-0 shadow-sm">
              <Clock size={22} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">Rapid Response</h3>
              <p className="text-slate-500 text-xs mt-2 leading-relaxed font-medium">Automatic complaint routing to municipal authorities with regular real-time progress updates.</p>
            </div>
          </div>

          <div className="p-8 bg-white rounded-3xl border border-slate-200/80 shadow-md hover:shadow-brand-500/5 hover:-translate-y-1 hover:border-brand-500/25 transition-all duration-300 text-left flex gap-5">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-650 shrink-0 shadow-sm">
              <Users size={22} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">Direct Dialogue</h3>
              <p className="text-slate-500 text-xs mt-2 leading-relaxed font-medium">Engage in detailed discussions directly with administrative officers right inside ticket feeds.</p>
            </div>
          </div>

          <div className="p-8 bg-white rounded-3xl border border-slate-200/80 shadow-md hover:shadow-brand-500/5 hover:-translate-y-1 hover:border-brand-500/25 transition-all duration-300 text-left flex gap-5">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-650 shrink-0 shadow-sm">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">Verified Resolution</h3>
              <p className="text-slate-500 text-xs mt-2 leading-relaxed font-medium">Export official PDF grievance receipts and provide ratings to municipal resolution speed.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Admin Redirect Link Footer */}
      <footer className="w-full text-center py-6 border-t border-slate-200/80 bg-white relative z-20 shadow-inner">
        <p className="text-slate-500 text-xs font-semibold">
          © {new Date().getFullYear()} National Grievance Cell. Ministry of Public Grievances. | Are you a state officer?{' '}
          <Link to="/login?admin=true" className="text-brand-600 hover:text-brand-700 hover:underline font-bold transition-colors">
            Officer Dashboard Login
          </Link>
        </p>
      </footer>
    </div>
  );
};

export default Home;
