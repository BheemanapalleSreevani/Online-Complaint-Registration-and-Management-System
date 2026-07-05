const Feedback = require('../models/Feedback');
const Complaint = require('../models/Complaint');
const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Submit rating feedback for a resolved/closed complaint
// @route   POST /api/feedback
// @access  Private (Citizen)
exports.submitFeedback = async (req, res, next) => {
  try {
    const { complaintId, rating, comments } = req.body;

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    // Verify owner
    if (complaint.citizen.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Check status
    if (complaint.status !== 'Resolved' && complaint.status !== 'Closed') {
      return res.status(400).json({ success: false, message: 'Feedback can only be submitted for Resolved or Closed complaints' });
    }

    // Check if feedback already submitted
    const feedbackExists = await Feedback.findOne({ complaint: complaintId });
    if (feedbackExists) {
      return res.status(400).json({ success: false, message: 'Feedback has already been submitted for this complaint' });
    }

    const feedback = await Feedback.create({
      complaint: complaintId,
      user: req.user.id,
      rating,
      comments,
    });

    // Notify assigned admin or system admins
    const message = `Citizen ${req.user.name} submitted a feedback rating of ${rating}/5 for complaint: "${complaint.title}"`;
    if (complaint.assignedTo) {
      await Notification.create({
        recipient: complaint.assignedTo,
        sender: req.user.id,
        title: 'New Feedback Received',
        message,
        complaint: complaint._id,
      });
    } else {
      const admins = await User.find({ role: 'admin' });
      const notifyPromises = admins.map((admin) => {
        return Notification.create({
          recipient: admin._id,
          sender: req.user.id,
          title: 'New Feedback Received',
          message,
          complaint: complaint._id,
        });
      });
      await Promise.all(notifyPromises);
    }

    res.status(201).json({ success: true, data: feedback });
  } catch (error) {
    next(error);
  }
};

// @desc    Get feedback for a single complaint
// @route   GET /api/feedback/complaint/:complaintId
// @access  Private
exports.getFeedbackForComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.complaintId);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    // Citizen check
    if (req.user.role === 'citizen' && complaint.citizen.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const feedback = await Feedback.findOne({ complaint: req.params.complaintId }).populate('user', 'name email');

    res.status(200).json({ success: true, data: feedback });
  } catch (error) {
    next(error);
  }
};
