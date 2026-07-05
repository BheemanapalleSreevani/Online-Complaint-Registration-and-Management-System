const Comment = require('../models/Comment');
const Complaint = require('../models/Complaint');
const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Add comment to a complaint
// @route   POST /api/comments
// @access  Private
exports.addComment = async (req, res, next) => {
  try {
    const { complaintId, text } = req.body;

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    // Citizen can only comment on their own complaint
    if (req.user.role === 'citizen' && complaint.citizen.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const comment = await Comment.create({
      complaint: complaintId,
      user: req.user.id,
      text,
    });

    // Notify the other party
    if (req.user.role === 'citizen') {
      // Notify assigned admin or all admins if unassigned
      if (complaint.assignedTo) {
        await Notification.create({
          recipient: complaint.assignedTo,
          sender: req.user.id,
          title: 'New Comment from Citizen',
          message: `Citizen ${req.user.name} added a comment on complaint: "${complaint.title}"`,
          complaint: complaint._id,
        });
      } else {
        const admins = await User.find({ role: 'admin' });
        const notifyPromises = admins.map((admin) => {
          return Notification.create({
            recipient: admin._id,
            sender: req.user.id,
            title: 'New Comment from Citizen',
            message: `Citizen ${req.user.name} added a comment on complaint: "${complaint.title}"`,
            complaint: complaint._id,
          });
        });
        await Promise.all(notifyPromises);
      }
    } else {
      // Notify Citizen
      await Notification.create({
        recipient: complaint.citizen,
        sender: req.user.id,
        title: 'New Comment from Admin',
        message: `Admin ${req.user.name} replied on your complaint: "${complaint.title}"`,
        complaint: complaint._id,
      });
    }

    const populatedComment = await Comment.findById(comment._id).populate('user', 'name role avatarUrl');

    res.status(201).json({ success: true, data: populatedComment });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all comments for a complaint
// @route   GET /api/comments/complaint/:complaintId
// @access  Private
exports.getComments = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.complaintId);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    // Citizen can only access comments for their own complaint
    if (req.user.role === 'citizen' && complaint.citizen.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const comments = await Comment.find({ complaint: req.params.complaintId })
      .populate('user', 'name role avatarUrl')
      .sort({ createdAt: 1 }); // Oldest first

    res.status(200).json({ success: true, count: comments.length, data: comments });
  } catch (error) {
    next(error);
  }
};
