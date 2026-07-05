const Complaint = require('../models/Complaint');
const Notification = require('../models/Notification');
const Category = require('../models/Category');
const User = require('../models/User');
const { generateComplaintReceipt } = require('../utils/pdf');
const sendEmail = require('../utils/mail');

// @desc    Register a new complaint
// @route   POST /api/complaints
// @access  Private (Citizen)
exports.createComplaint = async (req, res, next) => {
  try {
    const { title, description, category, location, priority } = req.body;

    // Validate category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(404).json({ success: false, message: 'Complaint category not found' });
    }

    // Process attachments from Multer if uploaded
    const attachments = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        // Construct accessible static url path
        attachments.push(`/uploads/${file.filename}`);
      });
    }

    const complaint = new Complaint({
      title,
      description,
      category,
      location,
      priority: priority || 'Low',
      citizen: req.user.id,
      attachments,
    });

    // Setup initial timeline audit entry
    complaint.timeline.push({
      status: 'Submitted',
      message: `Grievance registered online by ${req.user.name}.`,
      updatedBy: req.user.id,
    });

    await complaint.save();

    // Trigger Notification for Admin
    const adminUsers = await User.find({ role: 'admin' });
    const notificationPromises = adminUsers.map((admin) => {
      return Notification.create({
        recipient: admin._id,
        sender: req.user.id,
        title: 'New Complaint Submitted',
        message: `A new complaint "${title}" (ID: ${complaint.complaintId}) has been registered by ${req.user.name}.`,
        complaint: complaint._id,
      });
    });
    await Promise.all(notificationPromises);

    // Send email to Citizen
    await sendEmail({
      email: req.user.email,
      subject: `Complaint Registered Successfully - ${complaint.complaintId}`,
      message: `Dear ${req.user.name},\n\nYour complaint has been successfully registered. Here are the details:\n\nComplaint ID: ${complaint.complaintId}\nTitle: ${title}\nCategory: ${categoryExists.name}\nStatus: Submitted\n\nYou can track the progress on your citizen portal.`,
    });

    res.status(201).json({ success: true, data: complaint });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all complaints (Citizen: own only, Admin: all, with filters, search, pagination)
// @route   GET /api/complaints
// @access  Private
exports.getComplaints = async (req, res, next) => {
  try {
    let query = {};

    // Citizens can only view their own registered complaints
    if (req.user.role === 'citizen') {
      query.citizen = req.user.id;
    }

    // Filters
    if (req.query.status) {
      query.status = req.query.status;
    }
    if (req.query.priority) {
      query.priority = req.query.priority;
    }
    if (req.query.category) {
      query.category = req.query.category;
    }

    // Search filter (handles Complaint ID, Title, Location)
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query.$or = [
        { complaintId: searchRegex },
        { title: searchRegex },
        { location: searchRegex },
      ];
    }

    // Date range filter
    if (req.query.startDate && req.query.endDate) {
      query.createdAt = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate),
      };
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    let total = await Complaint.countDocuments(query);

    let complaints = await Complaint.find(query)
      .populate('category', 'name')
      .populate('citizen', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: complaints.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
      data: complaints,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get detailed single complaint info
// @route   GET /api/complaints/:id
// @access  Private
exports.getComplaintDetails = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('category', 'name description')
      .populate('citizen', 'name email phone avatarUrl')
      .populate('assignedTo', 'name email phone avatarUrl')
      .populate('timeline.updatedBy', 'name role');

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    // Ensure citizen only views their own complaint
    if (req.user.role === 'citizen' && complaint.citizen._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.status(200).json({ success: true, data: complaint });
  } catch (error) {
    next(error);
  }
};

