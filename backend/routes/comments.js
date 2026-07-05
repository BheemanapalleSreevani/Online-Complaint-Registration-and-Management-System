const express = require('express');
const { addComment, getComments } = require('../controllers/commentController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/', addComment);
router.get('/complaint/:complaintId', getComments);

module.exports = router;
