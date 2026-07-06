import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { complaintsAPI, commentsAPI, feedbackAPI } from '../services/api';
import {
  Download,
  MessageSquare,
  Send,
  Star,
  CheckCircle,
  HelpCircle,
  FileText,
  MapPin,
  Calendar,
  AlertTriangle,
  ArrowLeft,
  X,
  RotateCcw
} from 'lucide-react';

const ComplaintDetails = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  
  const [complaint, setComplaint] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [feedback, setFeedback] = useState(null);
  
  // Feedback form state
  const [rating, setRating] = useState(5);
  const [feedbackComments, setFeedbackComments] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackError, setFeedbackError] = useState('');

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const loadData = async () => {
    try {
      const resComp = await complaintsAPI.getDetails(id);
      if (resComp.data && resComp.data.success) {
        setComplaint(resComp.data.data);
      }

      const resComm = await commentsAPI.getByComplaint(id);
      if (resComm.data && resComm.data.success) {
        setComments(resComm.data.data);
      }

      // Fetch feedback if resolved/closed
      if (resComp.data.data.status === 'Resolved' || resComp.data.data.status === 'Closed') {
        try {
          const resFeed = await feedbackAPI.getByComplaint(id);
          if (resFeed.data && resFeed.data.success) {
            setFeedback(resFeed.data.data);
          }
        } catch (feedErr) {
          // feedback might not exist yet, that's fine
        }
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Grievance record not found.');
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

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setFeedbackError('');
    setSubmittingFeedback(true);

    try {
      const res = await feedbackAPI.submit({
        complaintId: id,
        rating,
        comments: feedbackComments,
      });
      if (res.data && res.data.success) {
        setFeedback(res.data.data);
      }
    } catch (err) {
      setFeedbackError(err.response?.data?.message || 'Failed to submit review.');
    }
    setSubmittingFeedback(false);
  };

  const handleCloseReopen = async (action, commentsText) => {
    try {
      const res = await complaintsAPI.closeOrReopen(id, {
        action,
        comments: commentsText,
      });
      if (res.data && res.data.success) {
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="flex-1 p-6 text-center text-slate-800">
        <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mx-auto mb-4">
          <AlertTriangle size={24} />
        </div>
        <h3 className="font-extrabold text-slate-900 text-lg">Failed to load complaint</h3>
        <p className="text-slate-500 text-xs mt-1">{errorMsg}</p>
        <Link to="/my-complaints" className="btn-primary inline-flex mt-6 py-2 px-4 text-xs font-bold shadow-sm cursor-pointer">
          Return to list
        </Link>
      </div>
    );
  }

  const getStatusColor = (s) => {
    switch (s) {
      case 'Submitted': return 'text-blue-600 border-blue-200 bg-blue-50';
      case 'Under Review': return 'text-orange-brand border-orange-200 bg-orange-50';
      case 'In Progress': return 'text-violet-600 border-violet-200 bg-violet-50';
      case 'Resolved': return 'text-teal-600 border-teal-200 bg-teal-50';
      case 'Closed': return 'text-slate-600 border-slate-200 bg-slate-100';
      case 'Rejected': return 'text-rose-600 border-rose-200 bg-rose-50';
      default: return 'text-slate-500 bg-slate-100';
    }
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto animate-fade-in flex flex-col gap-6 max-w-6xl mx-auto w-full text-slate-800">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div className="flex items-center gap-3">
          <Link to="/my-complaints" className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <span className="text-xs font-extrabold text-brand-600 uppercase tracking-widest">{complaint.complaintId}</span>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight mt-0.5">{complaint.title}</h2>
          </div>
        </div>

        {/* PDF Receipt Download Action */}
        <a
          href={`${complaintsAPI.getReceiptUrl(complaint._id)}?token=${localStorage.getItem('token')}`}
          target="_blank"
          rel="noreferrer"
          className="btn-secondary py-2 px-4 text-xs font-bold bg-white text-slate-700 hover:text-brand-600 border border-slate-200 cursor-pointer shrink-0"
        >
          <Download size={14} /> Download Receipt (PDF)
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Complaint Details */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col gap-5 shadow-slate-100/50">
            {/* Meta values */}
            <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-400 pb-4 border-b border-slate-100">
              <span className="flex items-center gap-1"><Calendar size={14} /> Filed: {new Date(complaint.createdAt).toLocaleDateString()}</span>
              <span className="flex items-center gap-1"><MapPin size={14} /> Location: {complaint.location}</span>
              <span className="flex items-center gap-1">Category: <span className="text-slate-800 font-extrabold ml-0.5">{complaint.category?.name}</span></span>
              <span className="flex items-center gap-1">Priority: <span className="text-slate-800 font-extrabold ml-0.5">{complaint.priority}</span></span>
            </div>

            {/* Description Text */}
            <div>
              <h3 className="text-xs font-bold text-slate-450 uppercase tracking-wider">Grievance Description</h3>
              <p className="text-sm font-medium text-slate-650 mt-2 leading-relaxed whitespace-pre-wrap">{complaint.description}</p>
            </div>

            {/* Attachments */}
            {complaint.attachments && complaint.attachments.length > 0 && (
              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-450 uppercase tracking-wider mb-3">Supporting Attachments</h3>
                <div className="flex flex-wrap gap-3">
                  {complaint.attachments.map((url, idx) => {
                    const isImg = /\.(jpg|jpeg|png|gif)$/i.test(url);
                    return (
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
                          <span className="block text-[8px] text-slate-400 uppercase font-semibold">{isImg ? 'Image' : 'Document'}</span>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Resolution Notes Block */}
            {complaint.resolutionNotes && (
              <div className="mt-4 p-5 bg-teal-50 border border-teal-200/50 rounded-2xl flex flex-col gap-1.5 animate-fade-in shadow-sm">
                <h4 className="text-xs font-extrabold text-teal-650 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle size={14} className="text-teal-600" /> Resolution Updates from Officer
                </h4>
                <p className="text-sm text-teal-800 font-semibold leading-relaxed">{complaint.resolutionNotes}</p>
              </div>
            )}

            {/* Action buttons (Close/Reopen) */}
            {complaint.status === 'Resolved' && (
              <div className="pt-5 border-t border-slate-100 flex gap-3 flex-wrap">
                <button
                  onClick={() => handleCloseReopen('close', 'Citizen confirmed resolution.')}
                  className="btn-primary py-2 px-6 text-xs font-bold flex-1 cursor-pointer"
                >
                  <CheckCircle size={14} /> Accept & Close Complaint
                </button>
                <button
                  onClick={() => {
                    const rsn = prompt('Please specify why you are reopening the issue:');
                    if (rsn) handleCloseReopen('reopen', rsn);
                  }}
                  className="btn-secondary py-2 px-6 text-xs font-bold bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 flex-1 cursor-pointer"
                >
                  <RotateCcw size={14} /> Reopen Complaint
                </button>
              </div>
            )}
            {complaint.status === 'Closed' && (
              <div className="pt-5 border-t border-slate-100 text-center">
                <p className="text-xs text-slate-500 font-bold">This grievance is closed. If issues recur, you can reopen it.</p>
                <button
                  onClick={() => {
                    const rsn = prompt('Provide reopening reasons:');
                    if (rsn) handleCloseReopen('reopen', rsn);
                  }}
                  className="btn-secondary py-1.5 px-5 text-xs font-bold bg-rose-55 text-rose-600 border border-rose-200 hover:bg-rose-100 mx-auto mt-3 cursor-pointer"
                >
                  <RotateCcw size={12} /> Reopen Ticket
                </button>
              </div>
            )}
          </div>

          {/* Stepper Visual Timeline */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm shadow-slate-100/50">
            <h3 className="text-xs font-bold text-slate-450 uppercase tracking-wider mb-6">Status Change Logs</h3>
            <div className="relative pl-6 border-l-2 border-slate-200 flex flex-col gap-6">
              {complaint.timeline.map((log, idx) => (
                <div key={idx} className="relative flex flex-col gap-1">
                  {/* Visual Bullet */}
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

        {/* Right Column: Comments chat and Ratings reviews */}
        <div className="flex flex-col gap-6">
          {/* Comments chat panel */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex flex-col h-[400px] shadow-slate-100/50">
            <h3 className="text-xs font-bold text-slate-450 uppercase tracking-wider pb-3 border-b border-slate-100">Direct Conversation</h3>
            
            {/* Conversation list */}
            <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-3">
              {comments.length === 0 ? (
                <p className="text-center text-slate-400 text-xs my-auto font-medium">Start dialogue with the executive officers regarding updates.</p>
              ) : (
                comments.map((comm) => {
                  const isOwn = comm.user._id === user.id;
                  return (
                    <div key={comm._id} className={`flex flex-col max-w-[85%] ${isOwn ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
                      <span className="text-[9px] font-bold text-slate-400 mb-0.5">{comm.user.name} ({comm.user.role})</span>
                      <div className={`p-3 rounded-2xl text-xs font-medium shadow-sm leading-relaxed ${
                        isOwn ? 'bg-brand-600 text-white rounded-tr-none' : 'bg-slate-50 border border-slate-200 text-slate-850 rounded-tl-none'
                      }`}>
                        {comm.text}
                      </div>
                      <span className="text-[8px] text-slate-400 block mt-0.5 font-medium">{new Date(comm.createdAt).toLocaleTimeString()}</span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input form */}
            <form onSubmit={handlePostComment} className="flex gap-2 pt-3 border-t border-slate-100">
              <input
                type="text"
                placeholder="Write your message..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-brand-500 text-slate-800"
              />
              <button type="submit" className="p-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl shadow-md transition-all active:scale-95 cursor-pointer">
                <Send size={14} />
              </button>
            </form>
          </div>

          {/* Ratings feedback panel */}
          {(complaint.status === 'Resolved' || complaint.status === 'Closed') && (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm shadow-slate-100/50">
              <h3 className="text-xs font-bold text-slate-450 uppercase tracking-wider pb-3 border-b border-slate-100">Satisfaction Feedback</h3>
              
              {feedback ? (
                <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-2 shadow-inner">
                  <div className="flex gap-1 text-amber-500">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={16} fill={s <= feedback.rating ? '#F59E0B' : 'transparent'} strokeWidth={2} />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-slate-700">Your rating: {feedback.rating} / 5</span>
                  <p className="text-xs font-medium text-slate-500 mt-1 italic leading-relaxed">"{feedback.comments || 'No comments written.'}"</p>
                </div>
              ) : (
                <form onSubmit={handleFeedbackSubmit} className="mt-4 flex flex-col gap-4">
                  {feedbackError && (
                    <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-semibold rounded-xl">{feedbackError}</div>
                  )}

                  {/* Stars select */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-bold text-slate-600">Rate department work:</span>
                    <div className="flex gap-1.5 mt-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setRating(s)}
                          className="p-1 hover:scale-110 transition-transform text-amber-500 cursor-pointer"
                        >
                          <Star size={24} fill={s <= rating ? '#F59E0B' : 'transparent'} strokeWidth={2} />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Comment */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-bold text-slate-600">Describe your review:</span>
                    <textarea
                      placeholder="Was the issue fixed correctly? Tell us about response speeds..."
                      value={feedbackComments}
                      onChange={(e) => setFeedbackComments(e.target.value)}
                      rows={3}
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none text-slate-800"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={submittingFeedback}
                    className="btn-primary w-full py-2.5 text-xs font-bold cursor-pointer"
                  >
                    Submit Feedback Rating
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetails;
