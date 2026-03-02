const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/auth');
const {
  getDashboard,
  getAllOrders,
  updateOrderStatus,
  getAllUsers,
  toggleUserStatus
} = require('../controllers/adminController');

// All admin routes are protected + admin-only
router.use(protect, restrictTo('admin'));

router.get('/dashboard',                getDashboard);
router.get('/orders',                   getAllOrders);
router.put('/orders/:id/status',        updateOrderStatus);
router.get('/users',                    getAllUsers);
router.put('/users/:id/toggle',         toggleUserStatus);

module.exports = router;
