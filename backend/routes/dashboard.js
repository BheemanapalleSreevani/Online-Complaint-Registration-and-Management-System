const express = require('express');
const { getUserDashboardStats, getAdminDashboardStats } = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/citizen', authorize('citizen'), getUserDashboardStats);
router.get('/admin', authorize('admin'), getAdminDashboardStats);

module.exports = router;
