const Complaint = require('../models/Complaint');
const { generateExcelReport, generatePDFReport } = require('../utils/report');

// @desc    Export filtered complaints report as Excel or PDF (Admin only)
// @route   GET /api/reports/export
// @access  Private (Admin)
exports.exportReport = async (req, res, next) => {
  try {
    const { status, priority, category, startDate, endDate, search, format } = req.query;

    let query = {};

    if (status) {
      query.status = status;
    }
    if (priority) {
      query.priority = priority;
    }
    if (category) {
      query.category = category;
    }

    // Search query matching ID, Title or Location
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { complaintId: searchRegex },
        { title: searchRegex },
        { location: searchRegex },
      ];
    }

    // Date filters
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const complaints = await Complaint.find(query)
      .populate('category', 'name')
      .populate('citizen', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    if (format === 'excel') {
      return await generateExcelReport(complaints, res);
    } else if (format === 'pdf') {
      return generatePDFReport(complaints, res);
    } else {
      return res.status(400).json({ success: false, message: 'Please specify a valid format: excel or pdf' });
    }
  } catch (error) {
    next(error);
  }
};
