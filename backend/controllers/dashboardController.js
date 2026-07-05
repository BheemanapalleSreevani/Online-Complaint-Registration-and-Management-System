const Complaint = require('../models/Complaint');
const User = require('../models/User');
const Feedback = require('../models/Feedback');
const Category = require('../models/Category');

// @desc    Get user/citizen dashboard statistics
// @route   GET /api/dashboard/citizen
// @access  Private (Citizen)
exports.getUserDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const total = await Complaint.countDocuments({ citizen: userId });
    const pending = await Complaint.countDocuments({ citizen: userId, status: { $in: ['Submitted', 'Under Review'] } });
    const inProgress = await Complaint.countDocuments({ citizen: userId, status: 'In Progress' });
    const resolved = await Complaint.countDocuments({ citizen: userId, status: 'Resolved' });
    const closed = await Complaint.countDocuments({ citizen: userId, status: 'Closed' });

    // Recent activity (latest 5 complaints submitted by citizen)
    const recentActivity = await Complaint.find({ citizen: userId })
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          total,
          pending,
          inProgress,
          resolved,
          closed,
        },
        recentActivity,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get system-wide admin dashboard statistics & chart data
// @route   GET /api/dashboard/admin
// @access  Private (Admin)
exports.getAdminDashboardStats = async (req, res, next) => {
  try {
    // Basic Counters
    const totalUsers = await User.countDocuments({ role: 'citizen' });
    const totalComplaints = await Complaint.countDocuments();
    const statusCounts = await Complaint.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const stats = {
      totalUsers,
      totalComplaints,
      Submitted: 0,
      UnderReview: 0,
      InProgress: 0,
      Resolved: 0,
      Closed: 0,
      Rejected: 0,
    };

    statusCounts.forEach((item) => {
      const statusKey = item._id.replace(/\s+/g, '');
      stats[statusKey] = item.count;
    });

    // 1. Complaints by Category
    const categoryStats = await Complaint.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'categoryDetails',
        },
      },
      {
        $unwind: '$categoryDetails',
      },
      {
        $project: {
          name: '$categoryDetails.name',
          count: 1,
        },
      },
    ]);

    // 2. Monthly Complaint Trends (Past 6 months)
    const monthlyTrends = await Complaint.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 6 },
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const trendData = monthlyTrends.map((trend) => {
      return {
        month: `${monthNames[trend._id.month - 1]} ${trend._id.year}`,
        count: trend.count,
      };
    });

    // 3. Average Resolution Time (in days)
    // Find complaints with a 'Resolved' or 'Closed' entry in their timeline
    const resolvedComplaints = await Complaint.find({
      status: { $in: ['Resolved', 'Closed'] },
    });

    let totalResolutionTimeMs = 0;
    let resolvedCount = 0;

    resolvedComplaints.forEach((comp) => {
      const resolvedLog = comp.timeline.find(
        (log) => log.status === 'Resolved' || log.status === 'Closed'
      );
      if (resolvedLog) {
        totalResolutionTimeMs += new Date(resolvedLog.createdAt) - new Date(comp.createdAt);
        resolvedCount++;
      }
    });

    const averageResolutionTimeDays =
      resolvedCount > 0 ? (totalResolutionTimeMs / (1000 * 60 * 60 * 24) / resolvedCount).toFixed(1) : 0;

    // 4. User Satisfaction Rating Breakdown
    const feedbacks = await Feedback.find();
    const averageSatisfaction =
      feedbacks.length > 0
        ? (feedbacks.reduce((acc, curr) => acc + curr.rating, 0) / feedbacks.length).toFixed(1)
        : 0;

    // Build distribution
    const ratingDistribution = [
      { rating: '5 Star', count: 0 },
      { rating: '4 Star', count: 0 },
      { rating: '3 Star', count: 0 },
      { rating: '2 Star', count: 0 },
      { rating: '1 Star', count: 0 },
    ];
    feedbacks.forEach((f) => {
      if (f.rating >= 1 && f.rating <= 5) {
        ratingDistribution[5 - f.rating].count++;
      }
    });

    // List of unregistered users or registered users list for management
    const recentUsers = await User.find({ role: 'citizen' })
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        stats,
        categoryStats,
        trendData,
        averageResolutionTimeDays: parseFloat(averageResolutionTimeDays),
        averageSatisfaction: parseFloat(averageSatisfaction),
        ratingDistribution,
        recentUsers,
      },
    });
  } catch (error) {
    next(error);
  }
};