// @desc    Update complaint status/details (Admin only)
// @route   PUT /api/complaints/:id/status
// @access  Private (Admin)
exports.updateComplaintStatus = async (req, res, next) => {
  try {
    const { status, message, priority, assignedToId, resolutionNotes } = req.body;
    let complaint = await Complaint.findById(req.params.id).populate('citizen', 'name email');

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    let statusUpdated = false;
    let updatedFields = {};

    // 1. Assign Priority
    if (priority && priority !== complaint.priority) {
      updatedFields.priority = priority;
      complaint.timeline.push({
        status: complaint.status,
        message: `Priority assigned to ${priority} by System Admin.`,
        updatedBy: req.user.id,
      });
    }

    // 2. Assign To Admin Officer
    if (assignedToId) {
      const staff = await User.findById(assignedToId);
      if (staff && staff.role === 'admin') {
        updatedFields.assignedTo = assignedToId;
        complaint.timeline.push({
          status: complaint.status,
          message: `Complaint assigned to officer ${staff.name}.`,
          updatedBy: req.user.id,
        });
      }
    }

    // 3. Update Status
    if (status && status !== complaint.status) {
      updatedFields.status = status;
      statusUpdated = true;
      
      const updateMsg = message || `Complaint status updated from ${complaint.status} to ${status} by admin.`;
      
      complaint.timeline.push({
        status: status,
        message: updateMsg,
        updatedBy: req.user.id,
      });

      // Send status change notification to Citizen
      await Notification.create({
        recipient: complaint.citizen._id,
        sender: req.user.id,
        title: `Complaint Status Updated: ${status}`,
        message: `Your complaint "${complaint.title}" (ID: ${complaint.complaintId}) has been updated to "${status}". Notes: ${updateMsg}`,
        complaint: complaint._id,
      });

      // Send email to Citizen
      await sendEmail({
        email: complaint.citizen.email,
        subject: `Complaint Status Updated - ${complaint.complaintId}`,
        message: `Dear ${complaint.citizen.name},\n\nYour complaint status has been updated to "${status}".\n\nDetails: ${updateMsg}\n\nThank you,\nOnline Grievance Cell.`,
      });
    }

    // 4. Add Resolution Notes
    if (resolutionNotes !== undefined) {
      updatedFields.resolutionNotes = resolutionNotes;
    }

    // Update attachments if admin uploads some documents
    if (req.files && req.files.length > 0) {
      const attachments = [...complaint.attachments];
      req.files.forEach((file) => {
        attachments.push(`/uploads/${file.filename}`);
      });
      updatedFields.attachments = attachments;
    }

    // Apply updates
    Object.assign(complaint, updatedFields);
    await complaint.save();

    res.status(200).json({ success: true, data: complaint });
  } catch (error) {
    next(error);
  }
};

// @desc    Close or Reopen complaint
// @route   PUT /api/complaints/:id/close-reopen
// @access  Private (Citizen or Admin)
exports.closeOrReopenComplaint = async (req, res, next) => {
  try {
    const { action, comments } = req.body; // action: 'close' or 'reopen'
    const complaint = await Complaint.findById(req.params.id).populate('citizen', 'name email');

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    // Citizen can close or reopen, Admin can close
    if (req.user.role === 'citizen' && complaint.citizen._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    if (action === 'close') {
      if (complaint.status === 'Closed') {
        return res.status(400).json({ success: false, message: 'Complaint is already closed' });
      }

      complaint.status = 'Closed';
      complaint.timeline.push({
        status: 'Closed',
        message: comments || 'Grievance closed and completed.',
        updatedBy: req.user.id,
      });

      // Notify citizen if admin closed it
      if (req.user.role === 'admin') {
        await Notification.create({
          recipient: complaint.citizen._id,
          sender: req.user.id,
          title: 'Complaint Closed',
          message: `Your complaint "${complaint.title}" (ID: ${complaint.complaintId}) has been closed by admin.`,
          complaint: complaint._id,
        });
      }
    } else if (action === 'reopen') {
      if (complaint.status !== 'Resolved' && complaint.status !== 'Closed') {
        return res.status(400).json({ success: false, message: 'Only resolved or closed complaints can be reopened' });
      }

      complaint.status = 'Under Review';
      complaint.timeline.push({
        status: 'Under Review',
        message: comments || 'Citizen was unsatisfied with the resolution and reopened the complaint.',
        updatedBy: req.user.id,
      });

      // Notify Admin
      const adminUsers = await User.find({ role: 'admin' });
      const notificationPromises = adminUsers.map((admin) => {
        return Notification.create({
          recipient: admin._id,
          sender: req.user.id,
          title: 'Complaint Reopened',
          message: `Complaint "${complaint.title}" (ID: ${complaint.complaintId}) has been reopened by the citizen.`,
          complaint: complaint._id,
        });
      });
      await Promise.all(notificationPromises);
    } else {
      return res.status(400).json({ success: false, message: 'Invalid action, choose close or reopen' });
    }

    await complaint.save();
    res.status(200).json({ success: true, data: complaint });
  } catch (error) {
    next(error);
  }
};

// @desc    Download complaint receipt as PDF
// @route   GET /api/complaints/:id/receipt
// @access  Private
exports.downloadReceipt = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('category', 'name')
      .populate('citizen', 'name email');

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    // Citizen can only access their receipt
    if (req.user.role === 'citizen' && complaint.citizen._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=receipt-${complaint.complaintId}.pdf`
    );

    generateComplaintReceipt(complaint, res);
  } catch (error) {
    next(error);
  }
};
