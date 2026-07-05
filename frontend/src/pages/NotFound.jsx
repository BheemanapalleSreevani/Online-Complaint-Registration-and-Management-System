import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-6 text-center text-slate-100">
      <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-450 shadow-sm animate-bounce mb-6">
        <AlertCircle size={32} />
      </div>
      <h1 className="text-4xl font-extrabold text-slate-100 tracking-tight">404 - Page Not Found</h1>
      <p className="text-zinc-500 text-sm mt-3 max-w-md">
        The requested address does not exist or has been relocated by system administrator.
      </p>
      <Link to="/" className="btn-primary mt-8 py-2.5 px-6 font-bold text-xs cursor-pointer flex items-center justify-center gap-1.5">
        <ArrowLeft size={14} /> Back to Homepage
      </Link>
    </div>
  );
};

export default NotFound;
