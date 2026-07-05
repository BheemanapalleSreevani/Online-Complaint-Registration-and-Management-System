const express = require('express');
const { getUsers, toggleUserBlock, changeUserRole } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/users', getUsers);
router.put('/users/:id/block', toggleUserBlock);
router.put('/users/:id/role', changeUserRole);

module.exports = router;
