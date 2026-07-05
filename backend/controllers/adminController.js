const User = require('../models/User');

// @desc    Get all registered users (Admin only)
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getUsers = async (req, res, next) => {
  try {
    let query = { role: 'citizen' }; // default to showing citizens

    if (req.query.role) {
      query.role = req.query.role;
    }

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
      ];
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: users.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Block or Unblock a user (Admin only)
// @route   PUT /api/admin/users/:id/block
// @access  Private (Admin)
exports.toggleUserBlock = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Prevent blocking self
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot block your own admin account' });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User has been successfully ${user.isBlocked ? 'blocked' : 'unblocked'}`,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change a user role (Admin only)
// @route   PUT /api/admin/users/:id/role
// @access  Private (Admin)
exports.changeUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;

    if (!role || !['citizen', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Please specify a valid role (citizen or admin)' });
    }

    let user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Prevent modifying self
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot modify your own role' });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User role updated to ${role}`,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
