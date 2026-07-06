import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center px-6 text-center text-slate-800">
      <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shadow-sm animate-bounce mb-6">
        <AlertCircle size={32} />
      </div>
      <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">404 - Page Not Found</h1>
      <p className="text-slate-500 text-sm mt-3 max-w-md font-medium">
        The requested address does not exist or has been relocated by system administrator.
      </p>
      <Link to="/" className="btn-primary mt-8 py-2.5 px-6 font-bold text-xs cursor-pointer flex items-center justify-center gap-1.5">
        <ArrowLeft size={14} /> Back to Homepage
      </Link>
    </div>
  );
};

export default NotFound;
