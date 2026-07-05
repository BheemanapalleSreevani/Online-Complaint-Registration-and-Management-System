const express = require('express');
const { submitFeedback, getFeedbackForComplaint } = require('../controllers/feedbackController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/', authorize('citizen'), submitFeedback);
router.get('/complaint/:complaintId', getFeedbackForComplaint);

module.exports = router;
