import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { complaintsAPI, commentsAPI, adminAPI } from '../services/api';
import {
  ShieldAlert,
  Calendar,
  MapPin,
  FileText,
  User,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Send,
  Upload,
  Download
} from 'lucide-react';

const AdminComplaintDetails = () => {
  const { id } = useParams();
  const { user: loggedInAdmin } = useContext(AuthContext);

  const [complaint, setComplaint] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  
  // Administrative Operations states
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [assignedToId, setAssignedToId] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [message, setMessage] = useState(''); // Timeline message update
  const [files, setFiles] = useState([]);
  const [adminsList, setAdminsList] = useState([]); // List of admin officers to assign

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const loadData = async () => {
    try {
      const resComp = await complaintsAPI.getDetails(id);
      if (resComp.data && resComp.data.success) {
        const c = resComp.data.data;
        setComplaint(c);
        setStatus(c.status);
        setPriority(c.priority);
        setAssignedToId(c.assignedTo?._id || '');
        setResolutionNotes(c.resolutionNotes || '');
      }

      const resComm = await commentsAPI.getByComplaint(id);
      if (resComm.data && resComm.data.success) {
        setComments(resComm.data.data);
      }

      // Load admin lists for assignment
      const resAdmins = await adminAPI.getUsers({ role: 'admin' });
      if (resAdmins.data && resAdmins.data.success) {
        setAdminsList(resAdmins.data.data);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Grievance file not found in repository.');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const res = await commentsAPI.add({
        complaintId: id,
        text: newComment,
      });
      if (res.data && res.data.success) {
        setComments([...comments, res.data.data]);
        setNewComment('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdminUpdate = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    setUpdating(true);

    const formData = new FormData();
    formData.append('status', status);
    formData.append('priority', priority);
    if (assignedToId) formData.append('assignedToId', assignedToId);
    formData.append('resolutionNotes', resolutionNotes);
    if (message) formData.append('message', message);

    files.forEach((file) => {
      formData.append('attachments', file);
    });

    try {
      const res = await complaintsAPI.updateStatus(id, formData);
      setUpdating(false);
      if (res.data && res.data.success) {
        setSuccessMsg('Complaint details updated successfully.');
        setFiles([]);
        setMessage('');
        loadData();
      }
    } catch (err) {
      setUpdating(false);
      setErrorMsg(err.response?.data?.message || 'Failed to update details.');
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (errorMsg && !complaint) {
    return (
      <div className="flex-1 p-6 text-center text-slate-800">
        <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mx-auto mb-4 animate-shake">
          <AlertTriangle size={24} />
        </div>
        <h3 className="font-extrabold text-slate-900 text-lg">Complaint record not found</h3>
        <p className="text-slate-500 text-xs mt-1">{errorMsg}</p>
        <Link to="/admin/complaints" className="btn-primary inline-flex mt-6 py-2 px-4 text-xs font-bold cursor-pointer">
          Return to list
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 overflow-y-auto animate-fade-in flex flex-col gap-6 max-w-6xl mx-auto w-full text-slate-800">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <Link to="/admin/complaints" className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <span className="text-xs font-extrabold text-brand-600 uppercase tracking-widest">{complaint.complaintId}</span>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight mt-0.5">{complaint.title}</h2>
          </div>
        </div>

        <a
          href={`${complaintsAPI.getReceiptUrl(complaint._id)}?token=${localStorage.getItem('token')}`}
          target="_blank"
          rel="noreferrer"
          className="btn-secondary py-2 px-4 text-xs font-bold bg-white text-slate-700 cursor-pointer border border-slate-200 hover:bg-slate-50"
        >
          <Download size={14} /> Download Receipt (PDF)
        </a>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs font-semibold rounded-xl animate-fade-in">
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-semibold rounded-xl animate-shake">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Complaint details & updates */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-5 shadow-slate-100/50">
            {/* Meta values */}
            <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-400 pb-4 border-b border-slate-100">
              <span className="flex items-center gap-1"><Calendar size={14} /> Filed: {new Date(complaint.createdAt).toLocaleDateString()}</span>
              <span className="flex items-center gap-1"><MapPin size={14} /> Location: {complaint.location}</span>
              <span className="flex items-center gap-1">Citizen: <span className="text-slate-800 font-extrabold ml-0.5">{complaint.citizen?.name}</span></span>
              <span className="flex items-center gap-1">Category: <span className="text-slate-800 font-extrabold ml-0.5">{complaint.category?.name}</span></span>
            </div>

            {/* Description Text */}
            <div>
              <h3 className="text-xs font-bold text-slate-450 uppercase tracking-wider">Grievance Description</h3>
              <p className="text-sm font-medium text-slate-650 mt-2 leading-relaxed whitespace-pre-wrap">{complaint.description}</p>
            </div>

            {/* Attachments */}
            {complaint.attachments && complaint.attachments.length > 0 && (
              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-450 uppercase tracking-wider mb-3">Citizen Attachments</h3>
                <div className="flex flex-wrap gap-3">
                  {complaint.attachments.map((url, idx) => (
                    <a
                      key={idx}
                      href={`http://localhost:5000${url}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl hover:border-brand-500 transition-colors flex items-center gap-2 max-w-[200px] shadow-sm"
                    >
                      <FileText size={18} className="text-brand-600" />
                      <div className="truncate text-[10px] font-bold text-slate-700">
                        <span>Attachment {idx + 1}</span>
                        <span className="block text-[8px] text-slate-400 uppercase font-semibold">Attached File</span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Stepper logs timeline */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm shadow-slate-100/50">
            <h3 className="text-xs font-bold text-slate-450 uppercase tracking-wider mb-6">Status Change History</h3>
            <div className="relative pl-6 border-l-2 border-slate-200 flex flex-col gap-6">
              {complaint.timeline.map((log, idx) => (
                <div key={idx} className="relative flex flex-col gap-1">
                  <span className={`absolute -left-[31px] top-0 w-4.5 h-4.5 rounded-full border flex items-center justify-center ${
                    log.status === 'Resolved' || log.status === 'Closed'
                      ? 'bg-teal-50 border-teal-200 text-teal-600'
                      : log.status === 'Rejected'
                      ? 'bg-rose-50 border-rose-200 text-rose-600'
                      : 'bg-brand-50 border-brand-200 text-brand-600'
                  }`}>
                    <span className="w-1.5 h-1.5 bg-current rounded-full"></span>
                  </span>
                  
                  <span className="text-[10px] font-bold uppercase text-slate-400">
                    {new Date(log.createdAt).toLocaleString()} | Updated By: {log.updatedBy?.name} ({log.updatedBy?.role})
                  </span>
                  <span className="text-xs font-extrabold text-slate-800">{log.status}</span>
                  <p className="text-xs text-slate-500 font-medium">{log.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Administrative Controls & Comments */}
        <div className="flex flex-col gap-6">
          {/* Admin action panel form */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm shadow-slate-100/50">
            <h3 className="text-xs font-bold text-slate-450 uppercase tracking-wider pb-3 border-b border-slate-150 flex items-center gap-1.5">
              <ShieldAlert size={14} className="text-brand-600" /> Administrative Operations
            </h3>

            <form onSubmit={handleAdminUpdate} className="mt-4 flex flex-col gap-4 text-xs">
              {/* Status select */}
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-600">Complaint Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs font-semibold text-slate-700 focus:outline-none"
                >
                  <option value="Submitted">Submitted</option>
                  <option value="Under Review">Under Review</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              {/* Priority select */}
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-600">Urgency Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs font-semibold text-slate-700 focus:outline-none"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              {/* Assigned Officer */}
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-600">Assigned Officer</label>
                <select
                  value={assignedToId}
                  onChange={(e) => setAssignedToId(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs font-semibold text-slate-700 focus:outline-none"
                >
                  <option value="">Unassigned</option>
                  {adminsList.map((adm) => (
                    <option key={adm._id} value={adm._id}>{adm.name}</option>
                  ))}
                </select>
              </div>

              {/* Timeline message */}
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-600">Timeline Update Message</label>
                <input
                  type="text"
                  placeholder="e.g. Officer visited site, bulbs replaced..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 font-medium text-slate-800 focus:outline-none"
                />
              </div>

              {/* Resolution Notes */}
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-600">Resolution Notes (Publicly visible)</label>
                <textarea
                  placeholder="Describe resolution notes details here..."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  rows={3}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 font-medium text-slate-800 focus:outline-none"
                ></textarea>
              </div>

              {/* Resolution File Upload */}
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-600 flex items-center gap-1"><Upload size={12} /> Upload supporting resolution documents</label>
                <input type="file" multiple onChange={handleFileChange} className="text-slate-500 bg-slate-50 border border-slate-200 p-2 rounded-xl" />
              </div>

              <button
                type="submit"
                disabled={updating}
                className="btn-primary w-full py-2.5 mt-2 text-xs font-bold cursor-pointer"
              >
                {updating ? 'Applying changes...' : 'Save Administrative Updates'}
              </button>
            </form>
          </div>

          {/* Comments panel */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col h-[350px] shadow-slate-100/50">
            <h3 className="text-xs font-bold text-slate-450 uppercase tracking-wider pb-3 border-b border-slate-100">Direct Chat with Citizen</h3>
            <div className="flex-1 overflow-y-auto py-3 flex flex-col gap-2.5">
              {comments.length === 0 ? (
                <p className="text-center text-slate-400 text-xs my-auto font-medium">Start dialogue with citizen regarding updates.</p>
              ) : (
                comments.map((comm) => {
                  const isOwn = comm.user._id === loggedInAdmin.id;
                  return (
                    <div key={comm._id} className={`flex flex-col max-w-[85%] ${isOwn ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
                      <span className="text-[8px] font-bold text-slate-400 mb-0.5">{comm.user.name} ({comm.user.role})</span>
                      <div className={`p-2.5 rounded-xl text-xs font-semibold shadow-sm leading-relaxed ${
                        isOwn ? 'bg-brand-600 text-white rounded-tr-none' : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-none'
                      }`}>
                        {comm.text}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <form onSubmit={handlePostComment} className="flex gap-2 pt-2 border-t border-slate-100">
              <input
                type="text"
                placeholder="Write reply..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none text-slate-800"
              />
              <button type="submit" className="p-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl active:scale-95 cursor-pointer">
                <Send size={14} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminComplaintDetails;
