const express = require('express');
const {
  createComplaint,
  getComplaints,
  getComplaintDetails,
  updateComplaintStatus,
  closeOrReopenComplaint,
  downloadReceipt,
} = require('../controllers/complaintController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/uploader');

const router = express.Router();

router.use(protect); // All routes are protected

router.route('/')
  .post(authorize('citizen'), upload.array('attachments', 5), createComplaint)
  .get(getComplaints);

router.route('/:id')
  .get(getComplaintDetails);

router.route('/:id/status')
  .put(authorize('admin'), upload.array('attachments', 5), updateComplaintStatus);

router.route('/:id/close-reopen')
  .put(closeOrReopenComplaint);

router.route('/:id/receipt')
  .get(downloadReceipt);

module.exports = router;
